import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, CardModule, FileUploadModule, ToastModule],
  providers: [MessageService],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  projectId: string | null = null;
  uploadUrl: string = '';

  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    if (this.projectId) {
      // Set the backend API endpoint for file uploads
      this.uploadUrl = `/api/v1/projects/${this.projectId}/files/upload`;
    }
  }

  onUpload(event: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Success',
      detail: 'File Uploaded',
    });
  }

  onError(event: any): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'File Upload Failed',
    });
  }
}
