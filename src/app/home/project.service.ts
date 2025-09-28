import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  status: string;
  // Add other fields as needed
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private apiUrl = 'http://localhost:8000/api/projects/active';

  constructor(private http: HttpClient) {}

  getActiveProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }
}
