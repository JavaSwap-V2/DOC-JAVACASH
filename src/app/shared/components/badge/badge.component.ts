// ============================================
// badge.component.ts
// ============================================

import { Component, Input, ViewEncapsulation } from '@angular/core';
import { HttpMethod } from '@core/models/api.models';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BadgeComponent {
  @Input() method?: HttpMethod;
  @Input() status?: number;
  @Input() text?: string;
  @Input() variant: 'method' | 'status' | 'tag' = 'method';
  @Input() size: 'sm' | 'md' = 'md';

  get badgeClass(): string {
    const classes: string[] = ['badge', `badge-${this.size}`];

    if (this.variant === 'method' && this.method) {
      classes.push(`badge-method-${this.method.toLowerCase()}`);
    } else if (this.variant === 'status' && this.status) {
      if (this.status >= 200 && this.status < 300) {
        classes.push('badge-success');
      } else if (this.status >= 400 && this.status < 500) {
        classes.push('badge-warning');
      } else if (this.status >= 500) {
        classes.push('badge-error');
      }
    } else if (this.variant === 'tag') {
      classes.push('badge-tag');
    }

    return classes.join(' ');
  }

  get displayText(): string {
    if (this.text) return this.text;
    if (this.method) return this.method;
    if (this.status) return this.status.toString();
    return '';
  }
}
