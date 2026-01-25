import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// --- Interfaces based on your Pydantic models ---
export enum FileStatus {
  UPLOADED = 'uploaded',
  CONVERTING = 'converting',
  READY_FOR_TRANSLATION = 'ready',
  TRANSLATING = 'translating',
  TRANSLATED = 'translated',
  ERROR = 'error',
}

export interface S3FileDetails {
  s3_key: string;
  s3_bucket: string;
  filename: string;
  content_type: string;
  size: string;
  uploaded_at: string; // ISO Date string
}

export interface UploadedFilesMetadata {
  _id: string; // Mongo ID usually comes as _id or id
  project_id: string;
  user_id: string;
  user_name: string;
  source_language: string;
  target_language: string;
  status: FileStatus;

  // The 3 Stages
  source: S3FileDetails;
  intermediate?: S3FileDetails | null;
  translated?: S3FileDetails | null;

  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private apiUrl = 'http://localhost:8000/api/v1';
  private http = inject(HttpClient);

  /**
   * Common helper to generate headers with Project ID
   */
  private getHeaders(projectId: string): HttpHeaders {
    return new HttpHeaders({
      'project-id': projectId,
    });
  }

  uploadBatch(formData: FormData, projectId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/batch`, formData, {
      headers: this.getHeaders(projectId),
    });
  }

  /**
   * Fetches the list of files for a specific project.
   */
  getFiles(projectId: string): Observable<UploadedFilesMetadata[]> {
    return this.http.get<UploadedFilesMetadata[]>(
      `${this.apiUrl}/upload/list_files`,
      {
        headers: this.getHeaders(projectId),
      }
    );
  }

  /**
   * Generates a signed URL for downloading the specific version of the file.
   * Backend returns: { url: "https://s3..." }
   */
  downloadFile(
    projectId: string,
    docId: string,
    version: 'source' | 'translated'
  ): Observable<{ url: string }> {
    const params = new HttpParams().set('version', version);

    return this.http.get<{ url: string }>(
      `${this.apiUrl}/upload/${projectId}/files/${docId}/download`,
      {
        headers: this.getHeaders(projectId),
        params: params,
      }
    );
  }

  /**
   * Deletes the document and its associated files from the backend.
   */
  deleteFile(projectId: string, docId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/upload/${projectId}/files/${docId}`,
      {
        headers: this.getHeaders(projectId),
      }
    );
  }

  /**
   * Triggers the translation job for the selected files.
   * Endpoint: POST /api/v1/translation/{project_id}/trigger
   */
  
  triggerTranslation(
    projectId: string,
    fileIds: string[],
    targetLanguage: string = 'en'
  ): Observable<any> {
    const body = {
      file_ids: fileIds,
      target_language: targetLanguage,
    };

    return this.http.post(
      `${this.apiUrl}/translation/${projectId}/trigger`,
      body,
      {
        headers: this.getHeaders(projectId),
      }
    );
  }
}
