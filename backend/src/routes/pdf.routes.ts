import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';
import { computeWorkingDays, computeAttendancePercentage, computeGrade } from '../utils/helpers.js';
import puppeteer from 'puppeteer';

const router = Router();
router.use(authenticateToken);

// Generate and stream PDF for a report card
router.get('/report-card/:id', authorize('ADMIN', 'FACULTY'), async (req, res, next) => {
  try {
    const reportCard = await prisma.reportCard.findUnique({
      where: { id: req.params.id },
      include: {
        student: true,
        class: true,
        division: true,
        academicYear: true,
        sections: true,
        assessment: true,
      },
    });
    if (!reportCard) return res.status(404).json({ success: false, error: 'Report card not found' });

    const settings = await prisma.schoolSettings.findFirst();
    const rules = await prisma.gradeRule.findMany({ orderBy: { minPercentage: 'desc' } });

    // Fetch marks for the latest exam in this class/year
    const latestExam = await prisma.exam.findFirst({
      where: { classId: reportCard.classId, academicYearId: reportCard.academicYearId },
      orderBy: { createdAt: 'desc' },
    });

    let marks: any[] = [];
    if (latestExam) {
      marks = await prisma.mark.findMany({
        where: {
          studentId: reportCard.studentId,
          examId: latestExam.id,
        },
        include: { subject: true },
        orderBy: { subject: { displayOrder: 'asc' } },
      });
    }

    // Fetch attendance
    const ay = reportCard.academicYear;
    const holidays = await prisma.holiday.findMany({ where: { academicYearId: ay.id } });
    const workingDays = computeWorkingDays(ay.startDate, ay.endDate, holidays.map(h => h.date));
    const presentCount = await prisma.attendance.count({
      where: { studentId: reportCard.studentId, academicYearId: ay.id, status: 'PRESENT' },
    });
    const attendancePct = computeAttendancePercentage(presentCount, workingDays);

    // Build marks table HTML
    const totalObtained = marks.reduce((s, m) => s + (m.marksObtained || 0), 0);
    const totalMax = marks.reduce((s, m) => s + m.subject.maxMarks, 0);
    const overallPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const overallGrade = computeGrade(overallPct, rules);

    const isKG = reportCard.class.reportCardTemplate === 'KG';

    const getSection = (key: string) => {
      const sec = reportCard.sections.find((s: any) => s.sectionKey === key);
      return {
        progress: sec?.progressShown ? sec.progressShown.split('\n').filter(Boolean) : [],
        challenges: sec?.challengesFaced ? sec.challengesFaced.split('\n').filter(Boolean) : [],
      };
    };

    const sectionRows = (data: { progress: string[]; challenges: string[] }) => {
      let rows = '';
      for (let i = 0; i < 3; i++) {
        rows += `
          <tr>
            <td style="padding:4px 6px; border-bottom:1px solid #c8a96a; border-right:1px solid #c8a96a; font-size:10px;">
              ${i + 1}) ${data.progress[i] || ''}
            </td>
            <td style="padding:4px 6px; border-bottom:1px solid #c8a96a; font-size:10px;">
              ${i + 1}) ${data.challenges[i] || ''}
            </td>
          </tr>`;
      }
      return rows;
    };

    const marksRows = marks.map(m => {
      const subPct = m.marksObtained !== null ? (m.marksObtained / m.subject.maxMarks) * 100 : 0;
      const subGrade = m.isAbsent ? 'AB' : computeGrade(subPct, rules);
      return `
        <tr>
          <td style="padding:3px 6px; border-bottom:1px solid #c8a96a; font-size:10px;">${m.subject.name}</td>
          <td style="padding:3px 6px; border-bottom:1px solid #c8a96a; text-align:center; font-size:10px;">${m.subject.maxMarks}</td>
          <td style="padding:3px 6px; border-bottom:1px solid #c8a96a; text-align:center; font-size:10px;">${m.isAbsent ? 'AB' : (m.marksObtained ?? '')}</td>
          <td style="padding:3px 6px; border-bottom:1px solid #c8a96a; text-align:center; font-size:10px;">${subGrade}</td>
        </tr>`;
    }).join('');

    const kgSections = isKG ? `
      <!-- Section A -->
      <div style="margin-bottom:8px;">
        <div style="background:#5a0020; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">
          A. Physical &amp; Motor Development | शारीरीक आणि मोटर विकास
        </div>
        <table style="width:100%; border-collapse:collapse; border:1px solid #c8a96a;">
          <thead>
            <tr style="background:#f5e6c8;">
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; border-right:1px solid #c8a96a; width:50%;">Progress Shown During the Academic Year</th>
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; width:50%;">Challenges to be Faced During the Next Academic Year</th>
            </tr>
          </thead>
          <tbody>${sectionRows(getSection('A'))}</tbody>
        </table>
      </div>
      <!-- Section B -->
      <div style="margin-bottom:8px;">
        <div style="background:#5a0020; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">
          B. Social Emotional Development | सामाजिक – भावनीक विकास
        </div>
        <table style="width:100%; border-collapse:collapse; border:1px solid #c8a96a;">
          <thead>
            <tr style="background:#f5e6c8;">
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; border-right:1px solid #c8a96a; width:50%;">Progress Shown During the Academic Year</th>
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; width:50%;">Challenges to be Faced During the Next Academic Year</th>
            </tr>
          </thead>
          <tbody>${sectionRows(getSection('B'))}</tbody>
        </table>
      </div>
      <!-- Section C -->
      <div style="margin-bottom:8px;">
        <div style="background:#5a0020; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">
          C. Cognitive Development | संज्ञानात्मक विकास
        </div>
        <table style="width:100%; border-collapse:collapse; border:1px solid #c8a96a;">
          <thead>
            <tr style="background:#f5e6c8;">
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; border-right:1px solid #c8a96a; width:50%;">Progress Shown During the Academic Year</th>
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; width:50%;">Challenges to be Faced During the Next Academic Year</th>
            </tr>
          </thead>
          <tbody>${sectionRows(getSection('C'))}</tbody>
        </table>
      </div>
      <!-- Section D -->
      <div style="margin-bottom:8px;">
        <div style="background:#5a0020; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">
          D. Language &amp; Literacy Development | भाषा आणि साक्षरता विकास
        </div>
        <table style="width:100%; border-collapse:collapse; border:1px solid #c8a96a;">
          <thead>
            <tr style="background:#f5e6c8;">
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; border-right:1px solid #c8a96a; width:50%;">Progress Shown During the Academic Year</th>
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; width:50%;">Challenges to be Faced During the Next Academic Year</th>
            </tr>
          </thead>
          <tbody>${sectionRows(getSection('D'))}</tbody>
        </table>
      </div>
      <!-- Section E -->
      <div style="margin-bottom:8px;">
        <div style="background:#5a0020; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">
          E. Creative &amp; Aesthetic Development | सर्जनशील आणि कलात्मक विकास
        </div>
        <table style="width:100%; border-collapse:collapse; border:1px solid #c8a96a;">
          <thead>
            <tr style="background:#f5e6c8;">
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; border-right:1px solid #c8a96a; width:50%;">Progress Shown During the Academic Year</th>
              <th style="padding:4px 6px; font-size:9px; border-bottom:1px solid #c8a96a; width:50%;">Challenges to be Faced During the Next Academic Year</th>
            </tr>
          </thead>
          <tbody>${sectionRows(getSection('E'))}</tbody>
        </table>
      </div>
    ` : '';

    const primaryTeacherRemark = isKG ? '' : `
      <div style="margin-bottom:8px;">
        <div style="background:#1e3a5f; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">Teacher's Remarks</div>
        <div style="border:1px solid #93c5fd; padding:6px 8px; min-height:40px; font-size:10px;">
          ${reportCard.assessment?.additionalSupportNeeded || ''}
        </div>
      </div>`;

    const assessmentSection = isKG ? `
      <!-- Section G -->
      <div style="margin-bottom:8px;">
        <div style="background:#5a0020; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">G. Assessment &amp; Progress Details</div>
        <table style="width:100%; border-collapse:collapse; border:1px solid #c8a96a;">
          <tr>
            <td style="padding:4px 6px; font-size:10px; border-bottom:1px solid #c8a96a; width:50%;">
              Shows all-round development? <strong>${reportCard.assessment?.allRoundDevelopment?.replace(/_/g, ' ') || ''}</strong>
            </td>
            <td style="padding:4px 6px; font-size:10px; border-bottom:1px solid #c8a96a; width:50%;">
              Strength Identified: ${reportCard.assessment?.strengthIdentified || ''}
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:4px 6px; font-size:10px;">
              Additional Support Needed: ${reportCard.assessment?.additionalSupportNeeded || ''}
            </td>
          </tr>
        </table>
      </div>
      <!-- Section H — Parent Feedback -->
      <div style="margin-bottom:8px;">
        <div style="background:#5a0020; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">H. Parent's Feedback</div>
        <div style="border:1px solid #c8a96a; min-height:50px; padding:6px 8px; font-size:10px;">&nbsp;</div>
      </div>
    ` : '';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #1a1a1a; }
    @page { size: A4; margin: 10mm; }
    .page { width: 190mm; min-height: 277mm; border: 6px solid #b45309; padding: 8px; }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
<div class="page">
  <!-- Header -->
  <div style="background:linear-gradient(to right, #5a0020, #7a003a); color:white; text-align:center; padding:10px 8px; margin-bottom:8px;">
    <div style="font-size:9px; letter-spacing:2px;">HUMAN RESOURCE DEVELOPMENT CENTER'S</div>
    <div style="font-size:14px; font-weight:bold; letter-spacing:1px;">BHARAT RATNA</div>
    <div style="font-size:13px; font-weight:bold;">MOTHER TERESA FOUNDATION SCHOOL</div>
    <div style="font-size:10px;">${settings?.address || 'Gangapur Dist. Chha. Sambhajinagar - 431109'}</div>
    <div style="font-size:12px; font-weight:bold; margin-top:4px;">PROGRESS REPORT CARD — ${ay.name}</div>
  </div>

  <!-- Student Info -->
  <table style="width:100%; border:1px solid #c8a96a; margin-bottom:8px;">
    <tr>
      <td style="padding:4px 8px; font-size:10px; width:25%; border-right:1px solid #c8a96a;">
        <strong>Name:</strong><br/>${reportCard.student.name}
      </td>
      <td style="padding:4px 8px; font-size:10px; width:20%; border-right:1px solid #c8a96a;">
        <strong>Class:</strong> ${reportCard.class.name}<br/>
        <strong>Division:</strong> ${reportCard.division.name}
      </td>
      <td style="padding:4px 8px; font-size:10px; width:20%; border-right:1px solid #c8a96a;">
        <strong>Roll No:</strong> ${reportCard.student.rollNo || ''}<br/>
        <strong>Admission No:</strong> ${reportCard.student.admissionNo}
      </td>
      <td style="padding:4px 8px; font-size:10px; width:20%; border-right:1px solid #c8a96a;">
        <strong>Academic Year:</strong><br/>${ay.name}
      </td>
      <td style="padding:4px 8px; font-size:10px; width:15%; text-align:center;">
        ${reportCard.student.photo ? `
          <img src="${reportCard.student.photo}" style="width:60px; height:70px; object-fit:cover; border:1px solid #c8a96a; display:block; margin:auto;" />
        ` : `
          <div style="border:1px dashed #999; width:60px; height:70px; margin:auto; display:flex; align-items:center; justify-content:center; font-size:8px; color:#999;">Photo</div>
        `}
      </td>
    </tr>
  </table>

  ${kgSections}
  ${primaryTeacherRemark}

  <!-- Section F / Marks Table -->
  <div style="margin-bottom:8px;">
    <div style="background:${isKG ? '#5a0020' : '#1e3a5f'}; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">
      ${isKG ? 'F. ' : ''}Subject-wise Marks
    </div>
    <table style="width:100%; border-collapse:collapse; border:1px solid ${isKG ? '#c8a96a' : '#93c5fd'};">
      <thead>
        <tr style="background:${isKG ? '#f5e6c8' : '#dbeafe'};">
          <th style="padding:4px 6px; text-align:left; font-size:10px; border-bottom:1px solid #ddd; border-right:1px solid #ddd; width:40%;">Subject</th>
          <th style="padding:4px 6px; text-align:center; font-size:10px; border-bottom:1px solid #ddd; border-right:1px solid #ddd; width:20%;">Max Marks</th>
          <th style="padding:4px 6px; text-align:center; font-size:10px; border-bottom:1px solid #ddd; border-right:1px solid #ddd; width:20%;">Marks Obtained</th>
          <th style="padding:4px 6px; text-align:center; font-size:10px; border-bottom:1px solid #ddd; width:20%;">Grade</th>
        </tr>
      </thead>
      <tbody>
        ${marksRows}
        <tr style="background:#f0f0f0; font-weight:bold;">
          <td style="padding:4px 6px; font-size:10px; border-top:2px solid #999;">Total</td>
          <td style="padding:4px 6px; text-align:center; font-size:10px; border-top:2px solid #999;">${totalMax}</td>
          <td style="padding:4px 6px; text-align:center; font-size:10px; border-top:2px solid #999;">${totalObtained}</td>
          <td style="padding:4px 6px; text-align:center; font-size:10px; border-top:2px solid #999;">${overallGrade}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Attendance Block -->
  <div style="margin-bottom:8px;">
    <div style="background:${isKG ? '#5a0020' : '#1e3a5f'}; color:white; padding:3px 8px; font-size:10px; font-weight:bold;">Attendance</div>
    <table style="width:100%; border-collapse:collapse; border:1px solid ${isKG ? '#c8a96a' : '#93c5fd'};">
      <tr style="background:${isKG ? '#f5e6c8' : '#dbeafe'};">
        <th style="padding:4px 6px; font-size:10px; border-right:1px solid #ddd;">Date Range</th>
        <th style="padding:4px 6px; font-size:10px; border-right:1px solid #ddd;">Working Days</th>
        <th style="padding:4px 6px; font-size:10px; border-right:1px solid #ddd;">Present Days</th>
        <th style="padding:4px 6px; font-size:10px; border-right:1px solid #ddd;">Attendance %</th>
        <th style="padding:4px 6px; font-size:10px;">Cumulative Grade</th>
      </tr>
      <tr>
        <td style="padding:4px 6px; font-size:10px; border-right:1px solid #ddd;">
          ${new Date(ay.startDate).toLocaleDateString('en-IN')} – ${new Date(ay.endDate).toLocaleDateString('en-IN')}
        </td>
        <td style="padding:4px 6px; text-align:center; font-size:10px; border-right:1px solid #ddd;">${workingDays}</td>
        <td style="padding:4px 6px; text-align:center; font-size:10px; border-right:1px solid #ddd;">${presentCount}</td>
        <td style="padding:4px 6px; text-align:center; font-size:10px; border-right:1px solid #ddd;">${attendancePct.toFixed(1)}%</td>
        <td style="padding:4px 6px; text-align:center; font-size:10px;">${overallGrade}</td>
      </tr>
    </table>
  </div>

  ${assessmentSection}

  <!-- Signature Lines -->
  <table style="width:100%; margin-top:16px;">
    <tr>
      <td style="padding:4px 6px; text-align:center; font-size:10px; width:33%;">
        <div style="border-top:1px solid #333; margin-top:30px; padding-top:4px;">Class Teacher's Signature</div>
      </td>
      <td style="padding:4px 6px; text-align:center; font-size:10px; width:34%;">
        <div style="border-top:1px solid #333; margin-top:30px; padding-top:4px;">H.M.'s Signature</div>
      </td>
      <td style="padding:4px 6px; text-align:center; font-size:10px; width:33%;">
        <div style="border-top:1px solid #333; margin-top:30px; padding-top:4px;">Parent's Signature</div>
      </td>
    </tr>
  </table>
</div>
</body>
</html>`;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' },
    });
    await browser.close();

    const filename = `${reportCard.student.name.replace(/\s+/g, '_')}_${reportCard.class.name}${reportCard.division.name}_ReportCard_${ay.name}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (err) { next(err); }
});

export default router;
