import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserSessionService {
  getUserId(): number | null {
    const userIdStr = sessionStorage.getItem('user_id');
    const userId = userIdStr ? parseInt(userIdStr, 10) : null;
    return userId !== null && !isNaN(userId) ? userId : null;
  }

  setUserId(id: number): void {
    sessionStorage.setItem('user_id', id.toString());
  }

  clearUserId(): void {
    sessionStorage.removeItem('user_id');
  }

  waitForToken(maxRetries = 20, interval = 100): Promise<string> {
    return new Promise((resolve, reject) => {
      let retries = 0;
      const check = () => {
        const token = sessionStorage.getItem('token_jwt');
        if (token) return resolve(token);
        retries++;
        if (retries >= maxRetries) return reject('Token JWT no disponible');
        setTimeout(check, interval);
      };
      check();
    });
  }

}
