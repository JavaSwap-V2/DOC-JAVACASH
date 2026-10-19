import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast } from '@core/models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts$ = new BehaviorSubject<Toast[]>([]);
  private counter = 0;

  getToasts(): Observable<Toast[]> {
    return this.toasts$.asObservable();
  }

  show(type: Toast['type'], title: string, message?: string, duration = 3000): void {
    const id = `toast-${++this.counter}`;
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration,
      dismissible: true
    };

    const currentToasts = this.toasts$.value;
    this.toasts$.next([...currentToasts, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
  }

  success(title: string, message?: string, duration = 3000): void {
    this.show('success', title, message, duration);
  }

  error(title: string, message?: string, duration = 5000): void {
    this.show('error', title, message, duration);
  }

  warning(title: string, message?: string, duration = 4000): void {
    this.show('warning', title, message, duration);
  }

  info(title: string, message?: string, duration = 3000): void {
    this.show('info', title, message, duration);
  }

  dismiss(id: string): void {
    const currentToasts = this.toasts$.value;
    this.toasts$.next(currentToasts.filter(t => t.id !== id));
  }

  dismissAll(): void {
    this.toasts$.next([]);
  }
}
