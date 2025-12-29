import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, RouterLink],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss'],
})
export class ProjectDashboardComponent implements OnInit {
  projectId: string | null = null;
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // Retrieve the project ID from the route parameters
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    if (this.projectId) {
      console.log('Currently inside Project ID:', this.projectId);
      // You can now use this.projectId to make project-specific API calls
    }
  }
}
