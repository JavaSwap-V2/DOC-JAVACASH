import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { map, tap, catchError, shareReplay } from 'rxjs/operators';
import { 
  Endpoint, 
  EndpointGroup, 
  PostmanCollection,
  CountryCode 
} from '../models/api.models';
import { PostmanTransformerService } from './postman-transformer.service';

@Injectable({
  providedIn: 'root'
})
export class EndpointService {
  private endpointsSubject = new BehaviorSubject<Endpoint[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private currentCountrySubject = new BehaviorSubject<CountryCode>('ARG');

  endpoints$ = this.endpointsSubject.asObservable();
  loading$ = this.loadingSubject.asObservable();
  currentCountry$ = this.currentCountrySubject.asObservable();

  private endpointsCache = new Map<string, Endpoint[]>();

  constructor(
    private http: HttpClient,
    private transformer: PostmanTransformerService
  ) {}

  /**
   * Carga endpoints para un país específico
   */
  loadEndpointsForCountry(country: CountryCode): Observable<Endpoint[]> {
    const cacheKey = country;
    
    // Verificar caché
    if (this.endpointsCache.has(cacheKey)) {
      const cached = this.endpointsCache.get(cacheKey)!;
      this.endpointsSubject.next(cached);
      return of(cached);
    }

    this.loadingSubject.next(true);

    // Cargar ambas colecciones: Payin y Payout
    const payinPath = this.getCollectionPath(country, 'payin');
    const payoutPath = this.getCollectionPath(country, 'payout');

    return combineLatest([
      this.loadCollection(payinPath, 'payin'),
      this.loadCollection(payoutPath, 'payout')
    ]).pipe(
      map(([payinEndpoints, payoutEndpoints]) => {
        return [...payinEndpoints, ...payoutEndpoints];
      }),
      tap(endpoints => {
        this.endpointsCache.set(cacheKey, endpoints);
        this.endpointsSubject.next(endpoints);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Error loading endpoints:', error);
        this.loadingSubject.next(false);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  /**
   * Carga una colección de Postman y la transforma
   */
  private loadCollection(path: string, category: 'payin' | 'payout'): Observable<Endpoint[]> {
    return this.http.get<PostmanCollection>(path).pipe(
      map(collection => {
        const groups = this.transformer.transformCollection(collection, category);
        return groups.flatMap(group => group.endpoints);
      }),
      catchError(error => {
        console.error(`Error loading ${category} collection:`, error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene ruta de la colección según país y tipo
   */
  private readonly countryNames: Record<CountryCode, string> = {
    ARG: 'Argentina'
  };

  private getCollectionPath(country: CountryCode, type: 'payin' | 'payout'): string {
    const countryName = this.countryNames[country];
    const typeName = type === 'payin' ? 'Payin' : 'PayOut';
    return `assets/data/endpoints/${countryName}_-_${typeName}_postman_collection.json`;
  }

  /**
   * Obtiene endpoint por ID
   */
  getEndpointById(id: string): Observable<Endpoint | undefined> {
    return this.endpoints$.pipe(
      map(endpoints => endpoints.find(e => e.id === id))
    );
  }

  /**
   * Filtra endpoints por categoría
   */
  getEndpointsByCategory(category: 'payin' | 'payout'): Observable<Endpoint[]> {
    return this.endpoints$.pipe(
      map(endpoints => endpoints.filter(e => e.category === category))
    );
  }

  /**
   * Agrupa endpoints por categoría
   */
  getEndpointGroups(): Observable<EndpointGroup[]> {
    return this.endpoints$.pipe(
      map(endpoints => {
        const payinEndpoints = endpoints.filter(e => e.category === 'payin');
        const payoutEndpoints = endpoints.filter(e => e.category === 'payout');

        const groups: EndpointGroup[] = [];

        if (payinEndpoints.length > 0) {
          groups.push({
            name: 'PayIn',
            description: 'Endpoints para recibir pagos',
            endpoints: payinEndpoints,
            icon: 'arrow-down-circle'
          });
        }

        if (payoutEndpoints.length > 0) {
          groups.push({
            name: 'PayOut',
            description: 'Endpoints para enviar fondos',
            endpoints: payoutEndpoints,
            icon: 'arrow-up-circle'
          });
        }

        return groups;
      })
    );
  }

  /**
   * Establece país actual
   */
  setCurrentCountry(country: CountryCode): void {
    this.currentCountrySubject.next(country);
    this.loadEndpointsForCountry(country).subscribe();
  }

  /**
   * Obtiene país actual
   */
  getCurrentCountry(): CountryCode {
    return this.currentCountrySubject.value;
  }
}
