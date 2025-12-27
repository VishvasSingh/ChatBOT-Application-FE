import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface UserSummary {
  user_uuid: string;
  full_name: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api/v1/users';

  /**
   * Searches for users based on a query string.
   * @param query The search term.
   * @returns An Observable array of UserSummary objects.
   */
  searchUsers(query: string): Observable<UserSummary[]> {
    if (!query.trim()) {
      return of([]); // Return an empty observable if the query is empty
    }
    const params = new HttpParams().set('q', query);
    return this.http.get<UserSummary[]>(`${this.apiUrl}/search`, { params });
  }
}
