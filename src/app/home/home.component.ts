import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService, Project } from './project.service';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import {
  MessageService,
  ConfirmationService,
  ConfirmEventType,
} from 'primeng/api'; // Import ConfirmationService and ConfirmEventType
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Import ConfirmDialogModule
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule, // Add ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService], // Provide MessageService and ConfirmationService
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  displayNewProjectDialog: boolean = false;
  newProjectName: string = '';
  newProjectDescription: string = '';

  private projectService = inject(ProjectService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService); // Inject ConfirmationService
  private router = inject(Router);

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;
    this.projectService.getActiveProjects().subscribe({
      next: (data) => {
        this.projects = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load projects:', error); // Log the full error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load projects. Please try again later.',
        });
        this.loading = false;
      },
    });
  }

  createNewProject() {
    this.newProjectName = '';
    this.displayNewProjectDialog = true;
  }

  submitNewProject() {
    if (!this.newProjectName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Project name cannot be empty.',
      });
      return;
    }

    this.projectService.createProject({ name: this.newProjectName, 
      description: this.newProjectDescription }).subscribe({
      next: (project) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Project "${project.name}" created successfully.`,
        });
        this.displayNewProjectDialog = false;
        this.loadProjects();
      },
      error: (error) => {
        console.error('Failed to create project:', error); // Log the full error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create project. Please try again.',
        });
      },
    });
  }

  // Method to confirm project deletion
  confirmDeleteProject(project: Project) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteProject(project._id);
      },
      reject: (type: ConfirmEventType) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            this.messageService.add({
              severity: 'info',
              summary: 'Cancelled',
              detail: 'Project deletion cancelled.',
            });
            break;
          case ConfirmEventType.CANCEL:
            this.messageService.add({
              severity: 'info',
              summary: 'Cancelled',
              detail: 'Project deletion cancelled.',
            });
            break;
        }
      },
    });
  }

  // Method to perform project deletion
  deleteProject(projectId: string) {
    this.projectService.deleteProject(projectId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project deleted successfully.',
        });
        this.loadProjects(); // Reload projects after deletion
      },
      error: (error) => {
        console.error('Failed to delete project:', error); // Log the full error
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete project. Please try again.',
        });
      },
    });
  }
}
