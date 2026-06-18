import prisma from '../prisma/client.js';
export const getReports = async (req, res) => {
    try {
        const totalOrders = await prisma.order.count();
        const newOrders = await prisma.order.count({ where: { status: 'new' } });
        const inProgressOrders = await prisma.order.count({ where: { status: 'in_progress' } });
        const doneOrders = await prisma.order.count({ where: { status: 'done' } });
        const totalDocuments = await prisma.document.count();
        const orders = await prisma.order.findMany({
            include: {
                creator: { select: { full_name: true } },
                assignee: { select: { full_name: true } },
            },
            orderBy: { created_at: 'desc' },
        });
        // Статистика по исполнителям
        const assigneeStats = {};
        orders.forEach(order => {
            const name = order.assignee?.full_name ?? 'Не назначен';
            assigneeStats[name] = (assigneeStats[name] || 0) + 1;
        });
        res.json({
            stats: { totalOrders, newOrders, inProgressOrders, doneOrders, totalDocuments },
            orders,
            assigneeStats,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
