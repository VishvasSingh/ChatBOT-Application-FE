import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  _id: string; // Changed from 'id' to '_id' as per backend response
  name: string;
  status: string;
  dateOfCreation: string; // Assuming date string
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private apiUrl = 'http://localhost:8000/api/v1'; // Your backend API base URL
  private http = inject(HttpClient);

  getActiveProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/projects/active`);
  }

  // New method to create a project
  createProject(projectData: { name: string , description: string}): Observable<Project> {
    return this.http.post<Project>(`${this.apiUrl}/projects`, projectData);
  }

  // New method to delete a project
  deleteProject(projectId: string): Observable<void> {
    // API endpoint is api/v1/projects/{projectid}
    return this.http.delete<void>(`${this.apiUrl}/projects/${projectId}`);
  }
}
