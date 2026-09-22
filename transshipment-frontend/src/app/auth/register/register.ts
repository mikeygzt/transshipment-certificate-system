import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { finalize } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideEye,
    LucideEyeOff
  ],
  templateUrl: './register.html',
  styleUrls: [
    '../auth-layout.css',
    './register.css']
})

export class Register {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly changeDetector = inject(ChangeDetectorRef);

  isSubmitting = false;
  errorMessage = "";
  registrationComplete = false;
  registeredEmail = "";
  hidePassword = true;
  isPasswordFocused = false;

  readonly form = this.formBuilder.nonNullable.group({
    fullName: [
      "",
      [
        Validators.required,
        Validators.maxLength(100),
        Validators.minLength(5),
        Validators.pattern('[a-zA-Z ]*'),
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
    confirmEmail: [
      "",
      [
        Validators.required
      ]
    ],
    password: [
      "",
      [
        Validators.required,
        Validators.minLength(8)
      ]
    ],
    confirmPassword: [
      "",
      Validators.required
    ]
  },
  {
    validators: [
      matchFieldsValidator("password", "confirmPassword", "passwordMismatch"),
      matchFieldsValidator("email", "confirmEmail", "emailMismatch")
    ]
  }
  );

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
          this.changeDetector.markForCheck();
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
        error: (error: HttpErrorResponse) => {
          if(error.status == 409){
            this.errorMessage = "An account with this email already exists.";
          } else {
            this.errorMessage = "We could not create your account. Please try again.";
          }

          this.changeDetector.markForCheck();
        }
      });
  }

  private formatTelephone(value: string) : string {
    const digits = value.replace(/\D/g, "");

    // Slices the number up from 0 to 3, (000), 3 to 6, (000), then 6 to 10, (0000)
    // then returns 000-000-0000
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  clearErrorMessage(): void {
    this.errorMessage = "";
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  handlePasswordFocus(): void {
    this.isPasswordFocused = !this.isPasswordFocused;
  }
}

// Method for confirming email & password
export function matchFieldsValidator(fieldOne: string, fieldTwo: string, errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const group = control as AbstractControl;
    const valueOne = group.get(fieldOne)?.value;
    const valueTwo = group.get(fieldTwo)?.value;

    return valueOne === valueTwo ? null : { [errorKey]: true };
  }
}

