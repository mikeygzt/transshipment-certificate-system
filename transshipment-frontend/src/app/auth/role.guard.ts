import { CanActivateFn, Router } from "@angular/router";
import { UserRole } from "../auth.models";
import { AuthService } from "./auth.service";
import { inject } from "@angular/core";
import { catchError, map, of } from "rxjs";

function getLandingPage(role: UserRole) {
    switch(role) {
        case "REQUESTER":
            return "/my-applications";
        case "REVIEWER":
            return "review-queue";
        case "ADMIN":
            return "user-governance";
    }
}

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
    return () => {
        const authService = inject(AuthService);
        const router = inject(Router);

        return authService.getCurrentUser().pipe(
            map(user => {
                if(allowedRoles.includes(user.role)) {
                    return true;
                }

                return router.createUrlTree([
                    getLandingPage(user.role)
                ])
            }),
            catchError(() => {
                return of(
                    router.createUrlTree(["/login"])
                );
            })
        );
    };
}