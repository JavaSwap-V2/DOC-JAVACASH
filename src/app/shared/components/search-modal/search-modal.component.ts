import { Component, OnInit, OnDestroy, HostListener, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SearchService } from '@core/services/search.service';
import { SearchResult } from '@core/models/api.models';

@Component({
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SearchModalComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();

  searchQuery = '';
  results: SearchResult[] = [];
  selectedIndex = 0;
  loading = false;
  recentSearches: string[] = [];

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar búsquedas recientes
    this.loadRecentSearches();

    // Configurar búsqueda con debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query.trim().length >= 2) {
        this.performSearch(query);
      } else {
        this.results = [];
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeModal();
  }

  @HostListener('document:keydown.arrowdown', ['$event'])
  onArrowDown(event: Event): void {
    event.preventDefault();
    if (this.results.length > 0) {
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.results.length - 1);
    }
  }

  @HostListener('document:keydown.arrowup', ['$event'])
  onArrowUp(event: Event): void {
    event.preventDefault();
    if (this.results.length > 0) {
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    }
  }

  @HostListener('document:keydown.enter')
  onEnter(): void {
    if (this.results.length > 0 && this.selectedIndex >= 0) {
      this.selectResult(this.results[this.selectedIndex]);
    }
  }

  onSearchInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.selectedIndex = 0;
    this.loading = true;
    this.searchSubject.next(query);
  }

  private performSearch(query: string): void {
    this.searchService.search(query, { limit: 10 }).subscribe(results => {
      this.results = results;
      this.loading = false;
    });
  }

  selectResult(result: SearchResult): void {
    this.saveRecentSearch(this.searchQuery);
    this.router.navigate([result.path]);
    this.closeModal();
  }

  selectRecentSearch(query: string): void {
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  clearRecentSearches(): void {
    this.recentSearches = [];
    localStorage.removeItem('javacash-recent-searches');
  }

  private loadRecentSearches(): void {
    const saved = localStorage.getItem('javacash-recent-searches');
    if (saved) {
      this.recentSearches = JSON.parse(saved);
    }
  }

  private saveRecentSearch(query: string): void {
    if (!query.trim()) return;

    // Agregar al inicio y quitar duplicados
    this.recentSearches = [
      query,
      ...this.recentSearches.filter(q => q !== query)
    ].slice(0, 5); // Mantener solo las últimas 5

    localStorage.setItem('javacash-recent-searches', JSON.stringify(this.recentSearches));
  }

  closeModal(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('search-modal')) {
      this.closeModal();
    }
  }

  highlightMatch(text: string): string {
    if (!this.searchQuery) return text;
    return this.searchService.highlightText(text, this.searchQuery);
  }
}
