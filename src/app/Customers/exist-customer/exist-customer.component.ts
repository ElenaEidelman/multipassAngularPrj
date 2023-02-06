import { Route } from '@angular/compiler/src/core';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { tick } from '@angular/core/testing';
import { FormBuilder, FormControl, MaxLengthValidator, Validators } from '@angular/forms';
import { MatDialog, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { AlertMessage } from 'src/assets/alertMessage';
import { OrderData } from '../../Classes/OrderData';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';

import { MsgList } from 'src/app/Classes/msgsList';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { MockData } from 'src/app/Classes/mockData';



@Component({
  selector: 'app-exist-customer',
  templateUrl: './exist-customer.component.html',
  styleUrls: ['./exist-customer.component.css']
})
export class ExistCustomerComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;
  faFileExcel = faFileExcel;

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }

  // data chart
  public recOrdersChartData: ChartDataSets[];
  public recOrdersChartLabels: Label[];

  userToken: string;
  userId;
  errorActionButtons: string = '';
  msgActionButtons: string = '';
  customerData;
  customerOrders;
  MsgList = MsgList;
  MockData = MockData;

  saveFormSpinner: boolean = false;
  statusList = [];


  customerDetails;
  customerAddress;
  customerSettings;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private dataService: DataServiceService,
    public dialog: MatDialog,
    private sharedService: SharedService,
    private urlSharingService: UrlSharingService) { }

  CustomerForm = this.fb.group({
    OrganizationName: ['', [Validators.required, this.noWhitespaceValidator]],//v
    FName: (''),
    LName: (''),
    Email: ['', [Validators.required, Validators.email]], //v
    Phone: ['', [Validators.required, Validators.pattern('[[0][0-9]{8,9}]*')]], //v
    Permission: ['', Validators.required],//v
    Phone1: ['', [Validators.pattern('[[0][0-9]{8,9}]*')]],
    userNumber: [{ value: '', disabled: true }], //v
    CityName: (''),//v
    Streetno: (''),//v 
    HouseNumber: (''), //new
    Entrance: (''),//v
    floor: (''), // new
    ApartmentNo: (''),//v
    ZIP: (''), // ------------
    StatusId: (''),
    MultipassIclientID: (''),
    Tz: ['', Validators.required],//v
    Notes: (''), //v
    BusinessFile: ('/test.txt') //must to be required Validators.required
  },
    { updateOn: "blur" });

  idUnsubscribe;

  rolesList = ['מנהל באק אופיס', 'מפעיל באק אופיס'];


  ngOnInit() {
    window.scroll(0, 0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getUserStatus();

    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));

    this.sharedService.pagesAccessLevel.next('');
    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.CustomerForm.disable();
    }


    // this.idUnsubscribe = this.activeRoute.params.subscribe(param => {

    let urlParams = this.urlSharingService.messageSource.getValue();
    debugger
    if (urlParams == '') {
      this.router.navigate(['/public/home']);
    }
    else {
      this.urlSharingService.changeMessage('');
      this.userId = JSON.parse(urlParams)['customerId'];
    }


    let objToApi = {
      Token: this.userToken,
      CustomerId: this.userId
    }

    this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {

      // if (result['Token'] != undefined || result['Token'] != null) {
      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        this.sharedService.exitSystemEvent(result);
        return false;
      }

      if (typeof result == 'object' && result.obj != null) {
        this.customerData = result.obj[0];

        Object.keys(result.obj[0]).forEach(el => {
          if (this.CustomerForm.get(el) != null && el != 'SEO_Description') {
            this.CustomerForm.get(el).setValue(result.obj[0][el]);
          }

          if (el == 'SEO_Description') {
            this.CustomerForm.get('Notes').setValue(result.obj[0][el]);
          }

          if (el == 'StatusId') {

            let list = this.statusList.filter(status => status.StatusId == this.CustomerForm.get(el).value);

            this.CustomerForm.get(el).setValue(list[0]['StatusId']);
          }
          else if (el == 'Address') {
            this.CustomerForm.get('HouseNumber').setValue(result.obj[0]['Address']);
          }
        });
        this.getChartData();
      }
      if (result.obj == null && result.errdesc != '') {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        this.router.navigate(['/public/home']);
      }
      // }
      // else {
      //   // this.dialog.open(DialogComponent, {
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // })
      //   this.sharedService.exitSystemEvent();
      // }
    });
    // })

  }


  ngOnChanges(changes: SimpleChanges) {

  }

  getChartData() {
    // this.recOrdersChartData = [
    //   { data: [1500,2000,1750,9000,500, 250], label: 'ערך הזמנה' }
    // ];


    // this.recOrdersChartLabels = ['16:12:23 16/03/2021','15:12:23 14/03/2021','13:12:23 13/03/2021','12:12:23 11/03/2021','16:12:23 9/03/2021','16:12:23 6/03/2021'];


    let objToApi = {
      Token: this.userToken,
      UserID: this.userId
    }
    this.dataService.GetOrdersByFilter(objToApi).subscribe(result => {
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'object' && result['obj'] != undefined && result['obj'].length > 0) {
          this.customerOrders = result.obj;
          let totalOrder = 0;
          let totalByOrder = [];
          let createDateByOrder = [];

          result['obj'].forEach(element => {
            totalOrder += element.Total;
            totalByOrder.push(element.Total);
            createDateByOrder.push(this.formatDate(element.MDate));
          });

          this.recOrdersChartData = [
            { data: totalByOrder, label: 'הזמנות אחרונות' }
          ];


          this.recOrdersChartLabels = createDateByOrder;
        }
        if (result.errdesc != null && result.errdesc.includes("No Data Found")) {

          this.customerOrders = [];
          this.recOrdersChartData = [
            { data: [0], label: 'הזמנות אחרונות' }
          ];

          this.recOrdersChartLabels = ['אין הזמנות'];
        }
      }
      else {
        // this.dialog.open(DialogComponent, {
        //   data: {message: MsgList.exitSystemAlert}
        // })
        this.sharedService.exitSystemEvent();
      }
    });

  }

  getUserStatus() {
    let objToApi = {
      Token: this.userToken
    }


    this.dataService.GetUserStatus(objToApi).subscribe(result => {

      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        this.sharedService.exitSystemEvent(result);
        return false;
      }

      // if (result['Token'] != undefined || result['Token'] != null) {
      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      // if (result.obj != null && result.obj != undefined && Object.keys(result.obj).length > 0) {


      this.statusList = [...result.obj];

      // }
      // }
      // else {
      //   // this.dialog.open(DialogComponent,{
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // });
      //   this.sharedService.exitSystemEvent();
      // }
    })
  }

  saveForm() {
    if (this.CustomerForm.valid) {

      this.saveFormSpinner = true;

      let data = this.CustomerForm.value;

      let objToApi = {
        Token: this.userToken,
        Id: this.customerData.id
      }

      Object.keys(data).forEach(key => {
        if (key == 'StatusId') {
          objToApi[key] = this.statusList.filter(status => status.StatusId == this.CustomerForm.get(key).value)[0]['StatusId']
        }
        else if (key == 'HouseNumber') {
          objToApi['Address'] = this.CustomerForm.get(key).value;
        }
        else if (key == 'BusinessFile') {
          objToApi['BusinessFile'] = this.CustomerForm.get(key).value == '' ? '/test.txt' : this.CustomerForm.get(key).value;
        }
        else if (data[key] != '' && data[key] != null && key != 'HouseNumber' && key != 'StatusId' && key != 'BusinessFile') {

          objToApi[key] = data[key].trim();
        }
      })

      //change to numeric
      // objToApi['Tz'] = +objToApi['Tz'];



      this.dataService.InsertUpdateUser(objToApi).subscribe(result => {

        this.saveFormSpinner = false;
        if (typeof result == 'string') {
          // this.dialog.open(DialogComponent, {
          //   data: { message: result }
          // })

          this.sharedService.exitSystemEvent(result);
          return false;
        }

        // if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        // if (typeof result == 'object' && result.obj != null) {

        this.msgActionButtons = 'נשמר בהצלחה';
        setTimeout(() => {
          this.msgActionButtons = '';
        }, 3000);

        this.customerData = result.obj[0];

        this.customerData.ValidateDate = result.obj[0]['businessValidDate'];

        Object.keys(result.obj[0]).forEach(el => {


          //in response we get organizationName but need OrganizationName !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
          //if organizationName will not be change, need add to statemant bellow part that add value into OrganizationName controll
          if (this.CustomerForm.get(el) != null) {
            this.CustomerForm.get(el).setValue(result.obj[0][el]);
          }
        });

        // }
        // }

        // else if (typeof result == 'string') {
        //   this.errorActionButtons = result;

        //   setTimeout(() => {
        //     this.errorActionButtons = '';
        //   }, 3000);
        // }
        // else {
        //   this.sharedService.exitSystemEvent();
        // }
      });
    }
    else {
      this.errorActionButtons = 'שגיאת אימות שדות חובה';

      setTimeout(() => {
        this.errorActionButtons = '';
      }, 2000);
    }
  }


  //it block the customer
  deleteCustomer() {

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { message: 'האם למחוק ' + this.customerData.OrganizationName + '?' }
    }).afterClosed().subscribe(response => {
      if (response.result == 'yes') {

        let objToApi = {
          Token: this.userToken,
          UserId: this.userId
        }


        this.dataService.DeleteSuspendUsers(objToApi).subscribe(result => {

          if (typeof result == 'string') {
            // this.dialog.open(DialogComponent, {
            //   data: { message: result }
            // })

            this.sharedService.exitSystemEvent(result);
            return false;
          }
          // if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          // if (result.errdesc.includes('Successfully')) {
          this.router.navigate(['/public/allCustomers']);
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          });
          // }
          // else {
          //   this.dialog.open(DialogComponent, {
          //     data: { message: result.errdesc }
          //   });
          // }
          // }
          // else {
          //   this.sharedService.exitSystemEvent();
          // }
        });
      }
    });

    // dialogRef.afterClosed().subscribe(result => {
    // 
    //   console.log(`Dialog result: ${result}`);
    // });

  }

  formatDate(dateToFormat) {
    let date = new Date(dateToFormat.toString());
    let day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay();
    let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    let year = date.getFullYear();
    return day + '/' + month + '/' + year;
  }

  goToOrderCards(cardId, customerId) {
    //[routerLink]="['/public/orderCards',0,customerData.id]"

    let Card = {
      cardId: cardId,
      customerId: customerId
    }

    this.urlSharingService.changeMessage(JSON.stringify(Card));
    this.router.navigate(['/public/orderCards']);
  }

  goToAlOrdersByCustomer(customerName) {
    let Customer = {
      customerName: customerName
    }

    this.urlSharingService.changeMessage(JSON.stringify(Customer));
    this.router.navigate(['/public/allOrders']);
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  openDialog() {

  }
  ngOnDestroy() {
    // this.idUnsubscribe.unsubscribe();
  }

}
