import { CUSTOM_ELEMENTS_SCHEMA, Injectable, NgModule, NgZone, provideZoneChangeDetection } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { HTTP_INTERCEPTORS, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { HttpInterceptorsService } from "./features/http-services/http-interceptors.service";
import { UserModule } from "./features/shared/user/user.module";
import { Observable, tap } from "rxjs";


@NgModule({ declarations: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    bootstrap: [AppComponent], imports: [BrowserModule,
        AppRoutingModule,
        UserModule,
        BrowserAnimationsModule,
    ],   providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpInterceptorsService,
            multi: true,
        },
     
        provideHttpClient(withInterceptorsFromDi()),
        // { provide: HTTP_INTERCEPTORS, useClass: ZoneInterceptor, multi: true },

    ] })
export class AppModule {}

