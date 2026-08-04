
import { inject, Injectable } from "@angular/core";
import { 
    AuthenticatedUser, 
    LoginRequest, 
    RegisterRequest, 
    UserResponse, 
    VerifyEmailRequest } from "../auth.models";
import { HttpClient } from "@angular/common/http";
import { Observable, switchMap } from "rxjs";

@Injectable({
    providedIn: "root"
})
export class AuthService {

    private readonly http = inject(HttpClient);
    private readonly authUrl = "/api/auth";

    getCsrfToken(): Observable<unknown> {
        return this.http.get(`${this.authUrl}/csrf`);
    }

    register(request: RegisterRequest): Observable<UserResponse> {
        return this.withCsrf(() => 
         this.http.post<UserResponse>(
            `${this.authUrl}/register`,
            request
            )
        );
    }

    verifyEmail(request: VerifyEmailRequest): Observable<void> {
        return this.withCsrf(() =>
            this.http.post<void>(`${this.authUrl}/verify-email`,
            request
            )
        );
    }

    resendVerification(email: string): Observable<void>{
        return this.withCsrf(() => 
            this.http.post<void>(`${this.authUrl}/resend-verification`, 
            { email }
            )
        );
    }

    login(request: LoginRequest): Observable<AuthenticatedUser> {
        return this.withCsrf(() =>
            this.http.post<AuthenticatedUser>(`${this.authUrl}/login`,
            request
            )
        );
    }

    getCurrentUser(): Observable<AuthenticatedUser> {
        return this.http.get<AuthenticatedUser>(
            `${this.authUrl}/me`,
        );
    }

    logout(): Observable<void> {
        return this.withCsrf(() => 
            this.http.post<void>(`${this.authUrl}/logout`, 
            {}
            )
        );
    }

    // Helper function to fetch cookie so we're not repeating the same code for the requests
    private withCsrf<T>(
        request: () => Observable<T>
    ): Observable<T> {
        return this.getCsrfToken().pipe(
            switchMap(() => request())
        );
    }
}