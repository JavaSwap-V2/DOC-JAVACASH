# TuPay Finance API Documentation - SPA Angular

Documentación interactiva de la API de TuPay Finance, construida con Angular 17. Permite a desarrolladores explorar endpoints, probar peticiones y aprender a integrar pagos en Guatemala y República Dominicana.

## Requisitos Previos

- Node.js 18+
- npm 9+
- Angular CLI 17+ (`npm install -g @angular/cli@17`)

## Instalación Rápida

```bash
# Clonar o descomprimir el proyecto
cd tupay-api-docs

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación se abrirá en `http://localhost:4200`

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia servidor de desarrollo |
| `npm run build` | Build para producción |
| `npm run build:prod` | Build optimizado para producción |
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
│   │       ├── badge/           # Badges para métodos HTTP
│   │       ├── code-block/      # Bloques de código con syntax highlight
│   │       ├── navbar/          # Barra de navegación
│   │       ├── search-modal/    # Modal de búsqueda (Ctrl+K)
│   │       ├── sidebar/         # Menú lateral
│   │       └── try-it-out/      # Probador de endpoints
│   ├── features/                # Módulos por funcionalidad
│   │   ├── api-reference/       # Detalle de endpoints
│   │   ├── documentation/       # Páginas de documentación
│   │   │   └── pages/
│   │   │       ├── introduction-page/
│   │   │       ├── authentication-page/
│   │   │       └── errors-page/
│   │   └── home/                # Página de inicio
│   └── layouts/                 # Layouts de página
│       ├── main-layout/         # Layout principal (home)
│       └── docs-layout/         # Layout de documentación
├── assets/
│   └── data/endpoints/          # Colecciones Postman (JSON)
├── styles/
│   ├── _variables.scss          # Variables de diseño
│   └── _mixins.scss             # Mixins SCSS reutilizables
└── styles.scss                  # Estilos globales
```

## Rutas Disponibles

| Ruta | Descripción |
|------|-------------|
| `/` | Página de inicio |
| `/gateway` | Redirige a introducción |
| `/gateway/introduction` | Introducción a la API |
| `/gateway/authentication` | Guía de autenticación |
| `/gateway/errors` | Manejo de errores |
| `/gtm/api/:category/:id` | Endpoints Guatemala |
| `/dom/api/:category/:id` | Endpoints Rep. Dominicana |

## Características

### Implementadas
- Dark Mode persistente (localStorage)
- Búsqueda global con Ctrl+K
- multipaís (Guatemala / Rep. Dominicana)
- Syntax highlighting con Prism.js
- Responsive design (mobile, tablet, desktop)
- Try It Out - probar endpoints en vivo
- Ejemplos de código (cURL, JavaScript, Python, PHP)
- Navegación por teclado completa
- Accesibilidad (ARIA labels, focus states)
- Animaciones suaves en componentes
- SDKs documentados (Node.js, Python, PHP)
- Documentación de webhooks

### Componentes UI
- Badges para métodos HTTP (GET, POST, PUT, DELETE)
- Bloques de código con copiado al portapapeles
- Info boxes (info, warning, success, error)
- Tablas estilizadas para documentación
- Cards interactivas con hover effects
- Steps verticales para guias paso a paso

## Solución de Problemas

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

1. Exporta la colección desde Postman en formato v2.1
2. Coloca el archivo JSON en `src/assets/data/endpoints/`
3. Nombra el archivo siguiendo el patrón: `{País}_-_{Tipo}_postman_collection.json`
4. Los endpoints se cargarán automáticamente al seleccionar el país

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
4. Los estilos usan el patrón BEM para nomenclatura CSS

## Versión

- **Versión**: 2.1.0
- **Última actualización**: Diciembre 2024
- **Angular**: 17.x
- **Node.js**: 18+
