import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-verify-email',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);

  isSubmitting = false;
  errorMessage = "";

  isResending = false;
  resendMessage = "";
  resendCooldownActive = false;

  successMessage = "";
  showLoginLink = false;

  readonly form = this.formBuilder.nonNullable.group({
    email: [
      "",
      [
        Validators.required,
        Validators.email
      ]
    ],
    code: [
      "",
      [
        Validators.required,
        // 6 digit pattern
        Validators.pattern(/^\d{6}$/)
      ]
    ]
  });

  constructor() {
    const email = this.route.snapshot.queryParamMap.get("email");

    if (email) {
      this.form.controls.email.setValue(email);
    }
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting ) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = "";
    this.showLoginLink = false;

    this.authService.verifyEmail(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetector.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.resendMessage = "";
          this.errorMessage = "";

          this.successMessage = "Your email address was verified successfully";
          this.showLoginLink = true;
          this.form.disable();
          this.changeDetector.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          //temp
          console.error("Verification error", {
            status: error.status,
            body: error.error
          })
          this.successMessage = "";
          this.resendMessage = "";

          if(error.status === 409) {
            this.errorMessage = "This email address has already been verified. Sign in.";
            this.showLoginLink = true;
          } else if (error.status === 400) {
            this.errorMessage = "The email address or verification code is invalid or has expired.";
            this.showLoginLink = false;
          } else {
            this.errorMessage = "We could not verify your account. Please try again.";
            this.showLoginLink = false;
          }

          this.changeDetector.markForCheck();
        }
      });
  }

  resendCode(): void {
    const emailControl = this.form.controls.email;

    if(emailControl.invalid || this.isResending) {
      emailControl.markAllAsTouched();
      return;
    }

    this.isResending = true;
    this.resendMessage = "";
    this.errorMessage = "";

    this.authService.resendVerification(emailControl.value)
      .pipe(
        finalize(() => {
          this.isResending = false;
          this.changeDetector.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.resendMessage = "A new verification code has been sent. Another code can be sent in 30 seconds.";

          this.resendCooldownActive = true;

          // Disabling the resend button for 30 seconds after being sent
          setTimeout(() => {
            this.resendCooldownActive = false;
            this.changeDetector.markForCheck();
          }, 30000);

          this.changeDetector.markForCheck();
        },
        error: () => {
          this.errorMessage = "We could not resend the verification code."
        }
      });
  }

  clearVerificationMessages(): void {
    this.errorMessage = "";
    this.successMessage = "";
    this.resendMessage = "";
    this.showLoginLink = false;
  }
}
