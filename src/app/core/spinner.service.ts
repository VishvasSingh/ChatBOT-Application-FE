import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  isLoading = signal<boolean>(false);
  private activeRequests = 0;

  constructor() {}

  show(): void {
    this.activeRequests++;
    if (this.activeRequests === 1) {
      this.isLoading.set(true);
    }
  }

  hide(): void {
    this.activeRequests--;
    if (this.activeRequests <= 0) {
      this.activeRequests = 0; // Ensure it doesn't go negative
      this.isLoading.set(false);
    }
  }
}
