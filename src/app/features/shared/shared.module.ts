import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarModule } from "@solidexpert/ng-sidebar";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { LogoComponent } from "./components/logo/logo.component";
import { LogoPdpComponent } from "./components/logo-pdp/logo-pdp.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { TabsModule } from "ngx-bootstrap/tabs";
import { CustomIconComponent } from "./components/custom-icon/custom-icon.component";
import { AlertComponent, AlertModule } from "ngx-bootstrap/alert";
import { ProductFeaturesComponent } from "./components/product-features/product-features.component";
import { CarouselModule } from "ngx-owl-carousel-o";
import { XchangeHomeSearchComponent } from "./components/xchange-home-search/xchange-home-search.component";
import { XchangeSearchControlComponent } from "./form-control-components/xchange-search-control/xchange-search-control.component";
import { XchangeBrowserAlertComponent } from "./components/xchange-browser-alert/xchange-browser-alert.component";
import { XchangeCustomCheckboxComponent } from "./form-control-components/xchange-custom-checkbox/xchange-custom-checkbox.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BsDatepickerModule } from "ngx-bootstrap/datepicker";
import { TableModule } from "ngx-easy-table";
import { XchangeBreadcrumbComponent } from "./components/xchange-breadcrumb/xchange-breadcrumb.component";
import { XchangeCardElementComponent } from "./components/xchange-card-element/xchange-card-element.component";
import { XchangeIconButtonComponent } from "./components/xchange-icon-button/xchange-icon-button.component";
import { ModalModule } from "ngx-bootstrap/modal";
import { XchangeCustomRadioComponent } from "./form-control-components/xchange-custom-radio/xchange-custom-radio.component";
import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { SiteFooterComponent } from "./layouts/components/site-footer/site-footer.component";
import { SiteHeaderComponent } from "./layouts/components/site-header/site-header.component";
import { DocumentationLayoutComponent } from "./layouts/documentation-layout/documentation-layout.component";
import { MainLayoutComponent } from "./layouts/main-layout/main-layout.component";
import { RegistrationLayoutComponent } from "./layouts/registration-layout/registration-layout.component";
import { NgxNavbarModule } from "ngx-bootstrap-navbar";
import { RouterModule } from "@angular/router";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { SiteSidenavComponent } from "./layouts/components/site-sidenav/site-sidenav.component";
import { XchangeProductFiltersComponent } from "./components/xchange-product-filters/xchange-product-filters.component";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { XchangeProductsListComponent } from "./components/xchange-products-list/xchange-products-list.component";
import { XchangeProductComponent } from "./components/xchange-product/xchange-product.component";
import { XchangeProductImageViewComponent } from "./components/xchange-product-image-view/xchange-product-image-view.component";
import { XchangeSwitchButtonComponent } from "./form-control-components/xchange-switch-button/xchange-switch-button.component";
import { PaginationModule } from "ngx-bootstrap/pagination";
import { XchangeSpecificationsWidgetComponent } from "./components/xchange-specifications-widget/xchange-specifications-widget.component";
import { XchangeImageViewLightBoxComponent } from "./components/xchange-image-view-light-box/xchange-image-view-light-box.component";
import { XchangeCompareBottomSheetComponent } from "./components/xchange-compare-bottom-sheet/xchange-compare-bottom-sheet.component";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { XchangeManageDeductionsComponent } from "./components/manage-deductions/manage-deductions.component";
import { PopoverModule } from "ngx-bootstrap/popover";
import { FilterByComponent } from "./components/filter-by/filter-by.component";
import { ProductCatalogComponent } from "./components/product-catalog/product-catalog.component";
import { XchangeAddAccessoriesLightboxComponent } from "./components/xchange-add-accessories-lightbox/xchange-add-accessories-lightbox.component";
import { XchangeSiteMessageComponent } from "./components/xchange-site-message/xchange-site-message.component";
import { SearchFilterPipe } from "./pipes/search-filter.pipe";
import { ClickOutsideDirective } from "./directives/click-outside.directive";
import { TableViewComponent } from "./components/table-view/table-view.component";
import { NgxPaginationModule } from "ngx-pagination";
import { ResponsiveTabsDirective } from "./directives/responsive-tabs.directive";
import { ErrorModalComponent } from "./components/error-modal/error-modal.component";
import { LoaderComponent } from "./components/loader/loader.component";
import { NgxSpinnerModule } from "ngx-spinner";
import { AlertsComponent } from "./components/alerts/alerts.component";
import { CommentModalComponent } from "./components/comment-modal/comment-modal.component";
import { NewReserveNameComponent } from "./components/new-reserve-name/new-reserve-name.component";
import { AddUserModalComponent } from "./components/add-user-modal/add-user-modal.component";
import { XchangeViewAllColorsComponent } from "./components/xchange-view-all-colors/xchange-view-all-colors.component";
import { XchangeSalesTeamComponent } from "./components/xchange-sales-team/xchange-sales-team.component";
import { XchangeRadioButtonComponent } from "./form-control-components/xchange-radio-button/xchange-radio-button.component";
import { BuilderDivisionComponent } from "./components/builder-modals/builder-division/builder-division.component";
import { BuilderSubdivisionComponent } from "./components/builder-modals/builder-subdivision/builder-subdivision.component";
import { GetBuilderInfoComponent } from "./components/builder-modals/get-builder-info/get-builder-info.component";
import { SubmitBuilderComponent } from "./components/builder-modals/submit-builder/submit-builder.component";
import { ConfirmationDialogComponent } from "./components/confirmation-dialog/confirmation-dialog.component";
import { CaptchaComponent } from './components/captcha/captcha.component';
import { SwitchTabModalComponent } from './components/switch-tab-modal/switch-tab-modal.component';
import { QuanityChangePopupComponent } from './components/quanity-change-popup/quanity-change-popup.component';
import { ChangeDyelotModalComponent } from './components/change-dyelot-modal/change-dyelot-modal.component';
import { ShareEmailModalComponent } from "./components/share-email-modal/share-email-modal.component";
import { BuilderDetailsComponent } from './components/builder-modals/builder-details/builder-details.component';
import { ViewDeductionsComponent } from './components/view-deductions/view-deductions.component';
import { PreventPasteDirective } from "./directives/prevent-paste.directive";
import { AsmAbilityComponent } from "./components/asm/pages/asm-ability/asm-ability.component";
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ProgressModalComponent } from './components/progress-modal/progress-modal.component';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { CommercialSiteSelectorComponent } from './components/commercial-site-selector/commercial-site-selector.component';
import { XchangeSearchInputComponent } from "./form-control-components/xchange-search-input/xchange-search-input.component";
import { ClaimLineTypeComponent } from "./components/claim-line-type/claim-line-type.component";
import { ClaimComments } from "./components/claim-comments/claim-comments";
import { ClaimUninstalledComponent } from "./claims/components/claim-uninstalled/claim-uninstalled";
@NgModule({
  declarations: [
    LogoComponent,
    LogoPdpComponent,
    CustomIconComponent,
    ProductFeaturesComponent,
    XchangeHomeSearchComponent,
    XchangeSearchControlComponent,
    XchangeBrowserAlertComponent,
    XchangeCustomCheckboxComponent,
    XchangeBreadcrumbComponent,
    XchangeCardElementComponent,
    XchangeIconButtonComponent,
    XchangeCustomRadioComponent,
    DocumentationLayoutComponent,
    SiteHeaderComponent,
    SiteFooterComponent,
    MainLayoutComponent,
    RegistrationLayoutComponent,
    SiteSidenavComponent,
    XchangeProductFiltersComponent,
    XchangeProductsListComponent,
    XchangeProductComponent,
    XchangeProductImageViewComponent,
    XchangeSwitchButtonComponent,
    XchangeSpecificationsWidgetComponent,
    XchangeImageViewLightBoxComponent,
    XchangeCompareBottomSheetComponent,
    XchangeManageDeductionsComponent,
    XchangeAddAccessoriesLightboxComponent,
    XchangeSiteMessageComponent,
    FilterByComponent,
    ProductCatalogComponent,
    SearchFilterPipe,
    ClickOutsideDirective,
    TableViewComponent,
    ResponsiveTabsDirective,
    ErrorModalComponent,
    LoaderComponent,
    AlertsComponent,
    CommentModalComponent,
    NewReserveNameComponent,
    AddUserModalComponent,
    XchangeViewAllColorsComponent,
    XchangeSalesTeamComponent,
    XchangeRadioButtonComponent,
    GetBuilderInfoComponent,
    BuilderDivisionComponent,
    BuilderSubdivisionComponent,
    SubmitBuilderComponent,
    ConfirmationDialogComponent,
    CaptchaComponent,
    SwitchTabModalComponent,
    QuanityChangePopupComponent,
    ChangeDyelotModalComponent,
    ShareEmailModalComponent,
    BuilderDetailsComponent,
    ViewDeductionsComponent,
    PreventPasteDirective,
    AsmAbilityComponent,
    ProgressModalComponent,
    CommercialSiteSelectorComponent,
    XchangeSearchInputComponent,
    ClaimLineTypeComponent,
    ClaimComments,
    ClaimUninstalledComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    SidebarModule,
    FontAwesomeModule,
    NgSelectModule,
    TabsModule.forRoot(),
    AlertModule.forRoot(),
    CarouselModule,
    BsDatepickerModule.forRoot(),
    TableModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    NgxNavbarModule,
    CollapseModule.forRoot(),
    AccordionModule.forRoot(),
    PaginationModule.forRoot(),
    TooltipModule.forRoot(),
    PopoverModule.forRoot(),
    NgxPaginationModule,
    NgxSpinnerModule,
    TypeaheadModule.forRoot(),
    ProgressbarModule.forRoot(),
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    AlertsComponent,
    SidebarModule,
    FontAwesomeModule,
    LogoComponent,
    LogoPdpComponent,
    NgSelectModule,
    TabsModule,
    CustomIconComponent,
    AlertModule,
    ProductFeaturesComponent,
    CarouselModule,
    XchangeHomeSearchComponent,
    XchangeSearchControlComponent,
    XchangeBrowserAlertComponent,
    XchangeCustomCheckboxComponent,
    BsDatepickerModule,
    TableModule,
    XchangeBreadcrumbComponent,
    XchangeCardElementComponent,
    XchangeIconButtonComponent,
    ModalModule,
    XchangeCustomRadioComponent,
    BsDropdownModule,
    NgxNavbarModule,
    CollapseModule,
    XchangeProductFiltersComponent,
    XchangeProductsListComponent,
    XchangeProductImageViewComponent,
    PaginationModule,
    XchangeSpecificationsWidgetComponent,
    XchangeCompareBottomSheetComponent,
    TooltipModule,
    PopoverModule,
    AccordionModule,
    XchangeManageDeductionsComponent,
    XchangeAddAccessoriesLightboxComponent,
    XchangeSiteMessageComponent,
    XchangeSwitchButtonComponent,
    FilterByComponent,
    ProductCatalogComponent,
    SearchFilterPipe,
    TableViewComponent,
    ResponsiveTabsDirective,
    LoaderComponent,
    NewReserveNameComponent,
    XchangeRadioButtonComponent,
    ConfirmationDialogComponent,
    ShareEmailModalComponent,
    ViewDeductionsComponent,
    PreventPasteDirective,
    AsmAbilityComponent,
    XchangeSearchInputComponent,
    ClaimUninstalledComponent,
  ],
})
export class SharedModule {}
