import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';

// Service Import
import { FileUploadService } from './file-upload.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    FileUploadModule,
    ToastModule,
    SelectModule,
    ButtonModule,
  ],
  providers: [MessageService],
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  projectId: string | null = null;

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Spanish', value: 'es' },
    { label: 'French', value: 'fr' },
    { label: 'German', value: 'de' },
  ];

  fileMetadata: { [fileName: string]: string } = {};

  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);

  // Inject the new service
  private fileUploadService = inject(FileUploadService);

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
  }

  onBatchUpload(event: { files: File[] }): void {
    if (!this.projectId) return;

    const formData = new FormData();
    const metadataMap: any[] = [];

    // 1. Prepare Data
    for (let file of event.files) {
      formData.append('files', file);

      const language = this.fileMetadata[file.name] || 'en';
      metadataMap.push({
        fileName: file.name,
        language: language,
      });
    }

    formData.append('metadata', JSON.stringify(metadataMap));

    // 2. Call Service
    this.fileUploadService.uploadBatch(formData, this.projectId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Batch upload completed successfully',
        });
        this.fileMetadata = {};

        // Optional: Clear the uploaded files from the UI manually if needed
        // event.files.length = 0;
      },
      error: (err) => {
        console.error('Upload Error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Batch upload failed',
        });
      },
    });
  }
}
