import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CertificateService } from '../certificate.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { LucideCircleCheckBig, LucideCircleX, LucideChevronRight, LucideExternalLink, LucideSearch } from '@lucide/angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface CertificateVerificationResponse {
    controlNumber: string;
    status: "VALID" | "INVALID";
    issuedAt: string;
}

@Component({
  selector: 'app-certificate-verification',
  imports: [
    DatePipe,
    LucideCircleCheckBig,
    LucideCircleX,
    LucideChevronRight,
    LucideExternalLink,
    LucideSearch,
    RouterLink,
    ReactiveFormsModule
],
  templateUrl: './certificate-verification.html',
  styleUrl: './certificate-verification.css',
})
export class CertificateVerification {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly certificateService = inject(CertificateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);

  readonly verification = signal<CertificateVerificationResponse | null>(null);
  readonly isLoading = signal(true);
  readonly errorMessage = signal("");
  readonly routeControlNumber = signal<string | null>(null);
  isSubmitting = false;

  readonly manualControlNumber = new FormControl("", {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/^JCA-TSC-\d{4}-\d{6}$/)
    ]
  })

  readonly verificationForm = new FormGroup({
    controlNumber: this.manualControlNumber
  });

  readonly isValid = computed(() =>
    this.verification()?.status === "VALID"
  );

  constructor() {
    this.route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(params => {
        const code = params.get("controlNumber");

        this.routeControlNumber.set(code);

        if (code) {
          this.verifyCertificate(code);
        } else {
          this.verification.set(null);
          this.errorMessage.set("");
          this.isLoading.set(false);
        }
      })
  }

  verifyManually(): void {

    if (this.manualControlNumber.invalid || this.isSubmitting) {
      this.verificationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const code = this.manualControlNumber.value.trim().toUpperCase();

    this.router.navigate([
      "/verify-certificate",
      code
    ]);
  }

  private verifyCertificate(code: string): void {
    const controlNumber = this.route.snapshot.paramMap.get("controlNumber");
    
    if (!controlNumber) {
      
      this.errorMessage.set("No certificate number was provided.");

      this.isLoading.set(false);
      return;
    }
    
    this.certificateService
      .verifyCertificate(controlNumber)
      .subscribe({
        next: (response) => {
          this.verification.set(response);
          this.isLoading.set(false);
        },

        error: (error: HttpErrorResponse) => {
          if (error.status === 404) {
            this.errorMessage.set("This certificate could not be verified by the JCA Transshipment Certificate System.");
          } else {
            this.errorMessage.set("Certificate verification is currently unavailable.");
          }

          this.isLoading.set(false);
        }
      })
  }

  viewVerifiedCertificatePdf(): void {
    const certificate = this.verification();

    if (!certificate || certificate.status !== "VALID") {
      return;
    }

    this.certificateService
      .getVerifiedCertificatePdf(certificate.controlNumber)
      .subscribe({
        next: (blob: Blob) => {
          const url = URL.createObjectURL(blob);

          window.open(url, "_blank");

          setTimeout(() => {
            URL.revokeObjectURL(url);
          }, 1000)
        },
        
        error: (error) => {
          console.error(
            "Could not open certificate:",
            error
          );
        }
      });
  }
}
