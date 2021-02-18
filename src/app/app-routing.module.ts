import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllCustomersComponent } from './Customers/all-customers/all-customers/all-customers.component';
import { NewCustomerComponent } from './Customers/new-customer/new-customer/new-customer.component';
import { AllOrdersComponent } from './Orders/all-orders/all-orders.component';
import { ExecOrderComponent } from './Orders/exec-order/exec-order.component';

const routes: Routes = [
  {path: 'order', component: ExecOrderComponent},
  {path: 'allOrders', component: AllOrdersComponent},
  {path: 'order/:id', component: ExecOrderComponent},
  {path: 'allCustomers', component: AllCustomersComponent},
  {path: 'customer/:id', component: NewCustomerComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
