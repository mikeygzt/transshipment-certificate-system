import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestService } from '../transshipmentrequest.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Transshipmentrequest, TransshipmentResponse, RequestStatus } from '../transhipmentrequest.models';

@Component({
  selector: 'app-modal-review',
  imports: [ReactiveFormsModule],
  templateUrl: './modal-review.html',
  styleUrl: './modal-review.css',
})
export class ModalReview {
  private readonly formbuilder = inject(FormBuilder);
  private readonly requestService = inject(RequestService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly dialogData = inject<TransshipmentResponse>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<TransshipmentResponse, ModalReview>);

  private existingRequest = this.dialogData;

  isSubmitting = false;
  errorMessage = "";

  readonly decisionForm = this.formbuilder.group({
    decision: ["", [Validators.required]],
    reviewComments: [""]
  });

  constructor() {
    if (this.existingRequest.status !== 'UNDER_REVIEW') {
      const underReviewRequest = this.toTransshipmentrequest(this.existingRequest, 'UNDER_REVIEW');

      this.requestService.update(this.existingRequest.requestId, underReviewRequest).subscribe({
        next: () => {
          this.existingRequest = { ...this.existingRequest, status: 'UNDER_REVIEW' };
          this.changeDetector.markForCheck();
        },
        error: () => {
          this.errorMessage = "Could not mark this request as under review.";
          this.changeDetector.markForCheck();
        }
      });
    }
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

  private toTransshipmentrequest(source: TransshipmentResponse, status: RequestStatus): Transshipmentrequest {
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
    if (this.decisionForm.invalid || this.isSubmitting) {
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
          this.dialogRef.close(updatedResponse);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = "We could not submit your decision. Please try again.";
          this.changeDetector.markForCheck();
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}