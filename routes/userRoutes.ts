import express from 'express';
import {
  registerUser,
  authenticateUser,
  getUsers,
  changeUserBoss,
} from '../controllers/userController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/authenticate', authenticateUser);
router.get('/users', protect, getUsers);
router.patch('/users/:userId/change-boss', protect, changeUserBoss);

export default router;
