import { Router } from 'express';
import { register, login, refresh, logout } from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from '../validators/authValidator';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/refresh', validateRequest(refreshSchema), refresh);
router.post('/logout', logout);

export default router;
