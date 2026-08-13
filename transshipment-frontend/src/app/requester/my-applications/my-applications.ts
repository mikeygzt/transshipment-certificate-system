import { Component, computed, inject, signal } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RequestService } from '../../transshipmentrequest.service';
import { TransshipmentResponse, RequestStatus } from '../../transhipmentrequest.models';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { AuthenticatedUser } from '../../auth.models';
import { LucideListFilter, LucidePlus, LucideSearch, LucideX } from '@lucide/angular';
import { finalize } from 'rxjs';
import { Dialog } from '@angular/cdk/dialog';
import { Modal } from '../../modal/modal';
import { Modaledit } from '../../modaledit/modaledit';


@Component({
  selector: 'app-my-applications',
  imports: [DashboardLayout, ReactiveFormsModule, LucideListFilter, LucideSearch, LucidePlus, LucideX],
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.css',
})
export class MyApplications {
  private readonly formbuilder = inject(FormBuilder);
  private readonly requestService = inject(RequestService);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(Dialog);
  readonly currentUser = signal<AuthenticatedUser | null>(null);
  readonly requests = signal<TransshipmentResponse[]>([]);
  readonly search = signal("");
  readonly currentResponse = signal<TransshipmentResponse|null>(null);
  readonly selectedRequest = signal<TransshipmentResponse | null>(null);

  //applications: TransshipmentResponse[] = [];

  readonly isLoading = signal(true);
  id = "";
  name = "";
  email ="";
  trn = "";
  shippingagent = "";
  phoneNumber = "";
  errorMessage ="";
  successMessage ="";

//Collect ID of the current USER to use for later methods
  constructor(){
    this.authService.getCurrentUser().subscribe({
      next: (data) =>{
        this.id= data.id;
        this.email = data.email ?? "";
        this.shippingagent = data.shippingAgentName ?? "";
        this.trn = data.companyTRN ?? "";
        this.name = data.fullName ?? "";
        this.phoneNumber = data.telephone ?? "";
        this.loadRequests();
      }, error: () => {
        this.errorMessage = "Unable to locate User data, please refresh and try again."
      }
    })
  }

  //collect the content of the requests linked to the current user

  private loadRequests(): void{
    this.requestService.getbyUser(this.id).pipe(
        finalize(() => {
          this.isLoading.set(false);
        })
      ).subscribe({
        next: data => {this.requests.set(data);},
        error: (error:HttpErrorResponse) =>{
          this.errorMessage = "There was an error in loading the requests";
        }
      })
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.search.set(input.value);
  }

  openRequestDetails(request: TransshipmentResponse): void {
    this.selectedRequest.set(request);
  }

  closeRequestDetails(): void {
    this.selectedRequest.set(null);
  }


  //Collecting the data from the existing user to be prefilled in the modal and also opens it 
  openCreateRequestModal(): void {
    const dialogRef = this.dialog.open<TransshipmentResponse | undefined>(Modal, {
      data: {
        requesterUserId: this.id,
        shippingAgentName: this.shippingagent,
        applicantName: this.name,
        emailAddress: this.email,
        phoneNumber: this.phoneNumber,
        trn: this.trn
      }
    });

    dialogRef.closed.subscribe((newRequest) => {
      if (newRequest) {
        this.requests.update(current => [...current, newRequest]);
      }
    });
  }

  //Opens the edit modal for the currently selected request, prefilled with its existing data
  openEditRequestModal(request: TransshipmentResponse): void {
    const dialogRef = this.dialog.open<TransshipmentResponse | undefined>(Modaledit, {
      data: request
    });

    dialogRef.closed.subscribe((updatedRequest) => {
      if (updatedRequest) {
        this.requests.update(current =>
          current.map(r => r.requestId === updatedRequest.requestId ? updatedRequest : r)
        );
        this.selectedRequest.set(updatedRequest);
      }
    });
  }


  readonly filteredRequests = computed(() => {
    const query = this.search().trim().toLowerCase();

    //if no query load the table normally
    if (!query) {
      return this.requests();
    }
    //filter based on the table
    return this.requests().filter(request => {
      const creationDate = request.createdAt ?? "";
      const status = this.getStatusLabel(request.status).toLowerCase();
      const manifestNo = request.manifestNumber ?? "";
      const billofLading = request.billOfLadingWaybill ?? "";
      const requestType = request.requestType ?? "";


      return (
        creationDate.toLowerCase().includes(query) ||
        status.includes(query)|| manifestNo.toLowerCase().includes(query)||
        billofLading.toLowerCase().includes(query)||
        requestType.toLowerCase().includes(query)
      );
    });
  }
);

  getStatusLabel(status: RequestStatus): string {
      switch (status) {
        case "SUBMITTED": return "Submitted";
        case "UNDER_REVIEW": return "Under Review";
        case "APPROVED": return "Approved";
        case "REJECTED": return "Rejected";
        case "RESUBMITTED": return "Resubmitted";
      }
}

}