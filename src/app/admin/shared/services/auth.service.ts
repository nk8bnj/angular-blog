import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { FBAuthResponse, User } from 'src/app/shared/interface';
import { environment } from 'src/environments/environment.development';

@Injectable()
export class AuthService {
  constructor(private http: HttpClient) {}

  get token(): string | null {
    const expDate = new Date(localStorage.getItem('fb-token-exp') || '');
    if (new Date() > expDate) {
      this.logout();
      return null;
    }
    return localStorage.getItem('fb-token');
  }

  login(user: User): Observable<any> {
    user.returnSecureToken = true;
    return this.http
      .post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`,
        user,
      )
      .pipe(tap(this.setToken as any));
  }

  logout() {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private setToken(res: FBAuthResponse | null) {
    if (res) {
      const expDate = new Date(new Date().getTime() + +res.expiresIn * 1000);
      localStorage.setItem('fb-token', res.idToken);
      localStorage.setItem('fb-token-exp', expDate.toString());
    } else {
      localStorage.clear();
    }
  }
}
