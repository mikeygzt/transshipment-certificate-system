import { Component, computed, inject, signal } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { RequestService } from '../../transshipmentrequest.service';
import { TransshipmentResponse, TransshipmentRequest, RequestStatus } from '../../transhipmentrequest.models';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { AuthenticatedUser } from '../../auth.models';
import { LucideDownload, LucideEye, LucideListFilter, LucideSearch, LucideSquareKanban, LucideChevronRight } from '@lucide/angular';
import { finalize } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { ModalReview } from '../../modal-review/modal-review';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DatePipe } from '@angular/common';
import { CertificateService } from '../../certificate.service';
import { RouterLink } from '@angular/router';

export type ReviewQueueStatusFilter = "ALL" | "SUBMITTED" | "UNDER_REVIEW" | "RESUBMITTED";

@Component({
  selector: 'app-review-queue',
  imports: [DashboardLayout,
    ReactiveFormsModule,
    LucideListFilter,
    LucideSearch,
    LucideEye,
    LucideDownload,
    LucideSquareKanban,
    NgxDatatableModule,
    DatePipe,
    RouterLink, 
    LucideChevronRight
  ],
  templateUrl: './approved-requests.html',
  styleUrl: './approved-requests.css',
})
export class ApprovedRequests {
  private readonly requestService = inject(RequestService);
  private readonly certificateService = inject(CertificateService);
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
  readonly statusFilter = signal("APPROVED");
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
  }

  private loadRequests(): void{
    this.requestService.getAll().pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      ).subscribe({
        next: data => {
          const reviewableStatuses: RequestStatus[] = ['APPROVED'];
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

  onTableActivate(event: any): void {
    if (event.type === "click" && event.row) {
      this.selectedRequest.set(event.row);
    }
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

  readonly filteredRequests = computed(() => {
    const query = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    const fromDate = this.dateFrom();
    const toDate = this.dateTo();

    return this.requests().filter(request => {
      const matchesStatus = status === "APPROVED";

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

  viewCertificate(requestId: string) {
    this.certificateService
      .generateCertificatePdf(requestId)
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);
          window.open(url, "_blank");

          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000);
        },
        error: (error) => {
          console.error("Failed to load certificate:", error);
        }
      });
  }

  downloadCertificate(requestId: string) {
    console.log("Download clicked: ", requestId);
    this.certificateService
      .generateCertificatePdf(requestId)
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = `transshipment-certificate-${requestId}.pdf`;

          link.click();

          URL.revokeObjectURL(url);
        },
        error: (error) => {
          console.error("Failed to download certificate:", error);
        }
      });
  }
}