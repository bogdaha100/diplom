import prisma from '../prisma/client.js';
import bcrypt from 'bcrypt';
export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                full_name: true,
                email: true,
                created_at: true,
                role_id: true,
                role: true,
            },
            orderBy: { created_at: 'asc' }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const createUser = async (req, res) => {
    try {
        const { full_name, email, password, role_id } = req.body;
        if (!full_name || !email || !password || !role_id) {
            res.status(400).json({ message: 'Заполните все поля' });
            return;
        }
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ message: 'Пользователь с таким email уже существует' });
            return;
        }
        const password_hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { full_name, email, password_hash, role_id: Number(role_id) },
            select: { id: true, full_name: true, email: true, created_at: true, role: true }
        });
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const updateUser = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { full_name, role_id } = req.body;
        const user = await prisma.user.update({
            where: { id },
            data: { full_name, role_id: Number(role_id) },
            select: { id: true, full_name: true, email: true, created_at: true, role: true }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Пользователь удалён' });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const getRoles = async (req, res) => {
    try {
        const roles = await prisma.role.findMany();
        res.json(roles);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const getProfile = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.params.id) },
            select: { id: true, full_name: true, email: true, created_at: true, role: true }
        });
        if (!user) {
            res.status(404).json({ message: 'Пользователь не найден' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const updateProfile = async (req, res) => {
    try {
        const { full_name, password } = req.body;
        const data = {};
        if (full_name)
            data.full_name = full_name;
        if (password)
            data.password_hash = await bcrypt.hash(password, 10);
        const user = await prisma.user.update({
            where: { id: Number(req.params.id) },
            data,
            select: { id: true, full_name: true, email: true, created_at: true, role: true }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
