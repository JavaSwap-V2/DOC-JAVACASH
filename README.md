# TuPay Finance API Documentation - SPA Angular

Documentacion interactiva de la API de TuPay Finance, construida con Angular 17. Permite a desarrolladores explorar endpoints, probar peticiones y aprender a integrar pagos en Guatemala y Republica Dominicana.

## Requisitos Previos

- Node.js 18+
- npm 9+
- Angular CLI 17+ (`npm install -g @angular/cli@17`)

## Instalacion Rapida

```bash
# Clonar o descomprimir el proyecto
cd tupay-api-docs

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicacion se abrira en `http://localhost:4200`

## Scripts Disponibles

| Comando | Descripcion |
|---------|-------------|
| `npm start` | Inicia servidor de desarrollo |
| `npm run build` | Build para produccion |
| `npm run build:prod` | Build optimizado para produccion |
| `npm run watch` | Build con watch mode |
| `ng test` | Ejecutar tests unitarios |
| `ng lint` | Ejecutar linting |

## Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios y modelos singleton
│   │   ├── models/              # Interfaces y tipos TypeScript
│   │   └── services/            # Servicios (endpoints, theme, search)
│   ├── shared/                  # Componentes reutilizables
│   │   └── components/
│   │       ├── badge/           # Badges para metodos HTTP
│   │       ├── code-block/      # Bloques de codigo con syntax highlight
│   │       ├── navbar/          # Barra de navegacion
│   │       ├── search-modal/    # Modal de busqueda (Ctrl+K)
│   │       ├── sidebar/         # Menu lateral
│   │       └── try-it-out/      # Probador de endpoints
│   ├── features/                # Modulos por funcionalidad
│   │   ├── api-reference/       # Detalle de endpoints
│   │   ├── documentation/       # Paginas de documentacion
│   │   │   └── pages/
│   │   │       ├── introduction-page/
│   │   │       ├── authentication-page/
│   │   │       └── errors-page/
│   │   └── home/                # Pagina de inicio
│   └── layouts/                 # Layouts de pagina
│       ├── main-layout/         # Layout principal (home)
│       └── docs-layout/         # Layout de documentacion
├── assets/
│   └── data/endpoints/          # Colecciones Postman (JSON)
├── styles/
│   ├── _variables.scss          # Variables de diseno
│   └── _mixins.scss             # Mixins SCSS reutilizables
└── styles.scss                  # Estilos globales
```

## Rutas Disponibles

| Ruta | Descripcion |
|------|-------------|
| `/` | Pagina de inicio |
| `/gateway` | Redirige a introduccion |
| `/gateway/introduction` | Introduccion a la API |
| `/gateway/authentication` | Guia de autenticacion |
| `/gateway/errors` | Manejo de errores |
| `/gtm/api/:category/:id` | Endpoints Guatemala |
| `/dom/api/:category/:id` | Endpoints Rep. Dominicana |

## Caracteristicas

### Implementadas
- Dark Mode persistente (localStorage)
- Busqueda global con Ctrl+K
- Multi-pais (Guatemala / Rep. Dominicana)
- Syntax highlighting con Prism.js
- Responsive design (mobile, tablet, desktop)
- Try It Out - probar endpoints en vivo
- Ejemplos de codigo (cURL, JavaScript, Python, PHP)
- Navegacion por teclado completa
- Accesibilidad (ARIA labels, focus states)
- Animaciones suaves en componentes
- SDKs documentados (Node.js, Python, PHP)
- Documentacion de webhooks

### Componentes UI
- Badges para metodos HTTP (GET, POST, PUT, DELETE)
- Bloques de codigo con copiado al portapapeles
- Info boxes (info, warning, success, error)
- Tablas estilizadas para documentacion
- Cards interactivas con hover effects
- Steps verticales para guias paso a paso

## Solucion de Problemas

### "Cannot find module '@angular/core'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "ng command not found"
```bash
npm install -g @angular/cli@17
```

### Puerto 4200 ocupado
```bash
ng serve --port 4201
```

### Error al compilar SCSS
```bash
npm install sass --save-dev
```

## Agregar Nuevos Endpoints

1. Exporta la coleccion desde Postman en formato v2.1
2. Coloca el archivo JSON en `src/assets/data/endpoints/`
3. Nombra el archivo siguiendo el patron: `{Pais}_-_{Tipo}_postman_collection.json`
4. Los endpoints se cargaran automaticamente al seleccionar el pais

## Personalizar Estilos

Los estilos se manejan con SCSS. Variables principales en `src/styles/_variables.scss`:

- `$primary-blue` - Color primario
- `$accent-cyan` - Color de acento
- `$dark-background` - Fondo en modo oscuro
- `$font-primary` - Fuente principal (Inter)
- `$font-mono` - Fuente monoespaciada (JetBrains Mono)

## Notas Importantes

1. No modificar archivos en `dist/` - se regeneran en cada build
2. Las API Keys del usuario se guardan en localStorage
3. Prism.js se carga desde node_modules
4. Los estilos usan el patron BEM para nomenclatura CSS

## Version

- **Version**: 2.1.0
- **Ultima actualizacion**: Diciembre 2024
- **Angular**: 17.x
- **Node.js**: 18+
