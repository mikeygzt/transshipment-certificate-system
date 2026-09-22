import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestService } from '../transshipmentrequest.service';
import { HttpErrorResponse } from '@angular/common/http';
import { exhaustMap, finalize, timer } from 'rxjs';
import { TransshipmentRequest, TransshipmentResponse, RequestStatus } from '../transhipmentrequest.models';
import { LucideRotateCwFadingClock } from '@lucide/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-modal-review',
  imports: [ReactiveFormsModule, LucideRotateCwFadingClock],
  templateUrl: './modal-review.html',
  styleUrl: './modal-review.css',
})
export class ModalReview {
  private readonly formbuilder = inject(FormBuilder);
  private readonly requestService = inject(RequestService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly dialogData = inject<TransshipmentResponse>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<TransshipmentResponse, ModalReview>);
  private readonly destroyRef = inject(DestroyRef);

  private existingRequest = this.dialogData;
  
  isClaiming = false;
  isClaimed = false;
  isClaimedByOther = false;
  isSubmitting = false;
  errorMessage = "";
  claimErrorMessage = "";

  readonly decisionForm = this.formbuilder.group({
    decision: ["", [Validators.required]],
    reviewComments: [""]
  });

  constructor() {
    this.claimRequest();
  }

  get request(): TransshipmentResponse {
    return this.existingRequest;
  }

  get isRejectSelected(): boolean {
    return this.decisionForm.controls.decision.value === 'REJECTED';
  }

  onDecisionChange(): void {
    const commentsControl = this.decisionForm.controls.reviewComments;

    if (this.isRejectSelected) {
      commentsControl.addValidators(Validators.required);
    } else {
      commentsControl.clearValidators();
    }

    commentsControl.updateValueAndValidity();
  }

  getStatusLabel(status: RequestStatus): string {
    switch (status) {
      case "SUBMITTED": return "Submitted";
      case "UNDER_REVIEW": return "Under Review";
      case "APPROVED": return "Approved";
      case "REJECTED": return "Rejected";
      case "RESUBMITTED": return "Resubmitted";
    }
  }

  private toTransshipmentrequest(source: TransshipmentResponse, status: RequestStatus): TransshipmentRequest {
    return {
      requestId: source.requestId,
      requesterUserId: source.requesterUserId,
      shippingAgentName: source.shippingAgentName,
      agentCodeJca: source.agentCodeJca,
      trn: source.trn,
      applicantName: source.applicantName,
      emailAddress: source.emailAddress,
      phoneNumber: source.phoneNumber,
      requestType: source.requestType,
      portTerminal: source.portTerminal,
      purposeOfCertificate: source.purposeOfCertificate,
      inboundVoyageNo: source.inboundVoyageNo,
      inboundVesselName: source.inboundVesselName,
      dateOfArrival: source.dateOfArrival,
      outboundVoyageNumber: source.outboundVoyageNumber,
      outboundVesselName: source.outboundVesselName,
      expectedDepartureDate: source.expectedDepartureDate,
      manifestNumber: source.manifestNumber,
      billOfLadingWaybill: source.billOfLadingWaybill,
      rotationCallReference: source.rotationCallReference,
      remarksInstructions: source.remarksInstructions,
      status: status,
      reviewComments: source.reviewComments,
      pdfCertificatePath: source.pdfCertificatePath,
      containers: source.containers.map(c => ({
        containerId: c.containerId,
        requestId: c.requestId,
        containerNumber: c.containerNumber,
        sealNumber: c.sealNumber,
        sizeType: c.sizeType,
        cargoDescription: c.cargoDescription,
        packages: c.packages,
        grossWeightKg: c.grossWeightKg,
        yardLocation: c.yardLocation,
        origin: c.origin,
        finalDestination: c.finalDestination
      }))
    };
  }

  submit(): void {
    if (
      this.decisionForm.invalid || 
      this.isSubmitting ||
      !this.isClaimed
    ) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = "";

    const formValue = this.decisionForm.getRawValue();
    const decidedStatus = formValue.decision as RequestStatus;

    const request = this.toTransshipmentrequest(this.existingRequest, decidedStatus);
    request.reviewComments = formValue.reviewComments;

    this.requestService.update(this.existingRequest.requestId, request)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetector.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          const updatedResponse: TransshipmentResponse = {
            ...this.existingRequest,
            status: decidedStatus,
            reviewComments: formValue.reviewComments
          };

          this.isClaimed = false;
          this.dialogRef.close(updatedResponse);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = "We could not submit your decision. Please try again.";
          this.changeDetector.markForCheck();
        }
      });
  }

  close(): void {
    if (!this.isClaimed) {
      this.dialogRef.close();
      return;
    }

    this.isSubmitting = false;
    this.errorMessage = "";

    this.requestService
      .release(this.existingRequest.requestId)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetector.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          const updatedResponse: TransshipmentResponse = {
            ...this.existingRequest,
            status: "SUBMITTED"
          }

          this.existingRequest = updatedResponse;
          this.isClaimed = false;
          this.dialogRef.close();
        },

        error: (error: HttpErrorResponse) => {
          this.errorMessage = "Could not release this request back to the review queue.";

          this.changeDetector.markForCheck();
        } 
      })
  }

  // SSE related method
  private claimRequest(): void {
    if (this.existingRequest.status !== "SUBMITTED" &&
       this.existingRequest.status !== "RESUBMITTED" &&
       this.existingRequest.status !== "REJECTED"
    ) {
      
      this.claimErrorMessage = "This request is already being reviewed and cannot be claimed.";
      this.isClaimedByOther = true;
      this.changeDetector.markForCheck();
      return;
    }

    if (this.existingRequest.status == "REJECTED") {
      this.claimErrorMessage = "Awaiting resubmission by applicant for rejected request.";
      this.isClaimedByOther = true;
      this.changeDetector.markForCheck();
      return;
    }

    this.isClaiming = true;
    this.isClaimedByOther = false;
    this.errorMessage = "";
    this.claimErrorMessage = "";

    this.requestService
      .claim(this.existingRequest.requestId)
      .pipe(
        finalize(() => {
          this.isClaiming = false;
          this.changeDetector.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.existingRequest = {
            ...this.existingRequest,
            status: 'UNDER_REVIEW'
          };
          
          this.isClaimed = true;
          this.startHeartbeat();
          this.changeDetector.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 409) {
            this.errorMessage = "Another reviewer has already claimed this request.";
          } else {
            this.errorMessage = "Could not claim this request for review.";
          }

          this.changeDetector.markForCheck();
        }
      });
  }

  private startHeartbeat(): void {
    timer(30000, 30000)
      .pipe(
        exhaustMap(() => 
          this.requestService.heartbeat(
            this.existingRequest.requestId
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          console.log("Review claim heartbeat sent");
        },

        error: (error: HttpErrorResponse) => {
          console.error("Review claim heartbeat failed:",
            error
          )
        }
      });
  }
}