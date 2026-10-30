import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { EndpointGroup, Endpoint, Country, COUNTRIES, COUNTRY_LIST } from '@core/models/api.models';
import { EndpointService } from '@core/services/endpoint.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() isOpen = true;
  @Input() hideOnDesktop = false;
  @Output() close = new EventEmitter<void>();

  endpointGroups$: Observable<EndpointGroup[]>;
  activeEndpointId: string = '';
  expandedGroups: Set<string> = new Set(['PayIn', 'PayOut']);

  currentCountry: Country = COUNTRIES.ARG;
  countries: Country[] = COUNTRY_LIST.filter(c => c.available);

  private destroy$ = new Subject<void>();

  navigationItems = [
    { label: 'sidebar.introduction', icon: 'book', path: '/gateway/introduction' },
    { label: 'sidebar.authentication', icon: 'key', path: '/gateway/authentication' },
    { label: 'sidebar.errors', icon: 'alert-circle', path: '/gateway/errors' }
  ];

  constructor(
    private endpointService: EndpointService,
    private router: Router
  ) {
    this.endpointGroups$ = this.endpointService.getEndpointGroups();
  }

  ngOnInit(): void {
    this.endpointService.currentCountry$.subscribe(code => {
      this.currentCountry = COUNTRIES[code];
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.updateActiveEndpoint();
    });

    this.updateActiveEndpoint();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateActiveEndpoint(): void {
    const urlSegments = this.router.url.split('/');
    this.activeEndpointId = urlSegments[urlSegments.length - 1];
  }

  toggleGroup(groupName: string): void {
    if (this.expandedGroups.has(groupName)) {
      this.expandedGroups.delete(groupName);
    } else {
      this.expandedGroups.add(groupName);
    }
  }

  isGroupExpanded(groupName: string): boolean {
    return this.expandedGroups.has(groupName);
  }

  isEndpointActive(endpoint: Endpoint): boolean {
    return endpoint.id === this.activeEndpointId;
  }

  navigateToEndpoint(endpoint: Endpoint): void {
    const country = this.endpointService.getCurrentCountry().toLowerCase();
    this.router.navigate([country, 'api', endpoint.category, endpoint.id]);
    
    // Cerrar sidebar en mobile
    if (window.innerWidth < 768) {
      this.close.emit();
    }
  }

  selectCountry(country: Country): void {
    this.currentCountry = country;
    this.endpointService.setCurrentCountry(country.code);

    const segments = this.router.url.split('#')[0].split('?')[0]
      .split('/').filter(Boolean);

    if (segments[1] === 'api') {
      segments[0] = country.code.toLowerCase();
      this.router.navigate(['/', ...segments]);
    }

    if (window.innerWidth < 768) {
      this.close.emit();
    }
  }

  closeSidebar(): void {
    this.close.emit();
  }
}
