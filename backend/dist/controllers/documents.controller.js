import prisma from '../prisma/client.js';
import path from 'path';
export const getDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            include: {
                order: { select: { id: true, title: true } },
            },
            orderBy: { uploaded_at: 'desc' },
        });
        res.json(documents);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const uploadDocument = async (req, res) => {
    try {
        const { title, order_id, uploaded_by } = req.body;
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: 'Файл не загружен' });
            return;
        }
        if (!title || !order_id || !uploaded_by) {
            res.status(400).json({ message: 'Заполните все обязательные поля' });
            return;
        }
        const fileType = path.extname(file.originalname).replace('.', '').toUpperCase();
        const document = await prisma.document.create({
            data: {
                title,
                file_path: `/uploads/${file.filename}`,
                file_type: fileType,
                order_id: Number(order_id),
                uploaded_by: Number(uploaded_by),
            },
        });
        res.status(201).json(document);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const deleteDocument = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const doc = await prisma.document.findUnique({ where: { id } });
        if (!doc) {
            res.status(404).json({ message: 'Документ не найден' });
            return;
        }
        await prisma.document.delete({ where: { id } });
        res.json({ message: 'Документ удалён' });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
