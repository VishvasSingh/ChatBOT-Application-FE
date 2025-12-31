import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  // Matches the base URL pattern from your ProjectService
  private apiUrl = 'http://localhost:8000/api/v1';
  private http = inject(HttpClient);

  /**
   * Uploads a batch of files with metadata.
   * @param formData The FormData object containing files and the 'metadata' JSON string.
   * @param projectId The ID of the project to associate the files with (sent in headers).
   */
  uploadBatch(formData: FormData, projectId: string): Observable<any> {
    const headers = new HttpHeaders({
      'project-id': projectId,
    });

    // Appends /upload/batch to the base API URL
    return this.http.post(`${this.apiUrl}/upload/batch`, formData, { headers });
  }
}
