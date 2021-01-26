import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllOrdersComponent } from './all-orders/all-orders.component';
import { ExecOrderComponent } from './exec-order/exec-order.component';

const routes: Routes = [
  {path: 'order', component: ExecOrderComponent},
  {path: 'allOrders', component: AllOrdersComponent},
  {path: 'order/:id', component: ExecOrderComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
