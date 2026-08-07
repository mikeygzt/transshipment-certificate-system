import { Component, computed, inject, signal } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { UserGovernanceService } from './user-governance.service';
import { UserResponse } from '../../auth.models';
import { finalize } from 'rxjs';
import { LucideListFilter, LucideSearch, LucideSquarePen, LucideX } from '@lucide/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-governance',
  imports: [
    DashboardLayout,
    ReactiveFormsModule, 
    LucideSearch, 
    LucideListFilter,
    LucideX,
    LucideSquarePen
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

  readonly isEditingFullName = signal(false);

  readonly isSaving = signal(false);
  readonly saveErrorMessage = signal("");

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

    this.fullNameControl.setValue(user.fullName);
    this.fullNameControl.markAsPristine();
    this.isEditingFullName.set(false);
  }

  closeUserDetails(): void {
    this.selectedUser.set(null);
  }

  readonly fullNameControl = new FormControl("", {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.maxLength(100),
      Validators.minLength(5),
      Validators.pattern('[a-zA-Z ]*')
    ]
  });

  editFullName(): void {
    this.isEditingFullName.set(true);
    this.saveErrorMessage.set("");
  }

  cancelChanges(): void {
    const user = this.selectedUser();

    if (!user) {
      return;
    }

    this.fullNameControl.setValue(user.fullName);
    this.fullNameControl.markAsPristine();
    this.isEditingFullName.set(false);
  }

  hasFullNameChanges(): boolean {
    const user = this.selectedUser();

    if (!user) {
      return false;
    }

    return this.fullNameControl.value.trim() !== user.fullName;
  }

  saveChanges(): void {
    const user = this.selectedUser();

    if(!user || this.fullNameControl.invalid || !this.hasFullNameChanges()) {
      return;
    }

    this.isSaving.set(true);
    this.saveErrorMessage.set("");

    this.userGovernanceService
      .updateUser(user.id, this.fullNameControl.value.trim())
      .pipe(
        finalize(() => {
          this.isSaving.set(false)
        })
      )
      .subscribe({
        next: updatedUser => {
          this.selectedUser.set(updatedUser);

          this.users.update(users => 
            users.map(existingUser => 
              existingUser.id === updatedUser.id ? updatedUser : existingUser
            )
          )

          this.fullNameControl.setValue(updatedUser.fullName);
          this.fullNameControl.markAsPristine();
          this.isEditingFullName.set(false);
        },

        error: () => {
          this.saveErrorMessage.set("We could not save your changes. Please try again.");
        }
      })
  }

}
