import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router'; // Import Router

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  // Inject Router for navigation
  private router = inject(Router);

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = localStorage.getItem('firebaseToken');

    let clonedRequest = request;
    if (token) {
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle 401 Unauthorized error
          console.error('Unauthorized request - redirecting to login:', error);
          localStorage.removeItem('firebaseToken'); // Remove invalid token
          this.router.navigate(['/login']); // Redirect to login page
        }
        return throwError(() => error); // Re-throw the error for other handlers/components
      })
    );
  }
}
