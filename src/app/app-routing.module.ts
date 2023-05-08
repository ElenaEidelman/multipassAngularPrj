import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AllCardsComponent } from './Cards/all-cards/all-cards.component';
import { CardInfoComponent } from './Cards/card-info/card-info.component';
import { OrderCardsComponent } from './Cards/order-cards/order-cards.component';

import { AllCustomersComponent } from './Customers/all-customers/all-customers/all-customers.component';
import { ExistCustomerComponent } from './Customers/exist-customer/exist-customer.component';
import { NewCustomerComponent } from './Customers/new-customer/new-customer/new-customer.component';
import { DigitalFilesListComponent } from './digital-files-list/digital-files-list.component';
import { LoginGuardGuard } from './guards/login-guard.guard';

import { HomeComponent } from './home/home.component';
import { LogInComponent } from './log-in/log-in.component';
import { AllOrdersComponent } from './Orders/all-orders/all-orders.component';
import { ExecOrderComponent } from './Orders/exec-order/exec-order.component';
import { OrderLinesComponent } from './Orders/order-lines/order-lines.component';
import { TestExpandingTableComponent } from './Orders/test-expanding-table/test-expanding-table.component';
import { PublicComponent } from './public/public.component';
import { ReportsComponent } from './reports/reports.component';
import { AllSmsTemplatesComponent } from './SMSTemplate/all-sms-templates/all-sms-templates.component';
import { AllUsersComponent } from './Users/all-users/all-users.component';
import { ExistUserComponent } from './Users/exist-user/exist-user.component';
import { NewUserComponent } from './Users/new-user/new-user.component';
import { ExcelFileViewComponent } from './excel/excel-file-view/excel-file-view.component';
import { TestComponent } from './test/test.component';
import { AdminIframeComponent } from './Admin/admin-iframe/admin-iframe.component';
import { IframeSettingsComponent } from './Admin/admin-iframe/iframeChildren/iframe-page2/iframe-settings.component';
import { IframeSetupComponent } from './Admin/admin-iframe/iframeChildren/iframe-thankyou/iframe-setup.component';
import { IframeComponent } from './Admin/admin-iframe/iframeChildren/iframe-enterSum/iframe.component';
import { LogInIframeComponent } from './Iframe/components/log-in/log-in.component';
import { PurchasingGiftComponent } from './Iframe/components/purchasing-gift/purchasing-gift.component';
import { ThanksPageComponent } from './Iframe/components/thanks-page/thanks-page.component';
import { PagePermissionGuardGuard } from './guards/pagePermissionGuard/page-permission-guard.guard';
import { SystemSettingsComponent } from './system-settings/system-settings.component';
import { VouchersIssuanceComponent } from './Cards/vouchers-issuance/vouchers-issuance.component';
import { LoadingVouchersComponent } from './Cards/loading-vouchers/loading-vouchers.component';
import { CardsListComponent } from './Cards/cards-list/cards-list.component';

const routes: Routes = [
  { path: 'logIn', component: LogInComponent },
  // { path: '', component: LogInComponent },

  {
    path: 'public', component: PublicComponent, canActivate: [LoginGuardGuard], children: [
      { path: 'home', component: HomeComponent },
      { path: 'order', component: ExecOrderComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'newOrder', component: ExecOrderComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'loadVouchersManualy', component: ExecOrderComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'allOrders', component: AllOrdersComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'allCustomers', component: AllCustomersComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'newCustomer', component: NewCustomerComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'customer', component: ExistCustomerComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'allCards', component: AllCardsComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'orderCards', component: OrderCardsComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'cardInfo', component: CardInfoComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'orderLines', component: OrderLinesComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'digitalFilesList', component: DigitalFilesListComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'reports', component: ReportsComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'allUsers', component: AllUsersComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'user', component: ExistUserComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'newUser', component: NewUserComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'allSMStemplates', component: AllSmsTemplatesComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'testExpandingTable', component: TestExpandingTableComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'excelView', component: ExcelFileViewComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'SystemSettings', component: SystemSettingsComponent, canActivate: [PagePermissionGuardGuard] },
      { path: 'IssuanceVouchers', component: VouchersIssuanceComponent },
      { path: 'LoadingVouchers', component: LoadingVouchersComponent },
      { path: 'CardsList', component: CardsListComponent },


      {
        path: 'IFrame', component: AdminIframeComponent, children: [
          {
            path: 'iframeView', component: IframeComponent, children: [
              { path: 'giftCard', component: LogInIframeComponent },
            ]
          },
          {
            path: 'iframeSettings', component: IframeSettingsComponent, children: [
              { path: 'giftCard2Page', component: PurchasingGiftComponent }
            ]
          },
          {
            path: 'thankyouIframe', component: IframeSetupComponent, children: [
              { path: 'thankyou', component: ThanksPageComponent }
            ]
          }
        ], canActivate: [PagePermissionGuardGuard]
      },
      { path: 'test', component: TestComponent }
    ]
  },

  { path: 'giftCard/login', component: LogInIframeComponent },
  { path: 'gift-card/:sum', component: PurchasingGiftComponent },
  { path: 'gift-card', component: PurchasingGiftComponent },
  { path: 'thankyou', component: ThanksPageComponent },
  { path: '', redirectTo: 'logIn', pathMatch: 'full' },
  { path: '**', component: LogInComponent },
];
//http://localhost:4200/giftCard/login?companyid=bC1uVdEINfm7oJNltQd3PA2
//https://tempdomain-test-3.mltp.co.il/giftCard/login?companyid=bC1uVdEINfm7oJNltQd3PA2


//https://tempdomain-test-3.mltp.co.il/giftCard/login?companyid=bC1uVdEINfm7oJNltQd3PA2
//https://tempdomain-test-7.mltp.co.il/order?t=aQwPrFXnUMnNYm6Tr4Pp3g2

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
