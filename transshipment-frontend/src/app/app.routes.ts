import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { VerifyEmail } from './auth/verify-email/verify-email';
import { Login } from './auth/login/login';
import { MyApplications } from './requester/my-applications/my-applications';
import { ReviewQueue } from './reviewer/review-queue/review-queue';
import { UserGovernance } from './admin/user-governance/user-governance';

export const routes: Routes = [
    {
        path: "register",
        component: Register
    },
    {
        path: "verify-email",
        component: VerifyEmail
    },
    {
        path: "login",
        component: Login
    },
    {
        path: "my-applications",
        component: MyApplications
    }, {
        path: "review-queue",
        component: ReviewQueue
    },
    {
        path: "user-governance",
        component: UserGovernance
    }
];
