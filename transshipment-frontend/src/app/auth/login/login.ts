import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthenticatedUser } from '../../auth.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: [
    '../auth-layout.css',
    './login.css'],
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly activatedRoute = inject(ActivatedRoute);

  isSubmitting = false;
  errorMessage = 
    this.activatedRoute.snapshot.queryParamMap.get("reason") === "deactivated" ?
    "Your account has been deactivated. Please contact an administrator." :
    "";

  showVerifyEmailLink = false;

  readonly form = this.formBuilder.nonNullable.group({
    email: [
      "",
      [
        Validators.required,
        Validators.email
      ]
    ],
    password: [
      "",
      [
        Validators.required,
        Validators.required
      ]
    ]
  });

  submit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = "";

    this.authService.login(this.form.getRawValue())
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetector.markForCheck();
        })
      )
      .subscribe({
        next: (user) => {
          this.redirectByRole(user);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 401 && error.error?.error === "ACCOUNT_DEACTIVATED") {
            this.errorMessage = "Your account has been deactivated. Please contact an administrator.";
          } else if (error.status === 401 && error.error?.error === "EMAIL_NOT_VERIFIED") {
            this.errorMessage = "Your email address has not been verified. Please verify your email before signing in.";
            this.showVerifyEmailLink = true;
          } else {
            this.errorMessage = "Invalid email or password.";
          } 

          this.changeDetector.markForCheck();
        }
      });
  }

  private redirectByRole(user: AuthenticatedUser): void {
    switch (user.role) {
      case "REQUESTER":
        this.router.navigate(["/my-applications"]);
        break;

      case "REVIEWER":
        this.router.navigate(["/review-queue"]);
        break;
      
      case "ADMIN":
        this.router.navigate(["/user-governance"])
    }
  }
}
