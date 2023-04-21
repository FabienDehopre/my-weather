import {ApplicationConfig, inject} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpHeaders,
  HttpRequest,
  provideHttpClient,
  withInterceptors
} from "@angular/common/http";
import {catchError, Observable, throwError} from "rxjs";
import {DOCUMENT} from "@angular/common";

function addBffRequiredHeaders(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (req.url.startsWith('/bff/user') || req.url.startsWith('/api')) {
    return next(req.clone({ headers: new HttpHeaders({ 'X-CSRF': '1' })}));
  }

  return next(req);
}

function handleUnauthorized(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const document = inject(DOCUMENT);
  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        document.location.assign('https://localhost:7293/bff/login?redirectUrl=https://localhost:44449/');
      }

      return throwError(() => error);
    })
  );
}

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient(withInterceptors([addBffRequiredHeaders, handleUnauthorized]))]
};
