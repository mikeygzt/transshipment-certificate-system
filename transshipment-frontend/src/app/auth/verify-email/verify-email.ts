import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-verify-email',
  imports: [ReactiveFormsModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly changeDetector = inject(ChangeDetectorRef);

  isSubmitting = false;
  verificationComplete = false;
  errorMessage = "";

  isResending = false;
  resendMessage = "";
  resendCooldownActive = false;

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

    this.authService.verifyEmail(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.verificationComplete = true;
        },
        error: () => {
          this.errorMessage = "The verification code is invalid or has expired.";
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
}
