import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { EndpointGroup, Endpoint } from '@core/models/api.models';
import { EndpointService } from '@core/services/endpoint.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {
  @Input() isOpen = true;
  @Output() close = new EventEmitter<void>();

  endpointGroups$: Observable<EndpointGroup[]>;
  activeEndpointId: string = '';
  expandedGroups: Set<string> = new Set(['PayIn', 'PayOut']); // Por defecto expandidos

  navigationItems = [
    { label: 'Introducción', icon: 'book', path: '/gateway/introduction' },
    { label: 'Autenticación', icon: 'key', path: '/gateway/authentication' },
    { label: 'Errores', icon: 'alert-circle', path: '/gateway/errors' }
  ];

  constructor(
    private endpointService: EndpointService,
    private router: Router
  ) {
    this.endpointGroups$ = this.endpointService.getEndpointGroups();
  }

  ngOnInit(): void {
    // Detectar endpoint activo en la ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveEndpoint();
    });

    this.updateActiveEndpoint();
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

  closeSidebar(): void {
    this.close.emit();
  }
}
