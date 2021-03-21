import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllCardsComponent } from './Cards/all-cards/all-cards.component';
import { OrderCardsComponent } from './Cards/order-cards/order-cards.component';

import { AllCustomersComponent } from './Customers/all-customers/all-customers/all-customers.component';
import { ExistCustomerComponent } from './Customers/exist-customer/exist-customer.component';
import { NewCustomerComponent } from './Customers/new-customer/new-customer/new-customer.component';
import { DigitalFilesListComponent } from './digital-files-list/digital-files-list.component';

import { HomeComponent } from './home/home.component';
import { AllOrdersComponent } from './Orders/all-orders/all-orders.component';
import { ExecOrderComponent } from './Orders/exec-order/exec-order.component';
import { ReportsComponent } from './reports/reports.component';
import { AllSmsTemplatesComponent } from './SMSTemplate/all-sms-templates/all-sms-templates.component';
import { AllUsersComponent } from './Users/all-users/all-users.component';
import { ExistUserComponent } from './Users/exist-user/exist-user.component';
import { NewUserComponent } from './Users/new-user/new-user.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // { path: '**', component: HomeComponent },
  {path: 'home', component: HomeComponent},
  {path: 'order', component: ExecOrderComponent},
  {path: 'allOrders', component: AllOrdersComponent},
  {path: 'order/:id', component: ExecOrderComponent},
  {path: 'allCustomers', component: AllCustomersComponent},
  {path: 'newCustomer', component: NewCustomerComponent},
  {path: 'customer/:id', component: ExistCustomerComponent  },
  {path: 'allCards', component: AllCardsComponent},
  {path: 'orderCards', component: OrderCardsComponent},
  {path: 'orderCards/:indexId/:userId', component: OrderCardsComponent},
  {path: 'digitalFilesList', component: DigitalFilesListComponent},
  {path: 'reports', component: ReportsComponent},
  {path: 'allUsers', component: AllUsersComponent},
  // {path: 'newUser', component: NewUserComponent},
  {path: 'user/:id', component: ExistUserComponent},
  {path: 'newUser', component: ExistUserComponent},
  {path: 'allSMStemplates', component: AllSmsTemplatesComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
