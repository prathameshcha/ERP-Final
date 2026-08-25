// src/cron/attendanceAutoGenerate.ts
import { prisma } from '../config/database.js';
import { CronJob } from 'cron';
import { logger } from '../utils/logger.js';

/**
 * Auto‑generate attendance sheets for every active class/division at midnight.
 * Skips holidays and classes with no enrolled students.
 * Creates Attendance records with status 'PRESENT' for each student.
 * Emits notifications for teachers who have not submitted by the configured cutoff hour.
 */
export const scheduleAttendanceAutoGeneration = () => {
  // Runs every day at 00:05 AM server time
  const job = new CronJob('5 0 * * *', async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch active academic year (assuming only one is active)
      const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
      if (!activeYear) {
        logger.warn('No active academic year – auto attendance skipped');
        return;
      }

      // Get holidays for the year to skip
      const holidays = await prisma.holiday.findMany({ where: { academicYearId: activeYear.id } });
      const holidayDates = holidays.map((h) => h.date);

      // Determine if today is a working day (exclude Sundays & holidays)
      const dayOfWeek = today.getDay();
      if (dayOfWeek === 0 || holidayDates.some((d) => d.toDateString() === today.toDateString())) {
        logger.info('Today is a non‑working day – auto attendance not generated');
        return;
      }

      // Fetch all class/division combos with enrolled students for the active year
      const enrollments = await prisma.studentEnrollment.findMany({
        where: { academicYearId: activeYear.id },
        include: { student: true, class: true, division: true },
      });

      // Group by class/division
      const map = new Map<string, { classId: string; divisionId: string; students: any[] }>();
      for (const e of enrollments) {
        const key = `${e.classId}-${e.divisionId}`;
        if (!map.has(key)) {
          map.set(key, { classId: e.classId, divisionId: e.divisionId, students: [] });
        }
        map.get(key)!.students.push(e.student);
      }

      // Determine a default teacher id to use for markedById (pick first teacher)
      const defaultTeacher = await prisma.teacher.findFirst();
      const defaultMarkedById = defaultTeacher?.id ?? '';

      // For each class/division, create attendance rows if not already exist for today
      for (const entry of map.values()) {
        const existing = await prisma.attendance.findFirst({
          where: { classId: entry.classId, divisionId: entry.divisionId, date: today },
        });
        if (existing) continue; // already generated

        const records = entry.students.map((stu) => ({
          studentId: stu.id,
          classId: entry.classId,
          divisionId: entry.divisionId,
          academicYearId: activeYear.id,
          date: today,
          status: 'PRESENT' as const,
          markedById: defaultMarkedById,
        }));
        await prisma.attendance.createMany({ data: records, skipDuplicates: true });
        logger.info(`Auto‑generated attendance for class ${entry.classId}, division ${entry.divisionId}`);
      }

      // Notify teachers who have no attendance record for today (cutoff at env var)
      const cutoffHour = Number(process.env.CUTOFF_HOUR || '12'); // default noon
      const now = new Date();
      if (now.getHours() >= cutoffHour) {
        const teachers = await prisma.teacher.findMany({ include: { assignments: true } });
        for (const teacher of teachers) {
          const pending = await prisma.attendance.findFirst({
            where: { markedById: teacher.id, date: today },
          });
          if (!pending) {
            await prisma.notification.create({
              data: {
                userId: teacher.userId,
                title: 'Pending Attendance',
                message: `You have not submitted attendance for ${today.toDateString()}`,
                type: 'ATTENDANCE',
                createdAt: new Date(),
              },
            });
          }
        }
        logger.info('Attendance pending notifications sent');
      }
    } catch (error) {
      logger.error('Error in auto‑attendance job', error);
    }
  });

  job.start();
  logger.info('Scheduled daily attendance auto‑generation job');
};

/**
 * Helper to run the attendance generation immediately (used by the cron route).
 */
export const runAutoAttendanceNow = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!activeYear) {
    logger.warn('No active academic year – manual attendance generation aborted');
    return;
  }

  const enrollments = await prisma.studentEnrollment.findMany({
    where: { academicYearId: activeYear.id },
    include: { student: true, class: true, division: true },
  });

  const map = new Map<string, { classId: string; divisionId: string; students: any[] }>();
  for (const e of enrollments) {
    const key = `${e.classId}-${e.divisionId}`;
    if (!map.has(key)) {
      map.set(key, { classId: e.classId, divisionId: e.divisionId, students: [] });
    }
    map.get(key)!.students.push(e.student);
  }

  const defaultTeacher = await prisma.teacher.findFirst();
  const defaultMarkedById = defaultTeacher?.id ?? '';

  for (const entry of map.values()) {
    const existing = await prisma.attendance.findFirst({
      where: { classId: entry.classId, divisionId: entry.divisionId, date: today },
    });
    if (existing) continue;

    const records = entry.students.map((stu) => ({
      studentId: stu.id,
      classId: entry.classId,
      divisionId: entry.divisionId,
      academicYearId: activeYear.id,
      date: today,
      status: 'PRESENT' as const,
      markedById: defaultMarkedById,
    }));
    await prisma.attendance.createMany({ data: records, skipDuplicates: true });
  }

  const cutoffHour = Number(process.env.CUTOFF_HOUR || '12');
  const now = new Date();
  if (now.getHours() >= cutoffHour) {
    const teachers = await prisma.teacher.findMany({ include: { assignments: true } });
    for (const teacher of teachers) {
      const pending = await prisma.attendance.findFirst({
        where: { markedById: teacher.id, date: today },
      });
      if (!pending) {
        await prisma.notification.create({
          data: {
            userId: teacher.userId,
            title: 'Pending Attendance',
            message: `You have not submitted attendance for ${today.toDateString()}`,
            type: 'ATTENDANCE',
            createdAt: new Date(),
          },
        });
      }
    }
    logger.info('Attendance pending notifications sent (manual run)');
  }
};
