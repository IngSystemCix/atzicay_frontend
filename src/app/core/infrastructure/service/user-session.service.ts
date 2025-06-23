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
}
