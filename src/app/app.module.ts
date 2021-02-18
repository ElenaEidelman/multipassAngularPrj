import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {MatTableModule} from '@angular/material/table';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import {MatRadioModule} from '@angular/material/radio';
import {MatSelectModule} from '@angular/material/select';








import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MainViewComponent } from './main-view/main-view.component';
import { ExecOrderComponent } from './Orders/exec-order/exec-order.component';
import { AllOrdersComponent } from './Orders/all-orders/all-orders.component';
import { MatNativeDateModule } from '@angular/material/core';
import { DialogConfirmComponent } from './Dialogs/dialogConfirm/dialog-confirm/dialog-confirm.component';
import { AllCustomersComponent } from './Customers/all-customers/all-customers/all-customers.component';
import { NewCustomerComponent } from './Customers/new-customer/new-customer/new-customer.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainMenuComponent,
    MainViewComponent,
    ExecOrderComponent,
    AllOrdersComponent,
    DialogConfirmComponent,
    AllCustomersComponent,
    NewCustomerComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
