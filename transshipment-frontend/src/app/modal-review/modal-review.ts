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
  private readonly existingRequest = inject<TransshipmentResponse>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<TransshipmentResponse, ModalReview>);

  readonly request = this.existingRequest;

  isSubmitting = false;
  errorMessage = "";

  readonly decisionForm = this.formbuilder.group({
    decision: ["", [Validators.required]],
    reviewComments: [""]
  });

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

  submit(): void {
    if (this.decisionForm.invalid || this.isSubmitting) {
      this.decisionForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = "";

    const formValue = this.decisionForm.getRawValue();
    const decidedStatus = formValue.decision as RequestStatus;

    const request: Transshipmentrequest = {
      requestId: this.existingRequest.requestId,
      requesterUserId: this.existingRequest.requesterUserId,
      shippingAgentName: this.existingRequest.shippingAgentName,
      agentCodeJca: this.existingRequest.agentCodeJca,
      trn: this.existingRequest.trn,
      applicantName: this.existingRequest.applicantName,
      emailAddress: this.existingRequest.emailAddress,
      phoneNumber: this.existingRequest.phoneNumber,
      requestType: this.existingRequest.requestType,
      portTerminal: this.existingRequest.portTerminal,
      purposeOfCertificate: this.existingRequest.purposeOfCertificate,
      inboundVoyageNo: this.existingRequest.inboundVoyageNo,
      inboundVesselName: this.existingRequest.inboundVesselName,
      dateOfArrival: this.existingRequest.dateOfArrival,
      outboundVoyageNumber: this.existingRequest.outboundVoyageNumber,
      outboundVesselName: this.existingRequest.outboundVesselName,
      expectedDepartureDate: this.existingRequest.expectedDepartureDate,
      manifestNumber: this.existingRequest.manifestNumber,
      billOfLadingWaybill: this.existingRequest.billOfLadingWaybill,
      rotationCallReference: this.existingRequest.rotationCallReference,
      remarksInstructions: this.existingRequest.remarksInstructions,
      status: decidedStatus,
      reviewComments: formValue.reviewComments,
      pdfCertificatePath: this.existingRequest.pdfCertificatePath,
      containers: this.existingRequest.containers.map(c => ({
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