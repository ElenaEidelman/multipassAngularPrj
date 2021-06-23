import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminNewCardComponent } from './Admin/admin-new-card/admin-new-card.component';
import { AdminNewUserComponent } from './Admin/admin-new-user/admin-new-user.component';
import { AdminComponent } from './Admin/admin/admin.component';
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

const routes: Routes = [
  {path:'', redirectTo: 'logIn', pathMatch: 'full'},
  // { path: '**', redirectTo: 'public/home' },
  {path: '', component: LogInComponent},
  {path: 'logIn', component: LogInComponent},
  {path: 'public', component: PublicComponent, canActivate: [LoginGuardGuard], children: [
    {path: 'home', component: HomeComponent},
    {path: 'order', component: ExecOrderComponent},
    {path: 'order/:id', component: ExecOrderComponent},
    {path: 'order/:id/:customerId', component: ExecOrderComponent},
    {path: 'newOrder/:customerId', component: ExecOrderComponent},
    {path: 'allOrders', component: AllOrdersComponent},
    {path: 'allOrders/:customerName', component: AllOrdersComponent},
    {path: 'allCustomers', component: AllCustomersComponent},
    {path: 'allCustomers/:id', component: AllCustomersComponent},
    {path: 'newCustomer', component: NewCustomerComponent},
    {path: 'customer/:id', component: ExistCustomerComponent  },
    {path: 'allCards', component: AllCardsComponent},
    {path: 'orderCards', component: OrderCardsComponent},
    {path: 'cardInfo/:id', component: CardInfoComponent},
    {path: 'orderLines/:orderId/:userId', component: OrderLinesComponent},
    {path: 'orderCards/:indexId/:userId', component: OrderCardsComponent},
    {path: 'digitalFilesList', component: DigitalFilesListComponent},
    {path: 'reports', component: ReportsComponent},
    {path: 'allUsers', component: AllUsersComponent},
    // {path: 'newUser', component: NewUserComponent},
    {path: 'user/:id', component: ExistUserComponent},
    {path: 'newUser', component: ExistUserComponent},
    {path: 'allSMStemplates', component: AllSmsTemplatesComponent},
    {path: 'testExpandingTable', component: TestExpandingTableComponent},
    {path: 'admin', component: AdminComponent, children: [
      {path: 'createNewUser', component: AdminNewUserComponent},
      {path: 'createNewCard', component: AdminNewCardComponent},
    ]}
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
