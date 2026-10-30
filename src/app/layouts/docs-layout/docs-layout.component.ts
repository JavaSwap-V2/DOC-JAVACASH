import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
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
  isHome = true;
  private destroy$ = new Subject<void>();

  constructor(
    private searchModalService: SearchModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.searchModalService.open$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.searchModalOpen = true);

    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.updateHomeFlag());

    this.updateHomeFlag();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateHomeFlag(): void {
    const url = this.router.url.split('#')[0].split('?')[0];
    this.isHome = url === '/' || url === '';
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
