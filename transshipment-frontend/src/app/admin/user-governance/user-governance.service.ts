import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, switchMap } from "rxjs";
import { UserResponse } from "../../auth.models";
import { AuthService } from "../../auth/auth.service";

@Injectable({
    providedIn: "root"
})
export class UserGovernanceService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);

    getAllUsers(): Observable<UserResponse[]> {
        return this.http.get<UserResponse[]>("/api/admin/users");
    }

    updateUser(userId: string, fullName: string): Observable<UserResponse> {
        return this.authService.getCsrfToken().pipe(
            switchMap(() => 
                this.http.patch<UserResponse>(
                    `/api/admin/users/${userId}`,
                    {
                        fullName
                    }
                )
            )
        )
    }
}