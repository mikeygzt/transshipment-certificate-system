import { Component, computed, inject, signal } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { AuditLogService } from './audit-logs.service';
import { AuditAction, AuditLogResponse } from '../../audit-log.model';
import { LucideArrowRight, LucideListFilter, LucideLogs, LucideSearch } from '@lucide/angular';
import { DatePipe } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-audit-logs',
  imports: [
    DashboardLayout, 
    LucideArrowRight, 
    DatePipe, 
    NgxDatatableModule,
    LucideSearch,
    LucideListFilter
  ],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs {
  private readonly auditLogService = inject(AuditLogService);

  readonly auditLogs = signal<AuditLogResponse[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal("");

  readonly searchTerm = signal("");
  readonly auditLogFilter = signal<AuditAction | "ALL">("ALL");
  readonly isFilterOpen = signal(false);
  readonly fromDate = signal("");
  readonly toDate = signal("");

  constructor() {
    this.loadAuditLogs();
  }

  private loadAuditLogs(): void {
    this.auditLogService
      .getAllAuditLogs()
      .subscribe({
        next: (logs) => {
          this.auditLogs.set(logs);
          this.isLoading.set(false);
        },

        error: () => {
          this.errorMessage.set("Unable to load audit logs.");
          this.isLoading.set(false);
        }
      })
      
  }

  getActionLabel(action: AuditLogResponse["action"]): string {
    switch (action) {
      case "USER_LOGIN":
        return "User Login";
      
      case "REQUEST_RESUBMITTED":
        return "Request Submitted";

      case "REQUEST_APPROVED":
        return "Request Approved";
      
      case "REQUEST_REJECTED": 
        return "Request Rejected";
      
      case "REQUEST_SUBMITTED":
        return "Request Submitted";

      case "USER_ROLE_MODIFIED":
        return "User Role Modified";
    
      default:
        return action;
    }
  }

  readonly filteredAuditLogs = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();
    const action = this.auditLogFilter();
    const fromDate = this.fromDate();
    const toDate = this.toDate();

    return this.auditLogs().filter(log => {
      const matchesSearch = !search ||
        log.performedByEmail.toLowerCase().includes(search) ||
        log.targetUserEmail?.toLowerCase().includes(search) ||
        log.transshipmentRequestId?.toLowerCase().includes(search);

      const matchesAction = action === "ALL" || log.action === action;

      // Formats the date to 2026-00-00 (example) from 2026-00-00T00:00:00.000
      const logDate = log.timestamp.substring(0, 10);

      const matchesFromDate = !fromDate || logDate >= fromDate;

      const matchesToDate = !toDate || logDate <= toDate;

      return matchesSearch && matchesAction && matchesFromDate && matchesToDate;
    })
  })

  toggleFilter(): void {
    this.isFilterOpen.update(open => !open);
  }

  clearFilters(): void {
    this.searchTerm.set("");
    this.auditLogFilter.set("ALL");
    this.fromDate.set("");
    this.toDate.set("");
  }


}
