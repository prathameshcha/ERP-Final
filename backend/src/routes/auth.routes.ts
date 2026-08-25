import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database.js';
import { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRY, JWT_REFRESH_EXPIRY } from '../config/jwt.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const login = req.body.login || req.body.username || req.body.email;
    const password = req.body.password;

    if (!login || !password) {
      return res.status(400).json({ success: false, error: 'Login and password are required' });
    }
    
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: String(login) },
          { username: String(login) }
        ]
      }
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ success: false, error: 'Invalid credentials or inactive account' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const payload = { id: user.id, role: user.role, email: user.email };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY as any });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY as any });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        token: accessToken,
        accessToken,
        user: { id: user.id, email: user.email, username: user.username, role: user.role }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ success: false, error: 'No refresh token' });

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err: any, decoded: any) => {
      if (err) return res.status(403).json({ success: false, error: 'Invalid refresh token' });

      const payload = { id: decoded.id, role: decoded.role, email: decoded.email };
      const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY as any });

      res.json({ success: true, data: { accessToken, token: accessToken } });
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', authenticateToken, async (req: any, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        admin: true,
        teacher: true,
        student: true
      }
    });

    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  } catch (error) {
    next(error);
  }
});

export default router;
