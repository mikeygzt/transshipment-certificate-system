import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";
import { inject } from "@angular/core";
import { UserRole } from "../auth.models";
import { catchError, map, of } from "rxjs";

function getLandingPage(role: UserRole) {
    switch (role) {
        case "REQUESTER":
            return "/my-application";
        case "REVIEWER":
            return "/review-queue";
        case "ADMIN":
            return "/user-governance";
    }
}

export const guestGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return authService.getCurrentUser().pipe(
        map(user => 
            router.createUrlTree([
                getLandingPage(user.role)
            ])
        ),

        catchError(() => {
            return of(true);
        })
    )
}