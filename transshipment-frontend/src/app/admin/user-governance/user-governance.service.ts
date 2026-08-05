import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserResponse } from "../../auth.models";

@Injectable({
    providedIn: "root"
})
export class UserGovernanceService {
    private readonly http = inject(HttpClient);

    getAllUsers(): Observable<UserResponse[]> {
        return this.http.get<UserResponse[]>("/api/admin/users");
    }
}