import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { SpinnerService } from './spinner.service';

@Injectable()
export class SpinnerInterceptor implements HttpInterceptor {
  constructor(private spinnerService: SpinnerService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Check for a custom header to disable the spinner for this specific request
    const disableSpinner = request.headers.get('X-Show-Spinner') === 'false';
    let newRequest = request.clone({
      headers: request.headers.delete('X-Show-Spinner'), // Remove the custom header so it doesn't go to the backend
    });

    if (!disableSpinner) {
      this.spinnerService.show();
    }

    return next.handle(newRequest).pipe(
      finalize(() => {
        if (!disableSpinner) {
          this.spinnerService.hide();
        }
      })
    );
  }
}
