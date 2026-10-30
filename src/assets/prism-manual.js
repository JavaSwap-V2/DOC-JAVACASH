// Desactiva el auto-highlight de PrismJS para evitar errores en SPA
// Se invoca manualmente desde los componentes cuando es necesario.
if (typeof Prism !== 'undefined') {
  Prism.manual = true;
}
