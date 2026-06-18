import prisma from '../prisma/client.js';
export const getStats = async (req, res) => {
    try {
        const totalOrders = await prisma.order.count();
        const inProgressOrders = await prisma.order.count({
            where: { status: 'in_progress' }
        });
        const doneOrders = await prisma.order.count({
            where: { status: 'done' }
        });
        const newOrders = await prisma.order.count({
            where: { status: 'new' }
        });
        const totalDocuments = await prisma.document.count();
        const latestOrders = await prisma.order.findMany({
            take: 4,
            orderBy: { created_at: 'desc' },
            include: {
                creator: { select: { full_name: true } },
                assignee: { select: { full_name: true } }
            }
        });
        const latestDocuments = await prisma.document.findMany({
            take: 4,
            orderBy: { uploaded_at: 'desc' },
            include: {
                order: { select: { id: true, title: true } }
            }
        });
        res.json({
            stats: {
                totalOrders,
                inProgressOrders,
                doneOrders,
                newOrders,
                totalDocuments
            },
            latestOrders,
            latestDocuments
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};
