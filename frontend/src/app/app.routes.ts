import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { OrdersList } from './features/orders/orders-list/orders-list';
import { OrderNew } from './features/orders/order-new/order-new';
import { OrderDetail } from './features/orders/order-detail/order-detail';
import { DocumentsList } from './features/documents/documents-list/documents-list';
import { DocumentUpload } from './features/documents/document-upload/document-upload';
import { DocumentDetail } from './features/documents/document-detail/document-detail';
import { ReportsList } from './features/reports/reports-list/reports-list';
import { AdminUsers } from './features/admin/admin-users/admin-users';
import { AdminRoles } from './features/admin/admin-roles/admin-roles';
import { Profile } from './features/profile/profile/profile';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { NotFound } from './not-found/not-found';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: Login },
    { path: 'home', component: Home, canActivate: [authGuard] },
    { path: 'orders', component: OrdersList, canActivate: [authGuard] },
    { path: 'orders/new', component: OrderNew, canActivate: [authGuard] },
    { path: 'orders/:id', component: OrderDetail, canActivate: [authGuard] },
    { path: 'documents', component: DocumentsList, canActivate: [authGuard] },
    { path: 'documents/upload', component: DocumentUpload, canActivate: [authGuard] },
    { path: 'documents/:id', component: DocumentDetail, canActivate: [authGuard] },
    { path: 'reports', component: ReportsList, canActivate: [authGuard] },
    { path: 'admin/users', component: AdminUsers, canActivate: [authGuard, adminGuard] },
    { path: 'admin/roles', component: AdminRoles, canActivate: [authGuard, adminGuard] },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: '**', component: NotFound },
];