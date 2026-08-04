import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { VerifyEmail } from './auth/verify-email/verify-email';
import { Login } from './auth/login/login';
import { MyApplications } from './requester/my-applications/my-applications';
import { ReviewQueue } from './reviewer/review-queue/review-queue';
import { UserGovernance } from './admin/user-governance/user-governance';
import { roleGuard } from './auth/role.guard';
import { guestGuard } from './auth/guest.guard';

export const routes: Routes = [
    {
        path: "register",
        component: Register,
        canActivate: [guestGuard]
    },
    {
        path: "verify-email",
        component: VerifyEmail,
        canActivate: [guestGuard]
    },
    {
        path: "login",
        component: Login,
        canActivate: [guestGuard]
    },
    {
        path: "my-applications",
        component: MyApplications,
        canActivate: [roleGuard(["REQUESTER"])]
    }, {
        path: "review-queue",
        component: ReviewQueue,
        canActivate: [roleGuard(["REVIEWER"])]
    },
    {
        path: "user-governance",
        component: UserGovernance,
        canActivate: [roleGuard(["ADMIN"])]
    },
    {
        // This sets login as the default route
        path: "",
        pathMatch: "full",
        redirectTo: "login"
    },
    {
        // This allows routing back to login if some random URL is entered
        path: "**",
        redirectTo: "login"
    }
];
