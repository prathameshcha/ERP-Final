import { Router } from 'express';
import { prisma } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorize } from '../middleware/roleGuard.js';

const router = Router();

router.use(authenticateToken);
router.use(authorize('ADMIN'));

router.get('/', async (req, res, next) => {
  try {
    const { active } = req.query;
    const where = active === 'true' ? { isActive: true } : {};
    const years = await prisma.academicYear.findMany({ where, orderBy: { startDate: 'desc' } });
    res.json({ success: true, data: years });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const year = await prisma.academicYear.findUnique({ where: { id: req.params.id } });
    if (!year) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: year });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, startDate, endDate } = req.body;
    const newYear = await prisma.academicYear.create({
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate) }
    });
    res.json({ success: true, data: newYear });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, startDate, endDate } = req.body;
    const updated = await prisma.academicYear.update({
      where: { id: req.params.id },
      data: { name, startDate: new Date(startDate), endDate: new Date(endDate) }
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

router.put('/:id/activate', async (req, res, next) => {
  try {
    const id = req.params.id;
    await prisma.$transaction([
      prisma.academicYear.updateMany({ data: { isActive: false } }),
      prisma.academicYear.update({ where: { id }, data: { isActive: true } })
    ]);
    res.json({ success: true, message: 'Academic year activated' });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.academicYear.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) { next(err); }
});

export default router;
