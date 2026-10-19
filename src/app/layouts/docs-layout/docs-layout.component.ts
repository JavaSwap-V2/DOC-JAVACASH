import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SearchModalService } from '@core/services/search-modal.service';

@Component({
  selector: 'app-docs-layout',
  templateUrl: './docs-layout.component.html',
  styleUrls: ['./docs-layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DocsLayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = false;
  searchModalOpen = false;
  private destroy$ = new Subject<void>();

  constructor(private searchModalService: SearchModalService) {}

  ngOnInit(): void {
    this.searchModalService.open$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.searchModalOpen = true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onMenuToggle(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  onSidebarClose(): void {
    this.sidebarOpen = false;
  }

  onSearchFocus(): void {
    this.searchModalOpen = true;
  }

  onSearchClose(): void {
    this.searchModalOpen = false;
  }
}
