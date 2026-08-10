import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { TransshipmentResponse, Transshipmentrequest } from './transhipmentrequest.models';

@Injectable({
    providedIn: "root"
})
//@Service()
export class RequestService {
    private readonly http = inject(HttpClient);
    private readonly requestUrl = "api/transshipmentrequest";

    new(request: Transshipmentrequest): Observable<TransshipmentResponse>{
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

    update(id: string, request: Transshipmentrequest): Observable<void>{
        return this.withCsrf(() => this.http.patch<void>(`${this.requestUrl}/update/${id}`, request));
    }

    delete(id: string): Observable<unknown>{
        return this.withCsrf(() => this.http.delete(`${this.requestUrl}/delete/${id}`));
    }




    /* getCsrfToken(): Observable<unknown> {
            return this.http.get(`${this.authUrl}/csrf`);
        }
    
        register(request: RegisterRequest): Observable<UserResponse> {
            return this.withCsrf(() => 
             this.http.post<UserResponse>(
                `${this.authUrl}/register`,
                request
                )
            );
        }*/
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
