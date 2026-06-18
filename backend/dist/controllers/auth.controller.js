import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma/client.js';
export const login = async (req, res) => {
    const { email, password } = req.body;
    // проверка заполненности
    if (!email || !password) {
        res.status(400).json({ message: 'Введите email и пароль' });
        return;
    }
    try {
        // ищем пользователя по email
        const user = await prisma.user.findUnique({
            where: { email },
            include: { role: true }
        });
        // пользователь не найден
        if (!user) {
            res.status(401).json({ message: 'Неверный email или пароль' });
            return;
        }
        // проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Неверный email или пароль' });
            return;
        }
        // генерируем токен
        const token = jwt.sign({ id: user.id, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.role.name
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
