import bcrypt from 'bcrypt';
import prisma from './client.js';
async function main() {
    // Роли
    const adminRole = await prisma.role.upsert({
        where: { name: 'Администратор' },
        update: {},
        create: { name: 'Администратор', description: 'Полный доступ ко всем функциям системы' }
    });
    const managerRole = await prisma.role.upsert({
        where: { name: 'Менеджер' },
        update: {},
        create: { name: 'Менеджер', description: 'Создание заказов и управление ими' }
    });
    const employeeRole = await prisma.role.upsert({
        where: { name: 'Сотрудник предприятия' },
        update: {},
        create: { name: 'Сотрудник предприятия', description: 'Просмотр заказов и документов' }
    });
    // Пользователи
    const hash = await bcrypt.hash('Admin123!', 10);
    const ivanov = await prisma.user.upsert({
        where: { email: 'ivanov@xxx.ru' },
        update: {},
        create: { full_name: 'Иванов Иван Иванович', email: 'ivanov@xxx.ru', password_hash: hash, role_id: adminRole.id }
    });
    const sergeyev = await prisma.user.upsert({
        where: { email: 'sergeyev@xxx.ru' },
        update: {},
        create: { full_name: 'Сергеев Сергей Сергеевич', email: 'sergeyev@xxx.ru', password_hash: hash, role_id: managerRole.id }
    });
    const petrov = await prisma.user.upsert({
        where: { email: 'petrov@xxx.ru' },
        update: {},
        create: { full_name: 'Петров Олег Олегович', email: 'petrov@xxx.ru', password_hash: hash, role_id: managerRole.id }
    });
    const kozlov = await prisma.user.upsert({
        where: { email: 'kozlov@xxx.ru' },
        update: {},
        create: { full_name: 'Козлов Дмитрий Николаевич', email: 'kozlov@xxx.ru', password_hash: hash, role_id: employeeRole.id }
    });
    const novikov = await prisma.user.upsert({
        where: { email: 'novikov@xxx.ru' },
        update: {},
        create: { full_name: 'Новиков Богдан Александрович', email: 'novikov@xxx.ru', password_hash: hash, role_id: employeeRole.id }
    });
    // Заказы
    const order1 = await prisma.order.create({
        data: {
            title: 'Поставка i-PAN4',
            description: 'Закупка экранов',
            status: 'in_progress',
            created_by: petrov.id,
            assigned_to: kozlov.id,
            deadline: new Date('2026-02-20')
        }
    });
    const order2 = await prisma.order.create({
        data: {
            title: 'ТО БелАЗ-7540А',
            description: 'Плановое ТО',
            status: 'new',
            created_by: petrov.id,
            assigned_to: null,
            deadline: new Date('2026-03-20')
        }
    });
    const order3 = await prisma.order.create({
        data: {
            title: 'Кабель SPS',
            description: 'Изготовление кабеля SPS 15м 50шт',
            status: 'done',
            created_by: sergeyev.id,
            assigned_to: novikov.id,
            deadline: new Date('2026-03-15')
        }
    });
    const order4 = await prisma.order.create({
        data: {
            title: 'Кабель БПУ',
            description: 'Изготовление кабеля БПУ 5м 25шт',
            status: 'in_progress',
            created_by: petrov.id,
            assigned_to: kozlov.id,
            deadline: new Date('2026-04-10')
        }
    });
    await prisma.order.create({
        data: {
            title: 'Нарезание бондажа',
            description: 'Обрезка защитного бандажа для кабелей',
            status: 'new',
            created_by: sergeyev.id,
            assigned_to: null,
            deadline: new Date('2026-04-10')
        }
    });
    // Документы
    await prisma.document.createMany({
        data: [
            { title: 'Договор_поставки.pdf', file_path: '/uploads/docs/dogovor_postavki.pdf', file_type: 'PDF', order_id: order1.id, uploaded_by: petrov.id },
            { title: 'Акт_работ.pdf', file_path: '/uploads/docs/akt_rabot.pdf', file_type: 'PDF', order_id: order2.id, uploaded_by: petrov.id },
            { title: 'Договор_закупки.pdf', file_path: '/uploads/docs/dogovor_zakupki.pdf', file_type: 'PDF', order_id: order1.id, uploaded_by: sergeyev.id },
            { title: 'Инструкция_ТО.pdf', file_path: '/uploads/docs/instrukciya_to.pdf', file_type: 'PDF', order_id: order2.id, uploaded_by: petrov.id },
            { title: 'ТехПаспорт.docx', file_path: '/uploads/docs/tehpasport.docx', file_type: 'DOCX', order_id: order3.id, uploaded_by: sergeyev.id }
        ]
    });
    // История статусов
    await prisma.orderHistory.createMany({
        data: [
            { order_id: order1.id, old_status: 'new', new_status: 'in_progress', changed_by: petrov.id },
            { order_id: order3.id, old_status: 'new', new_status: 'in_progress', changed_by: sergeyev.id },
            { order_id: order3.id, old_status: 'in_progress', new_status: 'done', changed_by: sergeyev.id },
            { order_id: order4.id, old_status: 'new', new_status: 'in_progress', changed_by: petrov.id }
        ]
    });
    console.log('База данных заполнена!');
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
