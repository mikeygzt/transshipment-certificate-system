import { Component, computed, inject, signal } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { UserGovernanceService } from './user-governance.service';
import { UserResponse } from '../../auth.models';
import { finalize } from 'rxjs';
import { LucideListFilter, LucideSearch, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-user-governance',
  imports: [
    DashboardLayout, 
    LucideSearch, 
    LucideListFilter,
    LucideX
  ],
  templateUrl: './user-governance.html',
  styleUrl: './user-governance.css',
})
export class UserGovernance {
  private readonly userGovernanceService = inject(UserGovernanceService);

  readonly users = signal<UserResponse[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal("");
  readonly searchTerm = signal("");

  readonly selectedUser = signal<UserResponse | null>(null);

  constructor() {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.userGovernanceService
      .getAllUsers()
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: users => {
          this.users.set(users);
        },

        error: () => {
          this.errorMessage.set("We could not load the user accounts. Please try again.")
        }
      });
  }

  readonly filteredUsers = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();

    if(!query) {
      return this.users();
    }

    return this.users().filter(user => {
      const fullName = user.fullName?.toLowerCase() ?? "";
      const email = user.email?.toLowerCase() ?? "";
      const companyTRN = user.companyTRN?.toLowerCase() ?? "";
      
      return(
        fullName.includes(query) ||
        email.includes(query) ||
        companyTRN.includes(query)
      );
    });
  });

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  openUserDetails(user: UserResponse): void {
    this.selectedUser.set(user);
  }

  closeUserDetails(): void {
    this.selectedUser.set(null);
  }

}
