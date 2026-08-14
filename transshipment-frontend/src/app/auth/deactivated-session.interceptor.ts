import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";


export const deactivatedSessionInterceptor: HttpInterceptorFn = (
    request,
    next
) => {
    const router = inject(Router);

    return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
            if(error.status === 401 && error.error?.error === "ACCOUNT_DEACTIVATED") {
                void router.navigate(["/login"], {
                    queryParams: {
                        reason: 'deactivated'
                    }
                })
            }

            return throwError(() => error);
        })
    );
}