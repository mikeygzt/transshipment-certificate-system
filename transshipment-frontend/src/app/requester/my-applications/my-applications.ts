import { Component, inject } from '@angular/core';
import { DashboardLayout } from '../../shared/dashboard-layout/dashboard-layout';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RequestService } from '../../transshipmentrequest.service';
import { TransshipmentResponse } from '../../transhipmentrequest.models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-my-applications',
  imports: [DashboardLayout, ReactiveFormsModule, RouterLink],
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.css',
})
export class MyApplications {
  private readonly formbuilder = inject(FormBuilder);
  private readonly requestService = inject(RequestService);
  private readonly route = inject(ActivatedRoute)

  applications: TransshipmentResponse[] = [];

  userRequests(){
    /*this.requestService.getbyUser().subscribe({
      next: (data) =>{
        this.applications = data;
      },
      error: (error: HttpErrorResponse) => {
        console.error()
      }
    })*/
  }

}
