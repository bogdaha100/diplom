import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getRoles, getProfile, updateProfile } from '../controllers/admin.controller.js';
const router = Router();

router.get('/users', getUsers);
router.post('/users', createUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/roles', getRoles);
router.get('/profile/:id', getProfile);
router.patch('/profile/:id', updateProfile);

export default router;