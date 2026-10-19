import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchModalService {
  private openSubject = new Subject<void>();
  open$ = this.openSubject.asObservable();

  open(): void {
    this.openSubject.next();
  }
}
