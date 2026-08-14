import { Component, computed, inject, signal } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RequestService } from '../../transshipmentrequest.service';
import { TransshipmentResponse, Transshipmentrequest, RequestStatus } from '../../transhipmentrequest.models';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { AuthenticatedUser } from '../../auth.models';
import { LucideListFilter, LucidePlus, LucideSearch, LucideX } from '@lucide/angular';
import { finalize } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { ModalReview } from '../../modal-review/modal-review';

type ReviewQueueStatusFilter = 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESUBMITTED';

@Component({
  selector: 'app-review-queue',
  imports: [DashboardLayout, ReactiveFormsModule, LucideListFilter, LucideSearch, LucidePlus, LucideX],
  templateUrl: './review-queue.html',
  styleUrl: './review-queue.css',
})
export class ReviewQueue {
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
  readonly isLoading = signal(true);

  errorMessage ="";
  successMessage ="";

  readonly isFilterOpen = signal(false);
  readonly statusFilter = signal<ReviewQueueStatusFilter>("ALL");
  readonly dateFrom = signal("");
  readonly dateTo = signal("");

  constructor() {
    this.loadRequests();
  }

  private loadRequests(): void{
    this.requestService.getAll().pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      ).subscribe({
        next: data => {
          const reviewableStatuses: RequestStatus[] = ['SUBMITTED', 'RESUBMITTED', 'UNDER_REVIEW'];
          const reviewable = data.filter(request => reviewableStatuses.includes(request.status));
          this.requests.set(reviewable);
        },
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
    this.dateFrom.set("");
    this.dateTo.set("");
  }

  openRequestDetails(request: TransshipmentResponse): void {
    this.selectedRequest.set(request);
  }

  closeRequestDetails(): void {
    this.selectedRequest.set(null);
  }

  //Opens the read-only review modal for the currently selected request, with the accept/reject decision panel.
  //Note: ModalReview itself marks the request UNDER_REVIEW on open, so no status change happens here.
  openReviewModal(request: TransshipmentResponse): void {
    const dialogRef = this.dialog.open<TransshipmentResponse | undefined>(ModalReview, {
      data: request
    });

    dialogRef.closed.subscribe((decidedRequest) => {
      if (decidedRequest) {
        this.requests.update(current =>
          current.filter(r => r.requestId !== decidedRequest.requestId)
        );
        this.closeRequestDetails();
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
    const fromDate = this.dateFrom();
    const toDate = this.dateTo();

    return this.requests().filter(request => {
      const matchesStatus = status === "ALL" || request.status === status;

      if (!matchesStatus) {
        return false;
      }

      const createdDate = request.createdAt ? new Date(request.createdAt) : null;

      if (fromDate && createdDate) {
        const from = new Date(fromDate);
        if (createdDate < from) {
          return false;
        }
      }

      if (toDate && createdDate) {
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (createdDate > to) {
          return false;
        }
      }

      if (!query) {
        return true;
      }

      const portTerminal = request.portTerminal ?? "";
      const shippingAgentName = request.shippingAgentName ?? "";
      const manifestNo = request.manifestNumber ?? "";

      return (
        portTerminal.toLowerCase().includes(query) ||
        shippingAgentName.toLowerCase().includes(query) ||
        manifestNo.toLowerCase().includes(query)
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