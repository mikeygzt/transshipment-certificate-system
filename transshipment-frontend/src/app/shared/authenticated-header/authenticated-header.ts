import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { AuthenticatedUser } from '../../auth.models';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-authenticated-header',
  imports: [RouterLink],
  templateUrl: './authenticated-header.html',
  styleUrl: './authenticated-header.css',
})
export class AuthenticatedHeader {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly currentUser = signal<AuthenticatedUser | null>(null);
  readonly isLoggingOut = signal(false);

  constructor() {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser.set(user);
      },
      error: () => {
        this.router.navigate(["/login"]);
      }
    });
  }

  logout(): void {
    if (this.isLoggingOut()){
      return;
    }

    this.isLoggingOut.set(true);

    this.authService.logout()
    .pipe(
      finalize(() => {
        this.isLoggingOut.set(false);
      })
    )
    .subscribe({
      next: () => {
        this.router.navigate(["/login"]);
      },
      error: () => {
        this.router.navigate(["/login"]);
      }
    });
  }
}
