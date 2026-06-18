import prisma from '../prisma/client.js';
export const getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const orders = await prisma.order.findMany({
            where: status ? { status: String(status) } : {},
            include: {
                creator: { select: { full_name: true } },
                assignee: { select: { full_name: true } },
            },
            orderBy: { created_at: 'desc' },
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const getOrderById = async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: Number(req.params.id) },
            include: {
                creator: { select: { full_name: true } },
                assignee: { select: { full_name: true } },
                documents: true,
                history: {
                    include: { user: { select: { full_name: true } } },
                    orderBy: { changed_at: 'desc' },
                },
            },
        });
        if (!order) {
            res.status(404).json({ message: 'Заказ не найден' });
            return;
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const createOrder = async (req, res) => {
    try {
        const { title, description, assigned_to, deadline, created_by } = req.body;
        if (!title) {
            res.status(400).json({ message: 'Название обязательно' });
            return;
        }
        const order = await prisma.order.create({
            data: {
                title,
                description,
                assigned_to: assigned_to ?? null,
                deadline: deadline ? new Date(deadline) : null,
                created_by,
                status: 'new',
            },
        });
        res.status(201).json(order);
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
// Изменить статус заказа
export const updateOrderStatus = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const { status, changed_by } = req.body;
        const order = await prisma.order.findUnique({
            where: { id: orderId },
        });
        if (!order) {
            res.status(404).json({ message: 'Заказ не найден' });
            return;
        }
        await prisma.$transaction([
            prisma.order.update({
                where: { id: orderId },
                data: { status },
            }),
            prisma.orderHistory.create({
                data: {
                    order_id: orderId,
                    old_status: order.status,
                    new_status: status,
                    changed_by,
                },
            }),
        ]);
        res.json({ message: 'Статус обновлён' });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
export const deleteOrder = async (req, res) => {
    try {
        const orderId = Number(req.params.id);
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });
        if (!order) {
            res.status(404).json({ message: 'Заказ не найден' });
            return;
        }
        await prisma.order.delete({
            where: { id: orderId }
        });
        res.json({ message: 'Заказ удалён' });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
