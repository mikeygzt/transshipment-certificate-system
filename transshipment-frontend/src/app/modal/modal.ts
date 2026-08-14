import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RequestService } from '../transshipmentrequest.service';
import { AuthService } from '../auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { Transshipmentrequest, TransshipmentResponse } from '../transhipmentrequest.models';


interface ModalPrefillData {
  requesterUserId: string;
  shippingAgentName: string;
  applicantName: string;
  emailAddress: string;
  phoneNumber: string;
  trn: string;
}

//ensures that the arrival is before the departure
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
  selector: 'app-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  private readonly formbuilder = inject(FormBuilder);
  private readonly requestService = inject(RequestService);
  private readonly authService = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly prefilledData = inject<ModalPrefillData>(DIALOG_DATA);
  private readonly dialogRef = inject(DialogRef<TransshipmentResponse, Modal>);

  private readonly draftStorageKey = 'transshipment-request-draft';

  isSubmitting = false;
  errorMessage = "";
  draftSaved = false;

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
      this.prefilledData.shippingAgentName, {
        validators: [
          Validators.required,
          Validators.maxLength(255),
          Validators.pattern('[a-zA-Z ]*'),
        ], nonNullable: true
      }
    ],
    agentCodeJca: [
      "", [
        Validators.maxLength(100),
        Validators.pattern('^[a-zA-Z0-9-]+$'),
      ]
    ],
    trn: [
      this.prefilledData.trn, [
        Validators.required,
        Validators.maxLength(13),
        Validators.pattern(/^\d{13}$/),
      ]
    ],
    applicantName: [
      this.prefilledData.applicantName, [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern('[a-zA-Z ]*'),
      ]
    ],
    emailAddress: [
      this.prefilledData.emailAddress,
      [
        Validators.required,
        Validators.email
      ]
    ],
    phoneNumber: [
      this.prefilledData.phoneNumber,
      [
        Validators.required,
        Validators.pattern(/^(\d{10}|\d{3}-\d{3}-\d{4})$/)
      ]
    ],
    requestType: [
      "", {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    portTerminal: [
      "",
      {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    purposeOfCertificate: [
      "",
      {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    inboundVoyageNo: [
      "", {
        validators:
          [
            Validators.required,
            Validators.maxLength(100)
          ], nonNullable: true

      }
    ],
    inboundVesselName: [
      "", {
        validators:
          [
            Validators.required,
            Validators.maxLength(255),
            Validators.pattern('[a-zA-Z ]*')
          ], nonNullable: true

      }
    ],
    dateOfArrival: [
      "", {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    outboundVoyageNumber: [
      "", {
        validators: [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9-]+$'),
        ], nonNullable: true
      }

    ],
    outboundVesselName: [
      "", {
        validators:
          [
            Validators.required,
            Validators.maxLength(255),
            Validators.pattern('[a-zA-Z ]*')
          ], nonNullable: true

      }
    ],
    expectedDepartureDate: [
      "", {
        validators: [
          Validators.required,
        ], nonNullable: true
      }
    ],
    manifestNumber: [
      "", {
        validators: [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9-]+$'),
        ], nonNullable: true
      }
    ],
    billOfLadingWaybill: [
      "", {
        validators: [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern('^[a-zA-Z0-9-]+$'),
        ], nonNullable: true
      }
    ],
    rotationCallReference: [
      "", [
        Validators.maxLength(100),
        Validators.pattern('[a-zA-Z0-9-]+$')
      ]
    ],
    remarksInstructions: [
      "", [
        Validators.maxLength(512)
      ]
    ],
    containers: this.formbuilder.array([this.createContainerGroup()])
  }, { validators: departureAfterArrivalValidator() });

  constructor() {
    this.restoreDraft();
  }

  get containers(): FormArray {
    return this.form.get('containers') as FormArray;
  }

  private createContainerGroup(): FormGroup {
    return this.formbuilder.group({
      containerNumber: [
        "", {
          validators: [
            Validators.required,
            Validators.maxLength(20),
          ], nonNullable: true
        }
      ],
      sealNumber: [
        "", [
          Validators.maxLength(50)
        ]
      ],
      sizeType: [
        "", {
          validators: [
            Validators.required,
          ], nonNullable: true
        }
      ],
      cargoDescription: [
        "", { nonNullable: true }
      ],
      packages: [
        0, {
          validators: [
            Validators.min(0)
          ], nonNullable: true
        }
      ],
      grossWeightKg: [
        0, {
          validators: [
            Validators.min(0)
          ], nonNullable: true
        }
      ],
      yardLocation: [
        "", { nonNullable: true }
      ],
      origin: [
        "", { nonNullable: true }
      ],
      finalDestination: [
        "", { nonNullable: true }
      ]
    });
  }

  addContainer(): void {
    this.containers.push(this.createContainerGroup());
  }

  removeContainer(index: number): void {
    this.containers.removeAt(index);
  }

  private restoreDraft(): void {
    const saved = localStorage.getItem(this.draftStorageKey);
    if (!saved) {
      return;
    }

    try {
      const draft = JSON.parse(saved);

      if (Array.isArray(draft.containers)) {
        while (this.containers.length < draft.containers.length) {
          this.containers.push(this.createContainerGroup());
        }
      }

      this.form.patchValue(draft);
    } catch {
      localStorage.removeItem(this.draftStorageKey);
    }
  }

  saveDraft(): void {
    localStorage.setItem(this.draftStorageKey, JSON.stringify(this.form.getRawValue()));
    this.draftSaved = true;
    this.changeDetector.markForCheck();
  }

  submit(): void {

    console.log("Submit function reached");
    console.log('--- FORM VALIDATION BREAKDOWN ---');
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control?.invalid) {
        console.error(`❌ Field [${key}] is INVALID!`);
        console.log(`Current Value: "${control.value}" (Type: ${typeof control.value})`);
        console.log(`Active Errors:`, control.errors);
      }
    });
    console.log('---------------------------------');


    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }
    /*Form validation ^ is causing the issue. see if it can be ammended*/ 
    console.log("If statement passed");
    this.isSubmitting = true;
    this.errorMessage = "";

    const formValue = this.form.getRawValue();

    const request: Transshipmentrequest = {
      requestId: "",
      requesterUserId: this.prefilledData.requesterUserId,
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
      status: "SUBMITTED",
      reviewComments: "",
      pdfCertificatePath: "",
      containers: formValue.containers.map((container) => ({
        containerId: "",
        requestId: "",
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

    this.requestService.new(request)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetector.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          localStorage.removeItem(this.draftStorageKey);
          this.dialogRef.close(response);
        },
        error: (error: HttpErrorResponse) => {
          this.errorMessage = "We could not submit your request. Please try again.";
          this.changeDetector.markForCheck();
        }
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}