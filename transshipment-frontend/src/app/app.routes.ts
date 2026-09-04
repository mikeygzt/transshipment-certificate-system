import { Routes } from '@angular/router';
import { Register } from './auth/register/register';
import { VerifyEmail } from './auth/verify-email/verify-email';
import { Login } from './auth/login/login';
import { MyApplications } from './requester/my-applications/my-applications';
import { ReviewQueue } from './reviewer/review-queue/review-queue';
import { UserGovernance } from './admin/user-governance/user-governance';
import { roleGuard } from './auth/role.guard';
import { guestGuard } from './auth/guest.guard';
import { AuditLogs } from './admin/audit-logs/audit-logs';
import { ArchivedApplications } from './requester/archived-applications/archived-applications';
import { ApprovedRequests } from './reviewer/approved-requests/approved-requests';

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
    },
    {
        path: "archived-applications",
        component: ArchivedApplications,
        canActivate: [roleGuard(["REQUESTER"])]
    },
    {
        path: "review-queue",
        component: ReviewQueue,
        canActivate: [roleGuard(["REVIEWER"])]
    },
    {
        path: "approved-requests",
        component: ApprovedRequests,
        canActivate: [roleGuard(["REVIEWER"])]
    },
    {
        path: "user-governance",
        component: UserGovernance,
        canActivate: [roleGuard(["ADMIN"])]
    },
    {
        path: "audit-logs",
        component: AuditLogs,
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
