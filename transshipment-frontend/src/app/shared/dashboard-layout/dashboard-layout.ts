import { Component, input } from '@angular/core';
import { AuthenticatedHeader } from '../authenticated-header/authenticated-header';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideFileText, LucideUsers, LucideClipboardCheck } from '@lucide/angular';
import { UserRole } from '../../auth.models';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    AuthenticatedHeader,
    RouterLink,
    RouterLinkActive,
    LucideFileText,
    LucideUsers,
    LucideClipboardCheck
],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {

  readonly role = input.required<UserRole>();

}
