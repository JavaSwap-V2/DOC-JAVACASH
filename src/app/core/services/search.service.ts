import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchResult, SearchOptions, Endpoint } from '../models/api.models';
import { EndpointService } from './endpoint.service';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private endpointService: EndpointService,
    private translationService: TranslationService
  ) {}

  /**
   * Busca en endpoints
   */
  search(query: string, options: Partial<SearchOptions> = {}): Observable<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return new Observable(observer => observer.next([]));
    }

    const searchTerm = query.toLowerCase().trim();

    return this.endpointService.endpoints$.pipe(
      map(endpoints => {
        let filtered = endpoints;

        // Filtrar por categoría si se especifica
        if (options.category) {
          filtered = filtered.filter(e => e.category === options.category);
        }

        // Filtrar por método si se especifica
        if (options.method) {
          filtered = filtered.filter(e => e.method === options.method);
        }

        // Buscar en nombre, descripción y path
        const results = filtered
          .map(endpoint => this.scoreEndpoint(endpoint, searchTerm))
          .filter(result => result.relevance > 0)
          .sort((a, b) => b.relevance - a.relevance);

        // Limitar resultados
        const limit = options.limit || 10;
        return results.slice(0, limit);
      })
    );
  }

  /**
   * Calcula score de relevancia para un endpoint
   */
  private scoreEndpoint(endpoint: Endpoint, searchTerm: string): SearchResult {
    let relevance = 0;
    const highlights: any[] = [];

    // Búsqueda en nombre (peso: 10)
    const displayName = endpoint.nameKey
      ? this.translationService.translate(endpoint.nameKey)
      : endpoint.name;
    if (displayName.toLowerCase().includes(searchTerm) || endpoint.name.toLowerCase().includes(searchTerm)) {
      relevance += 10;
      highlights.push({
        field: 'name',
        snippet: displayName,
        matchedText: searchTerm
      });
    }

    // Búsqueda exacta en nombre (bonus: 5)
    if (displayName.toLowerCase() === searchTerm || endpoint.name.toLowerCase() === searchTerm) {
      relevance += 5;
    }

    // Búsqueda en descripción (peso: 5)
    if (endpoint.description.toLowerCase().includes(searchTerm)) {
      relevance += 5;
      highlights.push({
        field: 'description',
        snippet: this.getSnippet(endpoint.description, searchTerm),
        matchedText: searchTerm
      });
    }

    // Búsqueda en path (peso: 7)
    if (endpoint.path.toLowerCase().includes(searchTerm)) {
      relevance += 7;
      highlights.push({
        field: 'path',
        snippet: endpoint.path,
        matchedText: searchTerm
      });
    }

    // Búsqueda en tags (peso: 3)
    if (endpoint.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) {
      relevance += 3;
    }

    // Búsqueda en método (peso: 2)
    if (endpoint.method.toLowerCase().includes(searchTerm)) {
      relevance += 2;
    }

    return {
      id: endpoint.id,
      type: 'endpoint',
      title: displayName,
      description: endpoint.description,
      path: `/${this.endpointService.getCurrentCountry().toLowerCase()}/api/${endpoint.category}/${endpoint.id}`,
      category: endpoint.category,
      method: endpoint.method,
      relevance,
      highlights
    };
  }

  /**
   * Extrae snippet de texto alrededor del término de búsqueda
   */
  private getSnippet(text: string, searchTerm: string, contextLength: number = 50): string {
    const lowerText = text.toLowerCase();
    const index = lowerText.indexOf(searchTerm);
    
    if (index === -1) return text.substring(0, 100);

    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + searchTerm.length + contextLength);
    
    let snippet = text.substring(start, end);
    
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';
    
    return snippet;
  }

  /**
   * Resalta término de búsqueda en texto
   */
  highlightText(text: string, searchTerm: string): string {
    if (!searchTerm) return text;
    
    const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(regex, '<mark>$1</mark>');
  }
}
