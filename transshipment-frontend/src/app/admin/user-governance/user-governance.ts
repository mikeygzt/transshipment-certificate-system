import { Component, computed, inject, signal } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { UserGovernanceService } from './user-governance.service';
import { UserResponse, UserRole } from '../../auth.models';
import { finalize } from 'rxjs';
import { LucideListFilter, LucideSearch, LucideSquarePen, LucideTriangleAlert, LucideX } from '@lucide/angular';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-governance',
  imports: [
    DashboardLayout,
    ReactiveFormsModule, 
    LucideSearch, 
    LucideListFilter,
    LucideX,
    LucideSquarePen,
    LucideTriangleAlert
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
  readonly isEditingEmail = signal(false);
  readonly isEditingTelephone = signal(false);
  readonly isEditingCompanyTRN = signal(false);
  readonly isEditingShippingAgentName = signal(false);
  readonly isEditingRole = signal(false);

  readonly isSaving = signal(false);
  readonly saveErrorMessage = signal("");

  readonly showDeactivateConfirmation = signal(false);
  readonly showDeleteConfirmation = signal(false);

  readonly isDeactivating = signal(false)
  readonly deactivateErrorMessage = signal("");

  readonly isDeleting = signal(false);
  readonly deleteErrorMessage = signal("");

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

    this.emailControl.setValue(user.email);
    this.emailControl.markAsPristine();

    this.telephoneControl.setValue(user.telephone);
    this.telephoneControl.markAsPristine();

    this.companyTRNControl.setValue(user.companyTRN);
    this.companyTRNControl.markAsPristine();

    this.shippingAgentNameControl.setValue(user.shippingAgentName);
    this.shippingAgentNameControl.markAsPristine();

    this.roleControl.setValue(user.role);
    this.roleControl.markAsPristine();

    this.isEditingFullName.set(false);
    this.isEditingEmail.set(false);
    this.isEditingTelephone.set(false);
    this.isEditingCompanyTRN.set(false);
    this.isEditingShippingAgentName.set(false);
    this.isEditingRole.set(false);
    
    this.showDeactivateConfirmation.set(false);
    this.showDeleteConfirmation.set(false);
  }

  closeUserDetails(): void {
    this.selectedUser.set(null);
    this.showDeactivateConfirmation.set(false);
    this.showDeleteConfirmation.set(false);
    this.deactivateErrorMessage.set("");
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

  readonly emailControl = new FormControl("", {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.email
    ]
  });
  
  readonly telephoneControl = new FormControl("", {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/^(\d{10}|\d{3}-\d{3}-\d{4})$/)
    ]
  });

  readonly companyTRNControl = new FormControl("", {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/^\d{13}$/)
    ]
  });

  readonly shippingAgentNameControl = new FormControl("", {
    nonNullable: true,
    validators: [
      Validators.required
    ]
  });

  readonly roleControl = new FormControl<UserRole>("REQUESTER", {
    nonNullable: true
  });


  editFullName(): void {
    this.isEditingFullName.set(true);
    this.saveErrorMessage.set("");
  }

  editEmail(): void {
    this.isEditingEmail.set(true);
    this.saveErrorMessage.set("");
  }

  editTelephone(): void {
    this.isEditingTelephone.set(true);
    this.saveErrorMessage.set("");
  }

  editCompanyTRN(): void {
    this.isEditingCompanyTRN.set(true);
    this.saveErrorMessage.set("");
  }

  editShippingAgentName(): void {
    this.isEditingShippingAgentName.set(true);
    this.saveErrorMessage.set("");
  }

  editRole(): void {
    this.isEditingRole.set(true);
    this.saveErrorMessage.set("");
  }

  openDeactivateConfirmation(): void {
    this.showDeactivateConfirmation.set(true);
  }

  cancelDeactivate(): void {
    this.showDeactivateConfirmation.set(false);
    this.deactivateErrorMessage.set("");
  }

  openDeleteConfirmation(): void {
    this.showDeleteConfirmation.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirmation.set(false);
  }

  cancelChanges(): void {
    const user = this.selectedUser();

    if (!user) {
      return;
    }

    this.fullNameControl.setValue(user.fullName);
    this.fullNameControl.markAsPristine();
    this.isEditingFullName.set(false);

    this.emailControl.setValue(user.email);
    this.emailControl.markAsPristine();
    this.isEditingEmail.set(false);

    this.telephoneControl.setValue(user.telephone);
    this.telephoneControl.markAsPristine();
    this.isEditingTelephone.set(false);

    this.companyTRNControl.setValue(user.companyTRN);
    this.companyTRNControl.markAsPristine();
    this.isEditingCompanyTRN.set(false);
    
    this.shippingAgentNameControl.setValue(user.shippingAgentName);
    this.shippingAgentNameControl.markAsPristine();
    this.isEditingShippingAgentName.set(false);

    this.roleControl.setValue(user.role);
    this.roleControl.markAsPristine();
    this.isEditingRole.set(false);

    this.saveErrorMessage.set("");
  }

  hasChanges(): boolean {
    const user = this.selectedUser();

    if (!user) {
      return false;
    }

    return (
      this.fullNameControl.value.trim() !== user.fullName ||
      this.emailControl.value.trim() !== user.email ||
      this.telephoneControl.value.trim() !== user.telephone ||
      this.companyTRNControl.value.trim() !== user.companyTRN ||
      this.shippingAgentNameControl.value.trim() !== user.shippingAgentName ||
      this.roleControl.value !== user.role
    );
  }

  saveChanges(): void {
    const user = this.selectedUser();

    if(
      !user || 
      this.fullNameControl.invalid || 
      this.emailControl.invalid ||
      this.telephoneControl.invalid ||
      this.companyTRNControl.invalid || 
      this.shippingAgentNameControl.invalid ||
      this.roleControl.invalid  ||
      !this.hasChanges()
    ) {
      return;
    }

    this.isSaving.set(true);
    this.saveErrorMessage.set("");

    this.userGovernanceService
      .updateUser(
        user.id, 
        this.fullNameControl.value.trim(),
        this.emailControl.value.trim(),
        this.telephoneControl.value.trim(),
        this.companyTRNControl.value.trim(),
        this.shippingAgentNameControl.value.trim(),
        this.roleControl.value,
      )
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

          this.emailControl.setValue(updatedUser.email);
          this.emailControl.markAsPristine();
          this.isEditingEmail.set(false);

          this.telephoneControl.setValue(updatedUser.telephone);
          this.telephoneControl.markAsPristine();
          this.isEditingTelephone.set(false);

          this.companyTRNControl.setValue(updatedUser.companyTRN);
          this.companyTRNControl.markAsPristine();
          this.isEditingCompanyTRN.set(false);

          this.shippingAgentNameControl.setValue(updatedUser.shippingAgentName);
          this.shippingAgentNameControl.markAsPristine();
          this.isEditingShippingAgentName.set(false);

          this.roleControl.setValue(updatedUser.role);
          this.roleControl.markAsPristine();
          this.isEditingRole.set(false);
        },

        error: () => {
          this.saveErrorMessage.set("We could not save your changes. Please try again.");
        }
      })
  }

  deactivateSelectedUser(): void {
    const user = this.selectedUser();

    if(!user || this.isDeactivating()) {
      return;
    }

    this.isDeactivating.set(true);
    this.deactivateErrorMessage.set("");

    this.userGovernanceService
      .deactivateUser(user.id)
      .pipe(
        finalize(() => {
          this.isDeactivating.set(false);
        })
      )
      .subscribe({
        next: updatedUser => {
          this.selectedUser.set(updatedUser);

          this.users.update(users => 
            users.map(existingUser => 
              existingUser.id === updatedUser.id
              ? updatedUser
              : existingUser
            )
          );

          this.showDeactivateConfirmation.set(false);
          this.cancelChanges();
        },

        error: () => {
          this.deactivateErrorMessage.set("We could not deactivate this account. Please try again.");
        }
      });
  }

}
