import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RequestService } from '../transshipmentrequest.service';
import { AuthService } from '../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Transshipmentrequest, TransshipmentResponse } from '../transhipmentrequest.models';

function departureAfterArrivalValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const arrival = group.get('dateOfArrival')?.value;
    const departure = group.get('expectedDepartureDate')?.value;

    if (!arrival || !departure) {
      return null;
    }

    return new Date(departure) > new Date(arrival)
      ? null
      : { departureBeforeArrival: true };
  };
}

@Component({
  selector: 'app-modaledit',
  imports: [ReactiveFormsModule],
  templateUrl: './modaledit.html',
  styleUrl: './modaledit.css',
})
export class Modaledit {
  private readonly formbuilder = inject(FormBuilder);
  private readonly requestService = inject(RequestService);
  private readonly authService = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly existingRequest = inject<TransshipmentResponse>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<TransshipmentResponse, Modaledit>);

  isSubmitting = false;
  errorMessage = "";

  requesttype = [
    { id: 1, name: 'Single Certificate-Multiple Containers' },
    { id: 2, name: 'Single Container Cetificate' },
    { id: 3, name: 'Batch Certificate by Bill of Lading' }
  ]

  portterminal = [
    { id: 1, name: 'Kingston Freeport Container Terminal' },
    { id: 2, name: 'Kingston Wharves Limited' },
    { id: 3, name: 'Port Handlers Ltd - Montego Bay' }
  ]

  certificatepurpose = [
    { id: 1, name: 'Transshipment Control' },
    { id: 2, name: 'Trade Documentation' },
    { id: 3, name: 'Overseeas Customs Requests' },
    { id: 4, name: 'Consignee/Carrier Request' },
    { id: 5, name: 'Other' }
  ]

  sizetype = [
    { id: 1, name: '20GP' },
    { id: 2, name: '40GP' },
    { id: 3, name: '40HC' },
    { id: 4, name: '45HC'},
    { id: 5, name: '40RF'},
    { id: 6, name: 'Other'}
  ]

  readonly form = this.formbuilder.group({
    shippingAgentName: [
      this.existingRequest.shippingAgentName, {
        validators: [
          Validators.required,
          Validators.maxLength(255),
          Validators.pattern('[a-zA-Z ]*'),
        ], nonNullable: true
      }
    ],
    agentCodeJca: [
      this.existingRequest.agentCodeJca ?? "", [
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z0-9-]+$'),
      ]
    ],
    trn: [
      this.existingRequest.trn ?? "", [
        Validators.required,
        Validators.maxLength(13),
        Validators.pattern(/^\d{13}$/),
      ]
    ],
    applicantName: [
      this.existingRequest.applicantName ?? "", [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern('[a-zA-Z ]*'),
      ]
    ],
    emailAddress: [
      this.existingRequest.emailAddress ?? "",
      [
        Validators.required,
        Validators.email
      ]
    ],
    phoneNumber: [
      this.existingRequest.phoneNumber ?? "",
      [
        Validators.required,
        Validators.pattern(/^(\d{10}|\d{3}-\d{3}-\d{4})$/)
      ]
    ],
    requestType: [
      this.existingRequest.requestType, {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    portTerminal: [
      this.existingRequest.portTerminal,
      {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    purposeOfCertificate: [
      this.existingRequest.purposeOfCertificate,
      {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    inboundVoyageNo: [
      this.existingRequest.inboundVoyageNo, {
        validators:
          [
            Validators.required,
            Validators.maxLength(100)
          ], nonNullable: true

      }
    ],
    inboundVesselName: [
      this.existingRequest.inboundVesselName, {
        validators:
          [
            Validators.required,
            Validators.maxLength(255),
            Validators.pattern('[a-zA-Z ]*')
          ], nonNullable: true

      }
    ],
    dateOfArrival: [
      this.existingRequest.dateOfArrival, {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    outboundVoyageNumber: [
      this.existingRequest.outboundVoyageNumber, {
        validators: [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9-]+$'),
        ], nonNullable: true
      }

    ],
    outboundVesselName: [
      this.existingRequest.outboundVesselName, {
        validators:
          [
            Validators.required,
            Validators.maxLength(255),
            Validators.pattern('[a-zA-Z ]*')
          ], nonNullable: true

      }
    ],
    expectedDepartureDate: [
      this.existingRequest.expectedDepartureDate, {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    manifestNumber: [
      this.existingRequest.manifestNumber, {
        validators: [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9-]+$'),
        ], nonNullable: true
      }
    ],
    billOfLadingWaybill: [
      this.existingRequest.billOfLadingWaybill, {
        validators: [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9-]+$'),
        ], nonNullable: true
      }
    ],
    rotationCallReference: [
      this.existingRequest.rotationCallReference ?? "", [
        Validators.maxLength(100),
        Validators.pattern('[a-zA-Z0-9-]+$')
      ]
    ],
    remarksInstructions: [
      this.existingRequest.remarksInstructions ?? "", [
        Validators.maxLength(512)
      ]
    ],
    containers: this.formbuilder.array(
      this.existingRequest.containers.map(container => this.createContainerGroup(container))
    )
  }, { validators: departureAfterArrivalValidator() });

  get containers(): FormArray {
    return this.form.get('containers') as FormArray;
  }

  private createContainerGroup(existing?: TransshipmentResponse['containers'][number]): FormGroup {
    return this.formbuilder.group({
      containerId: [existing?.containerId ?? ""],
      containerNumber: [
        existing?.containerNumber ?? "", {
          validators: [
            Validators.required,
            Validators.maxLength(20),
          ], nonNullable: true
        }
      ],
      sealNumber: [
        existing?.sealNumber ?? "", [
          Validators.maxLength(50)
        ]
      ],
      sizeType: [
        existing?.sizeType ?? "", {
          validators: [
            Validators.required,
          ], nonNullable: true
        }
      ],
      cargoDescription: [
        existing?.cargoDescription ?? "", { nonNullable: true }
      ],
      packages: [
        existing?.packages ?? 0, {
          validators: [
            Validators.min(0)
          ], nonNullable: true
        }
      ],
      grossWeightKg: [
        existing?.grossWeightKg ?? 0, {
          validators: [
            Validators.min(0)
          ], nonNullable: true
        }
      ],
      yardLocation: [
        existing?.yardLocation ?? "", { nonNullable: true }
      ],
      origin: [
        existing?.origin ?? "", { nonNullable: true }
      ],
      finalDestination: [
        existing?.finalDestination ?? "", { nonNullable: true }
      ]
    });
  }

  addContainer(): void {
    this.containers.push(this.createContainerGroup());
  }

  removeContainer(index: number): void {
    this.containers.removeAt(index);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = "";

    const formValue = this.form.getRawValue();

    const request: Transshipmentrequest = {
      requestId: this.existingRequest.requestId,
      requesterUserId: this.existingRequest.requesterUserId,
      shippingAgentName: formValue.shippingAgentName,
      agentCodeJca: formValue.agentCodeJca,
      trn: formValue.trn,
      applicantName: formValue.applicantName,
      emailAddress: formValue.emailAddress,
      phoneNumber: formValue.phoneNumber,
      requestType: formValue.requestType,
      portTerminal: formValue.portTerminal,
      purposeOfCertificate: formValue.purposeOfCertificate,
      inboundVoyageNo: formValue.inboundVoyageNo,
      inboundVesselName: formValue.inboundVesselName,
      dateOfArrival: formValue.dateOfArrival,
      outboundVoyageNumber: formValue.outboundVoyageNumber,
      outboundVesselName: formValue.outboundVesselName,
      expectedDepartureDate: formValue.expectedDepartureDate,
      manifestNumber: formValue.manifestNumber,
      billOfLadingWaybill: formValue.billOfLadingWaybill,
      rotationCallReference: formValue.rotationCallReference,
      remarksInstructions: formValue.remarksInstructions,
      status: this.existingRequest.status,
      reviewComments: this.existingRequest.reviewComments,
      pdfCertificatePath: this.existingRequest.pdfCertificatePath,
      containers: formValue.containers.map((container) => ({
        containerId: container['containerId'],
        requestId: this.existingRequest.requestId,
        containerNumber: container['containerNumber'],
        sealNumber: container['sealNumber'],
        sizeType: container['sizeType'],
        cargoDescription: container['cargoDescription'],
        packages: container['packages'],
        grossWeightKg: container['grossWeightKg'],
        yardLocation: container['yardLocation'],
        origin: container['origin'],
        finalDestination: container['finalDestination']
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
            ...request,
            containers: request.containers.map(c => ({ ...c, containerId: c.containerId || "" }))
          };
          this.dialogRef.close(updatedResponse);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = "We could not update your request. Please try again.";
          this.changeDetector.markForCheck();
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}