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
import { TabsModule } from 'primeng/tabs'; // New Tabs module in v20
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

// Service & Model Import
import {
  FileUploadService,
  UploadedFilesMetadata,
  FileStatus,
} from './file-upload.service';

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
    TabsModule,
    TableModule,
    TagModule,
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

  // Lists for the tabs
  sourceFiles: UploadedFilesMetadata[] = [];
  translatedFiles: UploadedFilesMetadata[] = [];
  isLoadingFiles = false;

  private route = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private fileUploadService = inject(FileUploadService);

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('projectId');
    if (this.projectId) {
      this.fetchFiles();
    }
  }

  fetchFiles(): void {
    if (!this.projectId) return;

    this.isLoadingFiles = true;
    this.fileUploadService.getFiles(this.projectId).subscribe({
      next: (data) => {
        // Tab 1: All records that have a source file
        this.sourceFiles = data;

        // Tab 2: Records that are effectively translated (have a translated file or status is translated)
        this.translatedFiles = data.filter(
          (f) => f.translated !== null && f.translated !== undefined
        );

        this.isLoadingFiles = false;
      },
      error: (err) => {
        console.error('Error fetching files:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not load files.',
        });
        this.isLoadingFiles = false;
      },
    });
  }

  onBatchUpload(event: { files: File[] }): void {
    if (!this.projectId) return;

    const formData = new FormData();
    const metadataMap: any[] = [];

    for (let file of event.files) {
      formData.append('files', file);
      const language = this.fileMetadata[file.name] || 'en';
      metadataMap.push({ fileName: file.name, language: language });
    }

    formData.append('metadata', JSON.stringify(metadataMap));

    this.fileUploadService.uploadBatch(formData, this.projectId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Batch upload completed',
        });
        this.fileMetadata = {};
        event.files.length = 0; // Clear the file input
        // Refresh the list after successful upload
        this.fetchFiles();
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

  // Helper to get severity for status tags
  getStatusSeverity(
    status: string
  ):
    | 'success'
    | 'secondary'
    | 'info'
    | 'danger'
    | 'contrast'
    | undefined {
    switch (status) {
      case FileStatus.TRANSLATED:
        return 'success';
      case FileStatus.TRANSLATING:
        return 'info';
      case FileStatus.ERROR:
        return 'danger';
      case FileStatus.READY_FOR_TRANSLATION:
        return 'contrast';
      default:
        return 'secondary';
    }
  }
}
