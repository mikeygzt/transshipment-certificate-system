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

  constructor() {
  this.loadRequests();
} 

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.search.set(input.value);
  }

  openRequestDetails(request: TransshipmentResponse): void {
    this.selectedRequest.set(request);

    if (request.status === 'SUBMITTED' || request.status === 'RESUBMITTED') {
      const updatedRequest = this.toUpdateRequest(request, 'UNDER_REVIEW');

      this.requestService.update(request.requestId, updatedRequest).subscribe({
        next: () => {
          const refreshedRequest: TransshipmentResponse = { ...request, status: 'UNDER_REVIEW' };
          this.selectedRequest.set(refreshedRequest);
          this.requests.update(current =>
            current.map(r => r.requestId === refreshedRequest.requestId ? refreshedRequest : r)
          );
        },
        error: () => {
          this.errorMessage = "Could not mark this request as under review.";
        }
      });
    }
  }

  closeRequestDetails(): void {
    this.selectedRequest.set(null);
  }

  //Opens the read-only review modal for the currently selected request, with the accept/reject decision panel
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

  private toUpdateRequest(request: TransshipmentResponse, status: RequestStatus): Transshipmentrequest {
    return {
      requestId: request.requestId,
      requesterUserId: request.requesterUserId,
      shippingAgentName: request.shippingAgentName,
      agentCodeJca: request.agentCodeJca,
      trn: request.trn,
      applicantName: request.applicantName,
      emailAddress: request.emailAddress,
      phoneNumber: request.phoneNumber,
      requestType: request.requestType,
      portTerminal: request.portTerminal,
      purposeOfCertificate: request.purposeOfCertificate,
      inboundVoyageNo: request.inboundVoyageNo,
      inboundVesselName: request.inboundVesselName,
      dateOfArrival: request.dateOfArrival,
      outboundVoyageNumber: request.outboundVoyageNumber,
      outboundVesselName: request.outboundVesselName,
      expectedDepartureDate: request.expectedDepartureDate,
      manifestNumber: request.manifestNumber,
      billOfLadingWaybill: request.billOfLadingWaybill,
      rotationCallReference: request.rotationCallReference,
      remarksInstructions: request.remarksInstructions,
      status: status,
      reviewComments: request.reviewComments,
      pdfCertificatePath: request.pdfCertificatePath,
      containers: request.containers.map(container => ({
        containerId: container.containerId,
        requestId: container.requestId,
        containerNumber: container.containerNumber,
        sealNumber: container.sealNumber,
        sizeType: container.sizeType,
        cargoDescription: container.cargoDescription,
        packages: container.packages,
        grossWeightKg: container.grossWeightKg,
        yardLocation: container.yardLocation,
        origin: container.origin,
        finalDestination: container.finalDestination
      }))
    };
  }

  readonly filteredRequests = computed(() => {
    const query = this.search().trim().toLowerCase();

    if (!query) {
      return this.requests();
    }

    return this.requests().filter(request => {
      const creationDate = request.createdAt ?? "";
      const status = this.getStatusLabel(request.status).toLowerCase();
      const manifestNo = request.manifestNumber ?? "";
      const billofLading = request.billOfLadingWaybill ?? "";
      const requestType = request.requestType ?? "";


      return (
        creationDate.toLowerCase().includes(query) ||
        status.includes(query)|| manifestNo.toLowerCase().includes(query)||
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