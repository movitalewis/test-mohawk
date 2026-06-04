import { enableProdMode, ApplicationRef, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
  // Suppress debug-level logging in production. Keep warn/error so real
  // problems still surface in DevTools and error-tracking integrations.
  const noop = () => {};
  console.log = noop;
  console.debug = noop;
  console.info = noop;
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
