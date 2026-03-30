import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Layouts
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DocsLayoutComponent } from './layouts/docs-layout/docs-layout.component';

// Shared Components
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { BadgeComponent } from './shared/components/badge/badge.component';
import { CodeBlockComponent } from './shared/components/code-block/code-block.component';
import { SearchModalComponent } from './shared/components/search-modal/search-modal.component';
import { TryItOutComponent } from './shared/components/try-it-out/try-it-out.component';

// Pages - Home
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';

// Pages - API Reference
import { EndpointDetailPageComponent } from './features/api-reference/pages/endpoint-detail-page/endpoint-detail-page.component';

// Pages - Documentation
import { IntroductionPageComponent } from './features/documentation/pages/introduction-page/introduction-page.component';
import { AuthenticationPageComponent } from './features/documentation/pages/authentication-page/authentication-page.component';
import { ErrorsPageComponent } from './features/documentation/pages/errors-page/errors-page.component';

@NgModule({
  declarations: [
    AppComponent,
    // Layouts
    MainLayoutComponent,
    DocsLayoutComponent,
    // Shared Components
    NavbarComponent,
    SidebarComponent,
    BadgeComponent,
    CodeBlockComponent,
    SearchModalComponent,
    TryItOutComponent,
    // Pages
    HomePageComponent,
    EndpointDetailPageComponent,
    IntroductionPageComponent,
    AuthenticationPageComponent,
    ErrorsPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
