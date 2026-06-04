import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Observable, throwError } from "rxjs";
import { environment } from "src/environments/environment";
import { SessionService } from "./session.service";
import { TokenService } from "./token.service";

@Injectable({
  providedIn: "root",
})
export class HttpInterceptorsService implements HttpInterceptor {
  private redirectingToLogin = false;

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private sessionService: SessionService,
  ) {}

  private hasErrorType(error: HttpErrorResponse, type: string): boolean {
    const errorsArray = error?.error?.errors;
    if (!Array.isArray(errorsArray)) return false;
    return errorsArray.some((o: any) => o?.type === type);
  }

  invalidTokenError(error: HttpErrorResponse): boolean {
    return this.hasErrorType(error, "InvalidTokenError");
  }

  unAuthorizedError(error: HttpErrorResponse): boolean {
    return this.hasErrorType(error, "UnauthorizedError");
  }

  private handleAuthError = (error: any): Observable<never> => {
    if (!this.redirectingToLogin && (this.invalidTokenError(error) || this.unAuthorizedError(error))) {
      this.redirectingToLogin = true;
      this.sessionService.redirectToLogin(this.router.url);
    }
    return throwError(() => error);
  };

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (request.headers.has("InterceptorSkipHeader")) {
      const headers = request.headers.delete("InterceptorSkipHeader");
      return next.handle(request.clone({ headers })).pipe(catchError(this.handleAuthError));
    }

    if (!this.tokenService.hasToken()) {
      return next.handle(request).pipe(catchError(this.handleAuthError));
    }

    const startSession = sessionStorage.getItem("startSession") === "true" ? "true" : "";
    const uid = localStorage.getItem("userEmail") || "";
    const isBaseApi =
      request.url.startsWith(environment.baseUrl) ||
      request.url.startsWith(environment.baseAPIURl);
    const isAsmApi = request.url.startsWith(environment.baseASMAPIURl);
    const isAptCheck = !isBaseApi && request.url.includes(environment.aptCheckBaseUrl);

    const setHeaders: Record<string, string> = isAsmApi
      ? {
          Authorization: "Bearer " + this.tokenService.getToken(),
        }
      : isAptCheck
      ? {
          Authorization: "Bearer " + this.tokenService.getToken(),
          impersonateFlag: startSession,
          customerId: uid,
        }
      : {
          BearerToken: "Bearer " + this.tokenService.getToken(),
          Authorization:
            "Basic " + btoa(`${environment.sentinentUser}:${environment.sentinentPwd}`),
          impersonateFlag: startSession,
          customerId: uid.toLowerCase(),
        };

    return next.handle(request.clone({ setHeaders })).pipe(catchError(this.handleAuthError));
  }
}
