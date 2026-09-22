import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RequestService } from '../../transshipmentrequest.service';
import { TransshipmentResponse, TransshipmentRequest, RequestStatus } from '../../transhipmentrequest.models';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { AuthenticatedUser } from '../../auth.models';
import { LucideFile, LucideListFilter, LucideSearch, LucideSquareKanban, LucideX } from '@lucide/angular';
import { finalize } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { ModalReview } from '../../modal-review/modal-review';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DatePipe } from '@angular/common';
import { ReviewQueueEventService } from '../../review-queue-events.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type ReviewQueueStatusFilter = 'ALL' | 'SUBMITTED' | 'UNDER_REVIEW' | 'RESUBMITTED' | 'REJECTED';

@Component({
  selector: 'app-review-queue',
  imports: [DashboardLayout, 
    ReactiveFormsModule, 
    LucideListFilter, 
    LucideSearch,
    LucideFile,
    NgxDatatableModule,
    DatePipe
  ],
  templateUrl: './review-queue.html',
  styleUrl: './review-queue.css',
})
export class ReviewQueue {
  private readonly formbuilder = inject(FormBuilder);
  private readonly requestService = inject(RequestService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(Dialog);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reviewQueueEventService = inject(ReviewQueueEventService);

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

  readonly tableSorts = [
    {
      prop: 'createdAt',
      dir: 'desc' as const
    }
  ]

  constructor() {
    this.loadRequests();
    
    // When the reviewer navigates away from the review queue page,
    // the component is destroyed and the SSE connection is closed
    this.reviewQueueEventService
      .listenForQueueChange()
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        console.log("Review queue changed. Reloading requests.")
        this.loadRequests();
      })
  }

  private loadRequests(): void{
    this.requestService.getAll().pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      ).subscribe({
        next: data => {
          const reviewableStatuses: RequestStatus[] = ['SUBMITTED', 'RESUBMITTED', 'UNDER_REVIEW', 'REJECTED'];
          const reviewable = data.filter(request => reviewableStatuses.includes(request.status));
          this.requests.set(reviewable);
        },
        error: () => {
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

  onTableActivate(event: any): void {
    if (event.type === "click" && event.row) {
      this.openReviewModal(event.row);
    }
  }

  //Opens the read-only review modal for the currently selected request, with the accept/reject decision panel.
  openReviewModal(request: TransshipmentResponse): void {
    const dialogRef = this.dialog.open<TransshipmentResponse | undefined>(ModalReview, {
      data: request,
      disableClose: true
    });

    dialogRef.closed.subscribe((updatedRequest) => {
      if (updatedRequest) {
        this.requests.update(current => 
          current.map(request => 
            request.requestId === updatedRequest.requestId
              ? updatedRequest
              : request
          )
        )
      }
    })
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
  });

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