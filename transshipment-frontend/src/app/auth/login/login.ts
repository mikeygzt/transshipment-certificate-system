import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthenticatedUser } from '../../auth.models';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: [
    '../auth-layout.css',
    './login.css'],
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = false;
  errorMessage = "";

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
        })
      )
      .subscribe({
        next: (user) => {
          this.redirectByRole(user);
        },
        error: () => {
          this.errorMessage = "Invalid email or password";
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
