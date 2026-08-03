import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: [
    '../auth-layout.css',
    './register.css']
})
export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  isSubmitting = false;
  errorMessage = "";
  registrationComplete = false;
  registeredEmail = "";

  readonly form = this.formBuilder.nonNullable.group({
    fullName: [
      "",
      [
        Validators.required,
        Validators.pattern('[a-zA-Z ]*')
      ]
    ],
    telephone: [
      "",
      [
        Validators.required,
        // Researched regex expression that accepts either 0000000000 or 000-000-0000 for tele num
        Validators.pattern(/^(\d{10}|\d{3}-\d{3}-\d{4})$/)
      ]
    ],
    companyTRN: [
      "",
      [
        Validators.required,
        // Researched regex expression that accepts 13 digit num like 1234567890123 for trn
        Validators.pattern(/^\d{13}$/)
      ]
    ],
    shippingAgentName: [
      "",
      Validators.required
    ],
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
        Validators.minLength(8)
      ]
    ]
  });

  submit(): void {
    if (this.form.invalid || this.isSubmitting){
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = "";

    const formValue = this.form.getRawValue();

    const request = {
      ...formValue,
      telephone: this.formatTelephone(formValue.telephone)
    };

    this.authService.register(request)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/verify-email'], {
            queryParams: {
              email: request.email 
            }
          })
        },
        error: () => {
          this.errorMessage = "Registration failed. Please check your information and try again.";
        }
      });
  }

  private formatTelephone(value: string) : string {
    const digits = value.replace(/\D/g, "");

    // Slices the number up from 0 to 3, (000), 3 to 6, (000), then 6 to 10, (0000)
    // then returns 000-000-0000
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

}
