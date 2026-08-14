import { Component, computed, inject, signal } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RequestService } from '../../transshipmentrequest.service';
import { TransshipmentResponse, RequestStatus } from '../../transhipmentrequest.models';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { AuthenticatedUser } from '../../auth.models';
import { LucideListFilter, LucidePlus, LucideSearch, LucideTrash, LucideX } from '@lucide/angular';
import { finalize } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { Modal } from '../../modal/modal';
import { Modaledit } from '../../modaledit/modaledit';


@Component({
  selector: 'app-my-applications',
  imports: [DashboardLayout, ReactiveFormsModule, LucideListFilter, LucideSearch, LucidePlus, LucideX, LucideTrash],
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.css',
})
export class MyApplications {
  private readonly formbuilder = inject(FormBuilder);
  private readonly requestService = inject(RequestService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(Dialog);
  readonly currentUser = signal<AuthenticatedUser | null>(null);
  readonly requests = signal<TransshipmentResponse[]>([]);
  readonly search = signal("");
  readonly currentResponse = signal<TransshipmentResponse|null>(null);
  readonly selectedRequest = signal<TransshipmentResponse | null>(null);

  //applications: TransshipmentResponse[] = [];

  readonly isLoading = signal(true);
  id = "";
  name = "";
  email ="";
  trn = "";
  shippingagent = "";
  phoneNumber = "";
  errorMessage ="";
  successMessage ="";

  readonly isFilterOpen = signal(false);
  readonly statusFilter = signal<RequestStatus | "ALL">("ALL");

  readonly requestPendingDelete = signal<TransshipmentResponse | null>(null);
  readonly showDeleteConfirmation = signal(false);
  readonly isDeleting = signal(false);
  readonly deleteErrorMessage = signal("");

//Collect ID of the current USER to use for later methods
  constructor(){
    this.authService.getCurrentUser().subscribe({
      next: (data) =>{
        this.id= data.id;
        this.email = data.email ?? "";
        this.shippingagent = data.shippingAgentName ?? "";
        this.trn = data.companyTRN ?? "";
        this.name = data.fullName ?? "";
        this.phoneNumber = data.telephone ?? "";
        this.loadRequests();
      }, error: () => {
        this.errorMessage = "Unable to locate User data, please refresh and try again."
      }
    })
  }

  //collect the content of the requests linked to the current user

  private loadRequests(): void{
    this.requestService.getbyUser(this.id).pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      ).subscribe({
        next: data => {this.requests.set(data);},
        error: (error:HttpErrorResponse) =>{
          this.errorMessage = "There was an error in loading the requests";
        }
      })
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.search.set(input.value);
  }

  toggleFilter(): void {
    this.isFilterOpen.update(open => !open);
  }

  clearFilters(): void {
    this.statusFilter.set("ALL");
  }

  openRequestDetails(request: TransshipmentResponse): void {
    this.selectedRequest.set(request);
  }

  closeRequestDetails(): void {
    this.selectedRequest.set(null);
  }


  //Collecting the data from the existing user to be prefilled in the modal and also opens it 
  openCreateRequestModal(): void {
    const dialogRef = this.dialog.open<TransshipmentResponse | undefined>(Modal, {
      data: {
        requesterUserId: this.id,
        shippingAgentName: this.shippingagent,
        applicantName: this.name,
        emailAddress: this.email,
        phoneNumber: this.phoneNumber,
        trn: this.trn
      }
    });

    dialogRef.closed.subscribe((newRequest) => {
      if (newRequest) {
        this.requests.update(current => [...current, newRequest]);
      }
    });
  }

  //Opens the edit modal for the currently selected request, prefilled with its existing data
  openEditRequestModal(request: TransshipmentResponse): void {
    const dialogRef = this.dialog.open<TransshipmentResponse | undefined>(Modaledit, {
      data: request
    });

    dialogRef.closed.subscribe((updatedRequest) => {
      if (updatedRequest) {
        this.requests.update(current =>
          current.map(r => r.requestId === updatedRequest.requestId ? updatedRequest : r)
        );
        this.selectedRequest.set(updatedRequest);
      }
    });
  }

  //Opens the delete confirmation for a given request (called from the table's delete button)
  openDeleteConfirmation(event: Event, request: TransshipmentResponse): void {
    event.stopPropagation();
    this.requestPendingDelete.set(request);
    this.showDeleteConfirmation.set(true);
    this.deleteErrorMessage.set("");
  }

  cancelDelete(): void {
    this.requestPendingDelete.set(null);
    this.showDeleteConfirmation.set(false);
    this.deleteErrorMessage.set("");
  }

  confirmDelete(): void {
    const request = this.requestPendingDelete();

    if (!request || this.isDeleting()) {
      return;
    }

    this.isDeleting.set(true);
    this.deleteErrorMessage.set("");

    this.requestService.delete(request.requestId)
      .pipe(
        finalize(() => {
          this.isDeleting.set(false);
        })
      )
      .subscribe({
        next: () => {
          this.requests.update(current => current.filter(r => r.requestId !== request.requestId));

          if (this.selectedRequest()?.requestId === request.requestId) {
            this.closeRequestDetails();
          }

          this.requestPendingDelete.set(null);
          this.showDeleteConfirmation.set(false);
        },
        error: () => {
          this.deleteErrorMessage.set("We could not delete this request. Please try again.");
        }
      });
  }

  //Formats an ISO timestamp as DD, MM, YYYY HH:MM
  formatCreatedAt(createdAt: string): string {
    const date = new Date(createdAt);

    if (isNaN(date.getTime())) {
      return createdAt;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year}`;
  }


  readonly filteredRequests = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.requests().filter(request => {
      const matchesStatus = status === "ALL" || request.status === status;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const creationDate = request.createdAt ?? "";
      const statusLabel = this.getStatusLabel(request.status).toLowerCase();
      const manifestNo = request.manifestNumber ?? "";
      const billofLading = request.billOfLadingWaybill ?? "";
      const requestType = request.requestType ?? "";

      return (
        creationDate.toLowerCase().includes(query) ||
        statusLabel.includes(query) || manifestNo.toLowerCase().includes(query)||
        billofLading.toLowerCase().includes(query)||
        requestType.toLowerCase().includes(query)
      );
    });
  }
);

  getStatusLabel(status: RequestStatus): string {
      switch (status) {
        case "SUBMITTED": return "Submitted";
        case "UNDER_REVIEW": return "Under Review";
        case "APPROVED": return "Approved";
        case "REJECTED": return "Rejected";
        case "RESUBMITTED": return "Resubmitted";
      }
}

}