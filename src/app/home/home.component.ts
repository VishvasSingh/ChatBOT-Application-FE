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
} from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { AutoCompleteModule } from 'primeng/autocomplete'; // 1. Import AutoCompleteModule
import { UserService, UserSummary } from '../services/user.service'; // 2. Import UserService
import { Subject, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
} from 'rxjs/operators';

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
    ConfirmDialogModule,
    TooltipModule,
    AutoCompleteModule, // 3. Add AutoCompleteModule to imports
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  displayNewProjectDialog: boolean = false;
  newProjectName: string = '';
  newProjectDescription: string = '';

  // 4. Add properties for user search and selection
  selectedUsers: UserSummary[] = [];
  userSearchResults: UserSummary[] = [];
  private searchSubject = new Subject<string>();

  // For description truncation and full view
  descriptionMaxLength: number = 50; // Max length before truncation
  displayFullDescriptionDialog: boolean = false;
  fullDescriptionContent: string = ''; // Content for the full description dialog

  private projectService = inject(ProjectService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private userService = inject(UserService); // 5. Inject UserService

  ngOnInit() {
    this.loadProjects();

    // 6. Set up debounced user search
    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((query) => {
          if (query.length < 2) {
            // If the query is too short, return an empty array
            // without making an API call.
            return of([]);
          }
          return this.userService.searchUsers(query).pipe(
            catchError((error) => {
              // Log the error for debugging purposes
              console.error('Error during user search:', error);
              // Return an empty observable to prevent the main stream from breaking
              return of([]);
            })
          );
        })
      )
      .subscribe((users) => {
        this.userSearchResults = users;
      });
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
    this.newProjectDescription = '';
    this.selectedUsers = []; // 7. Clear selected users
    this.userSearchResults = []; // Clear previous search results
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

    // 8. Map selected users to their UUIDs
    const selectedUserUuids = this.selectedUsers.map((user) => user.user_uuid);

    this.projectService
      .createProject({
        name: this.newProjectName,
        description: this.newProjectDescription,
        initial_members: selectedUserUuids, // 9. Add user UUIDs to payload
      })
      .subscribe({
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

  // 10. New method to handle search input and push to the subject
  searchUsers(event: { query: string }) {
    this.searchSubject.next(event.query);
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

  // New method to show full project description in a dialog
  showFullDescription(description: string): void {
    this.fullDescriptionContent = description;
    this.displayFullDescriptionDialog = true;
  }
}
