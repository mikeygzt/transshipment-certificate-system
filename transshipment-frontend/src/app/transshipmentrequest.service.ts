import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { TransshipmentResponse, TransshipmentRequest } from './transhipmentrequest.models';
import { AuthService } from './auth/auth.service';

@Injectable({
    providedIn: "root"
})
//@Service()
export class RequestService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly requestUrl = "api/transshipmentrequest";

    new(request: TransshipmentRequest): Observable<TransshipmentResponse>{
        return this.withCsrf(()=>this.http.post<TransshipmentResponse>(`${this.requestUrl}/new`, request)); 

    }

    getAll(): Observable<TransshipmentResponse[]> {
        return this.withCsrf(() => this.http.get<TransshipmentResponse[]>(`${this.requestUrl}/all`));
    }

    getbyUser(id: string): Observable<TransshipmentResponse[]>{
        return this.withCsrf(() => this.http.get<TransshipmentResponse[]>(`${this.requestUrl}/my-applications/${id}`));

    }

    getbyId(id: string): Observable<TransshipmentResponse>{
        return this.withCsrf(() => this.http.get<TransshipmentResponse>(`${this.requestUrl}/${id}`));
    }

    update(id: string, request: TransshipmentRequest): Observable<void>{
        return this.withCsrf(() => this.http.patch<void>(`${this.requestUrl}/update/${id}`, request));
    }

    // SSE related methods (claim & release)
    claim(requestId: string) {
        return this.withCsrf(() =>
            this.http.patch<void>(
                `${this.requestUrl}/${requestId}/claim`,
                {}
        ));
    }

    release(requestId: string) {
        return this.withCsrf(() => 
            this.http.patch<void>(
                `${this.requestUrl}/${requestId}/release`,
                {}
            )
        )
    }

    heartbeat(requestId: string) {
        return this.withCsrf(() => 
            this.http.patch<void>(
                `${this.requestUrl}/${requestId}/heartbeat`,
                {}
            )
        )
    }

    //using the helper function used in auth service
    getCsrfToken(): Observable<unknown> {
        return this.http.get(`/api/auth/csrf`);
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
