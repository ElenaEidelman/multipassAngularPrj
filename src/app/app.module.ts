import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDialogModule} from '@angular/material/dialog';
import {MatTabsModule} from '@angular/material/tabs';
import {MatMenuModule} from '@angular/material/menu';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule, NgxMatNativeDateModule } from '@angular-material-components/datetime-picker';
import { NgxMatMomentModule } from '@angular-material-components/moment-adapter';
import {MatCardModule} from '@angular/material/card';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';










import { ChartsModule } from 'ng2-charts';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MainViewComponent } from './main-view/main-view.component';
import { ExecOrderComponent, DatePickerDialog } from './Orders/exec-order/exec-order.component';
import { AllOrdersComponent } from './Orders/all-orders/all-orders.component';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { DialogConfirmComponent } from './PopUps/dialog-confirm/dialog-confirm.component';
import { AllCustomersComponent } from './Customers/all-customers/all-customers/all-customers.component';
import { NewCustomerComponent } from './Customers/new-customer/new-customer/new-customer.component';
import { MatSortModule } from '@angular/material/sort';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { HomeComponent } from './home/home.component';
import { TableComponent } from './Tables/table/table.component';
import { DialogContentExampleDialog } from './home/home.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AllCardsComponent } from './Cards/all-cards/all-cards.component';
import { OrderCardsComponent } from './Cards/order-cards/order-cards.component';
import { DigitalFilesListComponent } from './digital-files-list/digital-files-list.component';
import { ReportsComponent } from './reports/reports.component';
import { AllUsersComponent } from './Users/all-users/all-users.component';
import { NewUserComponent } from './Users/new-user/new-user.component';
import { ExistUserComponent } from './Users/exist-user/exist-user.component';
import { ExistCustomerComponent } from './Customers/exist-customer/exist-customer.component';
import { AllSmsTemplatesComponent, PhoneConfirmComponent } from './SMSTemplate/all-sms-templates/all-sms-templates.component';
import { NewSmsTemplateComponent } from './SMSTemplate/new-sms-template/new-sms-template.component';
import { CardInfoComponent } from './Cards/card-info/card-info.component';
import { LogInComponent } from './log-in/log-in.component';

import { DataServiceService } from './data-service.service';

import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { PublicComponent } from './public/public.component';
import { MatPaginatorIntlCro } from './Classes/MatPaginatorTranslate';
import { AdminLogInComponent } from './PopUps/admin-log-in/admin-log-in.component';
import { AdminComponent } from './Admin/admin/admin.component';
import { AdminNewUserComponent } from './Admin/admin-new-user/admin-new-user.component';
import { AdminNewCardComponent } from './Admin/admin-new-card/admin-new-card.component';
import { TestExpandingTableComponent } from './Orders/test-expanding-table/test-expanding-table.component';
import { OrderLinesComponent } from './Orders/order-lines/order-lines.component';
import { DialogComponent } from './PopUps/dialog/dialog.component';
import { FormatDatePipe } from './Pipes/format-date.pipe';
import { ExcelFileViewComponent } from './excel/excel-file-view/excel-file-view.component';
import { LoweUppCaseCheckPipe } from './Pipes/LowerUpperCaseCheck/lowe-upp-case-check.pipe';


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
    NewCustomerComponent,
    BarChartComponent,
    HomeComponent,
    TableComponent,
    DialogContentExampleDialog,
    AllCardsComponent,
    OrderCardsComponent,
    DigitalFilesListComponent,
    ReportsComponent,
    AllUsersComponent,
    NewUserComponent,
    ExistUserComponent,
    ExistCustomerComponent,
    AllSmsTemplatesComponent,
    NewSmsTemplateComponent,
    CardInfoComponent,
    LogInComponent,
    PublicComponent,
    AdminLogInComponent,
    AdminComponent,
    AdminNewUserComponent,
    AdminNewCardComponent,
    TestExpandingTableComponent,
    OrderLinesComponent,
    DialogComponent,
    FormatDatePipe,
    PhoneConfirmComponent,
    ExcelFileViewComponent,
    LoweUppCaseCheckPipe,
    DatePickerDialog
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
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    MatTooltipModule,
    ChartsModule,
    MatDialogModule,
    FontAwesomeModule,
    MatTabsModule,
    MatMenuModule,
    MatCheckboxModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgxMatMomentModule,
    MatCardModule,
    HttpClientModule,
    MatProgressSpinnerModule
  ],
  providers: [DataServiceService, { provide: MatPaginatorIntl, useClass: MatPaginatorIntlCro},{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
],
  bootstrap: [AppComponent]
})
export class AppModule { }
