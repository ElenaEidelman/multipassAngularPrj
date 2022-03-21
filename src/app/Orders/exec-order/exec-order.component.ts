import { Route } from '@angular/compiler/src/core';
import { typeWithParameters } from '@angular/compiler/src/render3/util';
import { Component, EventEmitter, Inject, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChildren, ViewEncapsulation } from '@angular/core';
import { tick } from '@angular/core/testing';
import { ControlContainer, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Data, Router, RouterModule } from '@angular/router';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { Workbook } from 'exceljs';
import * as moment from 'moment';
import { resourceUsage } from 'process';
import { element } from 'protractor';
import { elementAt } from 'rxjs/operators';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent, DialogData } from 'src/app/PopUps/dialog/dialog.component';

import { AlertMessage } from 'src/assets/alertMessage';
import * as fs from 'file-saver';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { MockData } from 'src/app/Classes/mockData';

@Component({
  selector: 'app-exec-order',
  templateUrl: './exec-order.component.html',
  styleUrls: ['./exec-order.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('openClose', [
      state('true', style({
        overflow: 'hidden',
        height: '*'
      })),
      state('false', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
      })),
      transition('false <=> true', animate('600ms ease-in-out'))
    ])
  ]
})


export class ExecOrderComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChildren('orderLinesChildren') orderLinesChildren;
  faFileExcel = faFileExcel;
  MsgList = MsgList;
  MockData = MockData;



  // OrderData;

  constructor(
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private router: Router,
    private dialog: MatDialog,
    private urlSharingService: UrlSharingService,
    private activatedRoute: ActivatedRoute) {
  }

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }

  insertOrderLineSpinner: boolean = false;
  createCardsSpinner: boolean = false;
  deleteCardsSpinner: boolean = false;
  orderFromExcel: boolean = false;
  additionalOptionsSMS: boolean = false;




  errorMsg: string = '';
  orderMsg: string = '';
  orderMsgDelete: string = '';
  errorMsgDelete: string = '';
  addOrderLineErrMsg: string = '';
  orderRefMsg: string = '';
  errorRefMsg: string = '';
  errorSendSms: string = '';
  infoMsg: string = '';
  descriptionStatusInjected: string = '';

  newCustomer = {}; //set all parameters to lowerCase

  chagesToServer = [];
  DigitalBatch;
  orderCardsData;

  manualOrder: boolean = false;
  excelOrder: boolean = false;
  minOrderDate = new Date();


  minDate: any;
  maxDate: any;


  orderIdToPreview;

  orderStatus = {
    id: '',
    description: ''
  }

  newOrder: boolean = false;
  saveChangesSpinner: boolean = false;
  //translate customer data value to hebrew
  CustomerLangObj = [
    { value: 'organizationname', viewValue: 'חברה' },
    { value: 'fname', viewValue: 'שם' },
    { value: 'lname', viewValue: 'שם משפחה' },
    { value: 'tz', viewValue: 'ח.פ' },
    { value: 'email', viewValue: 'מייל' },
    { value: 'phone', viewValue: 'טלפון' },
    { value: 'phone1', viewValue: 'טלפון נוסף' }
  ];

  statusListArr;
  Customer;


  sendSmsGroup = this.fb.group({
    smsTemplates: ['', Validators.required],
    previewSmsTemplate: ['', Validators.required]
  });

  smsTemplatesData = [];

  //orderDetail must contain one row with empty data
  orderDetails = [
    { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
  ];

  displayedColumnsOrderDetails = ['id', 'QTY', 'LoadSum', 'ValidationDate', 'TotalForItem', 'additionalColumn'];

  orderDetailsUpdateForm = this.fb.group({});

  columnsHeb = {
    'id': "מס''ד",
    'QTY': 'כמות כרטיסים	',
    'LoadSum': 'סכום טעינה',
    'ValidationDate': 'תוקף',
    'TotalForItem': "סה''כ סכום טעינה",
  }

  Orders: MatTableDataSource<any>;

  dataByPage;

  orderId;
  customerId;
  idUnsubscribe;

  alertMessage: string = '';

  sendSuccess: boolean = false;
  noInfoView: boolean;
  viewAddToExecOrderForm: boolean = true;

  totalTicketCount: number = 0;
  totalOrderSum: number = 0;

  userToken: string;
  orderDetailsTable;

  date: any;


  //for additional empty row foraddToExecOrderForm
  addToExecOrderForm = this.fb.group({
    ticketCount: ['', [Validators.required, Validators.min(1)]],
    chargeAmount: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
    validity: [this.getLastDateOfCurrentMonthAnd5Years(), Validators.required],
    TotalForItem: [{ value: '', disabled: true }]
  });

  //מספר אסמכתה
  RefControl = new FormControl('', Validators.required);

  OrderNameGroup = this.fb.group({
    Comments: ['', [Validators.required, this.noWhitespaceValidator]]
  });
  Comments = new FormControl(['', Validators.required]);

  ngOnInit() {
    window.scroll(0, 0);
    let url = this.router.url;
    this.userToken = JSON.parse(localStorage.getItem('user')).Token;

    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));
    this.sharedService.pagesAccessLevel.next('');

    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.sendSmsGroup.disable();
      this.addToExecOrderForm.disable();
      this.RefControl.disable();
      this.OrderNameGroup.disable();
      //Comments
      //OrderNameGroup
      //RefControl

    }


    this.orderDetails = [
      { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
    ];
    this.getStatusList();
    this.getSmsTemplates();


    //this code need when i will change url
    let urlParams = this.urlSharingService.messageSource.getValue();

    if (urlParams == '') {
      this.router.navigate(['/public/home']);
    }
    else {
      // this.idUnsubscribe = this.activeRoute.params.subscribe(param => {
      this.urlSharingService.changeMessage('');

      let t = urlParams;


      //manual order
      if (url.includes('order')) {
        this.orderId = JSON.parse(urlParams)['orderId'];
        this.customerId = JSON.parse(urlParams)['customerId'];
        this.newOrder = false;

        this.GetOrderDetails();
      }

      //new order
      if (url.includes('newOrder')) {

        this.orderStatus.description = 'הזמנה חדשה';
        this.customerId = JSON.parse(urlParams)['customerId'];
        this.newOrder = true;

        //set comments to field

        this.OrderNameGroup.get('Comments').setValue(JSON.parse(urlParams)['orderDescription']);

        let objToApi = {
          Token: this.userToken,
          CustomerId: this.customerId
        }

        this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {

          if (typeof result == 'string') {
            this.dialog.open(DialogComponent, {
              data: { message: result }
            })

            this.sharedService.exitSystemEvent();
            return false;
          }

          // if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          // if (typeof result == 'object' && result.obj != null) {
          this.Customer = result.obj[0];

          //set all parameters of customer to lowercase
          Object.keys(this.Customer).forEach(element => {
            this.newCustomer[element.toLowerCase()] = this.Customer[element]
          });

          this.dataByPage = result.obj[0];




          //if order created from excel file
          this.excelOrder = (this.dataByPage.DigitalBatch > 0 || this.dataByPage.DigitalBatch != 0) && this.dataByPage.DigitalBatch != null;
          // }
          // if (result.Token == null && result.errdesc != null && result.errdesc != '') {
          //   this.dialog.open(DialogComponent, {
          //     data: { message: result.errdesc }
          //   });
          // }
          // }
          // else {
          //   // this.dialog.open(DialogComponent, {
          //   //   data: {message: MsgList.exitSystemAlert}
          //   // })
          //   this.sharedService.exitSystemEvent();
          // }
        });

        let orderDetails = [{ id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }];
        this.orderDetailsTable = new MatTableDataSource(orderDetails);
      }
      // })
      this.GetCards();


      // this.RefControl.setValue(this.orderId);
      this.totalData();
    }
  }

  // getCalendarFilter() {
  //   let lastDateOfMonth = this.addToExecOrderForm.get('validity').value;//last day of current month
  //   let fiveYFromCurrDate = new Date(lastDateOfMonth.getFullYear() + 5, lastDateOfMonth.getMonth(), lastDateOfMonth.getDate());
  //   // const currentYear = new Date().getFullYear();

  //   const day = lastDateOfMonth.getDate();
  //   const month = lastDateOfMonth.getMonth();
  //   const year = lastDateOfMonth.getFullYear();



  //   const Fday = fiveYFromCurrDate.getDate();
  //   const Fmonth = fiveYFromCurrDate.getMonth();
  //   const Fyear = fiveYFromCurrDate.getFullYear();

  //   this.minDate = new Date(year, month, day);
  //   this.maxDate = new Date(Fyear, +Fmonth, +Fday);
  // }

  GetOrderDetails() {
    let objToApi = {
      Token: this.userToken,
      CoreOrderID: this.orderId
    }
    this.dataService.GetOrderDetails(objToApi).subscribe(result => {
      if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        })

        this.sharedService.exitSystemEvent();
        return false;
      }

      // if (result['Token'] != undefined || result['Token'] != null) {

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      // if (typeof result == 'object' && result.obj != null) {
      this.orderIdToPreview = result.obj[0].idex;


      let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].StatusId);
      this.orderStatus.id = statusData[0].StatusId;
      this.orderStatus.description = statusData[0].Description;

      this.dataByPage = result['obj'][0];



      this.OrderNameGroup.get('Comments').setValue(result['obj'][0]['OrderName']);


      //if order created from excel file
      this.excelOrder = (this.dataByPage.DigitalBatch > 0 || this.dataByPage.DigitalBatch != 0) && this.dataByPage.DigitalBatch != null;

      this.RefControl.setValue(this.dataByPage.CrmOrderId);//Reference

      //get customer data
      this.Customer = result['obj'][0]['User'];
      //set all parameters of customer to lowercase
      Object.keys(this.Customer).forEach(element => {
        this.newCustomer[element.toLowerCase()] = this.Customer[element]
      });

      this.Orders = new MatTableDataSource(result['obj'][0]['Lines']);
      this.orderDetails = [];
      this.Orders.data.forEach((element, index) => {
        this.orderDetails.push(element);
      });
      this.orderDetails.push({ id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 })

      this.orderDetailsTable = new MatTableDataSource(this.orderDetails);
      this.totalData();

      // }
      // if (result.obj == null && result.errdesc != null && result.errdesc != '') {
      //   this.dialog.open(DialogComponent, {
      //     data: { message: result.errdesc }
      //   });
      // }

      // }
      // else if (typeof result == 'string') {
      //   this.dialog.open(DialogComponent, {
      //     data: { message: result }
      //   });
      // }
      // else {
      //   // this.dialog.open(DialogComponent, {
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // })
      //   this.sharedService.exitSystemEvent();
      // }

    })
  }

  getLastDateOfCurrentMonthAnd5Years() {
    let date = new Date();
    let lastDay = new Date(date.getFullYear() + 5, date.getMonth() + 1, 0, 23, 59, 59);
    return lastDay;
  }

  getStatusList() {
    //api/Orders/GetOrdersStatus
    //Token

    let objToApi = {
      Token: this.userToken
    }



    this.dataService.GetOrdersStatus(objToApi).subscribe(result => {
      if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        })

        this.sharedService.exitSystemEvent();
        return false;
      }
      // if (result['Token'] != undefined || result['Token'] != null) {

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];
      // if (typeof result == 'object' && result.obj != null) {

      this.statusListArr = [...result.obj];
      // }
      // }
      // else {
      //   // this.dialog.open(DialogComponent, {
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // })
      //   this.sharedService.exitSystemEvent();
      // }
    });


  }


  totalData() {
    this.totalTicketCount = 0;
    this.totalOrderSum = 0;
    //

    this.orderDetails.forEach(el => {
      this.totalTicketCount += el.QTY;
      this.totalOrderSum += el.TotalForItem;
    }
    )
  }

  sendMessageToCustomer() {
    this.alertMessage = AlertMessage.sendSuccessfully;
    this.sendSuccess = true;
    setTimeout(() => {
      this.alertMessage = '';
      this.sendSuccess = false;
    }, 3000);
  }

  deleteRow(element, row) {

    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      let date = element.ValidationDate.split('/');
      let dateForApi = date[1] + '-' + date[0] + '-' + date[2];
      //format date for api by mm/dd/yy

      let objToApi = {
        Token: this.userToken,
        OrderId: this.orderId.toString(),
        UserID: this.customerId,
        ChargeAmount: element.LoadSum,
        Validity: dateForApi,
        OpCode: "delete"
      }


      //show spinner of order line by id
      this.orderLinesChildren._results.forEach(el => {
        let spinner = (el.nativeElement.children['spinnerDelete' + element.id] as HTMLBodyElement);
        if (spinner != undefined) {
          (el.nativeElement.children['spinnerDelete' + element.id] as HTMLBodyElement).classList.remove('disableSpinner');
          (el.nativeElement.children['spinnerDelete' + element.id] as HTMLBodyElement).classList.add('enableSpinner');
        }
      })

      this.dataService.InsertUpdateLines(objToApi).subscribe(result => {
        if (typeof result == 'string') {
          this.dialog.open(DialogComponent, {
            data: { message: result }
          })

          this.sharedService.exitSystemEvent();
          return false;
        }
        // if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        this.orderDetails = [
          { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
        ];
        if (result['obj'][0]['Lines'].length > 0) {
          this.orderDetails.unshift(...result['obj'][0]['Lines']);
        }

        // let filteringObj = this.orderDetails.filter((el, indexRow) => {
        //    return indexRow != row;
        // });
        this.orderDetailsTable.data = this.orderDetails;
        this.totalData();
        // this.orderDetails = filteringObj;
        // }
        // else {
        //   // this.dialog.open(DialogComponent, {
        //   //   data: {message: MsgList.exitSystemAlert}
        //   // })
        //   this.sharedService.exitSystemEvent();
        // }
      });
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: this.MsgList.readOnly }
      })
    }
  }
  addOrderLine() {
    if (this.newOrder || !this.excelOrder) {
      if (this.addToExecOrderForm.valid) {
        this.insertOrderLineSpinner = true;
        let ticketCount = +this.addToExecOrderForm.get('ticketCount').value;
        let chargeAmount = +this.addToExecOrderForm.get('chargeAmount').value;
        let validity = new Date(this.addToExecOrderForm.get('validity').value);
        validity.setHours(23, 59, 59)
        // let validityFormating = (new Date(validity).getDate() < 10 ? '0' + new Date(validity).getDate() : new Date(validity).getDate()) + '/' + ((new Date(validity).getMonth() + 1) < 10 ? '0' + (new Date(validity).getMonth() + 1) : new Date(validity).getMonth() + 1) + '/' + new Date(validity).getFullYear();
        this.addToExecOrderForm.get('TotalForItem').setValue(ticketCount * chargeAmount);
        // let TotalForItem = +this.addToExecOrderForm.get('TotalForItem').value;


        let objToApi = {
          Token: this.userToken,
          UserId: this.customerId,
          ChargeAmount: chargeAmount,
          TicketCount: ticketCount,
          Validity: validity,
          OpCode: "insert",
          OrderName: this.OrderNameGroup.get('Comments').value,
          Reference: this.RefControl.value == '' ? 0 : this.RefControl.value
        }
        //query for insert update order lines, but not for the first line
        if (this.orderDetailsTable.data.length > 1) {

          objToApi['OrderId'] = this.orderId;
          // 

          this.dataService.InsertUpdateLines(objToApi).subscribe(result => {
            if (typeof result == 'string') {
              this.dialog.open(DialogComponent, {
                data: { message: result }
              })

              this.sharedService.exitSystemEvent();
              return false;
            }

            // 
            this.insertOrderLineSpinner = false;
            this.addToExecOrderForm.get('validity').setValue(this.getLastDateOfCurrentMonthAnd5Years());
            // 
            // if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            // if (result['obj'] != undefined) {

            this.orderDetails = [
              { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
            ];


            this.orderDetails.unshift(...result['obj'][0]['Lines']);
            this.orderDetailsTable = new MatTableDataSource(this.orderDetails);

            //calculate new total dat
            this.totalData();


            //set status data
            let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].OrderStatus);
            this.orderStatus.id = statusData[0].OrderStatus != undefined ? statusData[0].OrderStatus : statusData[0].StatusId;
            // 
            this.orderStatus.description = statusData[0].Description;
            // }
            // }
            // else {
            //   // this.dialog.open(DialogComponent, {
            //   //   data: {message: MsgList.exitSystemAlert}
            //   // })
            //   this.sharedService.exitSystemEvent();
            // }
          });
        }

        //insert first line, create new order
        else {


          this.dataService.InsertUpdateOrder(objToApi).subscribe(result => {
            if (typeof result == 'string') {
              this.dialog.open(DialogComponent, {
                data: { message: result }
              })

              this.sharedService.exitSystemEvent();
              return false;
            }


            this.addToExecOrderForm.get('validity').setValue(this.getLastDateOfCurrentMonthAnd5Years());
            // if (result['Token'] != undefined || result['Token'] != null) {
            this.insertOrderLineSpinner = false;

            if (result['obj'][0]['Lines'].length > 0) {
              this.orderDetails = [
                { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
              ];

              this.dataByPage['MDate'] = new Date();

              this.orderIdToPreview = result.obj[0].idex;


              this.orderDetails.unshift(result['obj'][0]['Lines'][0]);
              // 
              this.orderDetailsTable = new MatTableDataSource(this.orderDetails);


              //after created new order, set order id
              this.orderId = result['obj'][0]['orderid'];

              //calculate new total dat
              this.totalData();

              //set status data
              let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].OrderStatus);
              this.orderStatus.id = statusData[0].StatusId;
              this.orderStatus.description = statusData[0].Description;

            }
            // }
            // else {
            //   // this.dialog.open(DialogComponent, {
            //   //   data: {message: MsgList.exitSystemAlert}
            //   // })
            //   this.sharedService.exitSystemEvent();
            // }
          });
        }

        //reset form
        this.viewAddToExecOrderForm = false;
        setTimeout(() => {
          this.addToExecOrderForm.reset();
          this.addToExecOrderForm.get('validity').setValue(new Date(new Date().setDate(new Date().getDate() + 1)));
          this.viewAddToExecOrderForm = true;
        }, 0);

      }
      else {
        this.addOrderLineErrMsg = 'נא למלא את כל השדות';

        setTimeout(() => {
          this.addOrderLineErrMsg = '';
        }, 3000);
      }
    }

    //not new order
    else {
      this.dialog.open(DialogComponent, {
        data: { message: 'not new order' }
      })
    }
  }

  ApproveOrder(element) {

    let buttonClicked = element.currentTarget;
    if (this.orderDetails.length > 1 && this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {


      if (this.RefControl.value == 0 || this.RefControl.value == '') {
        this.infoMsg = this.MsgList.referenceRequired;
        setTimeout(() => {
          this.infoMsg = '';
        }, 2000)

        return false;
      }

      if (!this.OrderNameGroup.valid) {
        this.OrderNameGroup.markAllAsTouched();
        return false;
      }


      let objToApiChanges = {
        Token: this.userToken,
        UserID: this.customerId,
        OrderID: this.orderId,
        OpCode: "Save",
        Reference: this.RefControl.value == '' ? 0 : this.RefControl.value,
        OrderName: this.OrderNameGroup.get('Comments').value.trim()
      }

      //first save reference and comments
      this.createCardsSpinner = true;
      this.dataService.InsertUpdateOrder(objToApiChanges).subscribe(result => {
        this.createCardsSpinner = false;
        if (typeof result == 'string') {
          this.dialog.open(DialogComponent, {
            data: { message: result }
          })

          this.sharedService.exitSystemEvent();
          return false;
        }
        // if (result['Token'] != undefined || result['Token'] != null) {

        // if (result.err != -1) {
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        buttonClicked.disabled = true;
        this.createCardsSpinner = true;
        this.descriptionStatusInjected = 'בייצור'
        this.infoMsg = `
            פעולה יכולה לקחת כמה דקות
            </br>
            נא להמתין ליצירת הכרטיסים
            `;

        let objToApi = {
          Token: this.userToken,
          OrderId: this.orderId.toString(),
          UserID: this.customerId
        }

        //alert('before approve');
        this.dataService.ApproveOrder(objToApi).subscribe(result => {
          //alert('after approve');


          this.descriptionStatusInjected = '';
          buttonClicked.disabled = false;
          this.createCardsSpinner = false;
          this.infoMsg = '';

          if (typeof result == 'string') {
            this.dialog.open(DialogComponent, {
              data: { message: result }
            })

            this.sharedService.exitSystemEvent();
            return false;
          }
          // if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          // if (result.err != -1) {
          localStorage.setItem('createOrderByExcel', '');
          this.infoMsg = 'הזמנה נקלטה בהצלחה';

          setTimeout(() => {
            this.infoMsg = '';
            // this.router.navigate(['/public/order/', result.obj[0]['orderid'], this.customerId]);

            this.goToOrder(result.obj[0]['orderid'], this.customerId);
            // this.ngOnInit();
          }, 2000);

          // }
          // if (result.obj == null) {
          //   alert('order already created => orderId: ' + this.orderId);
          // }
          // else {
          //   this.errorMsg = result.errdesc;

          //   setTimeout(() => {
          //     this.errorMsg = '';
          //   }, 3000)
          // }
          // }
          // else {
          //   // this.dialog.open(DialogComponent, {
          //   //   data: {message: MsgList.exitSystemAlert}
          //   // })
          //   this.sharedService.exitSystemEvent();
          // }
        })


        // }
        // else {
        //   this.dialog.open(DialogComponent, {
        //     data: { message: result.errdesc }
        //   })
        // }

        // }
        // else {
        //   this.dialog.open(DialogComponent, {
        //     data: { message: result.errdesc }
        //   })
        //   this.sharedService.exitSystemEvent();
        // }
      })
    }
    else {
      this.errorMsg = 'נא ליצור לפחות הזמנה אחת';

      setTimeout(() => {
        this.errorMsg = '';
      }, 3000)
    }
  }



  deleteOrder() {

    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {

      this.dialog.open(DialogConfirmComponent, {
        data: { message: 'האם למחוק הזמנה מספר: ' + ' ' + this.orderIdToPreview }
      }).afterClosed().subscribe(response => {
        if (response.result == 'yes') {

          let objToApi = {
            Token: this.userToken,
            OrderId: this.orderId,
            UserID: this.customerId,
            OpCode: "delete"
          }

          this.createCardsSpinner = true;

          this.dataService.DeleteVoidOrder(objToApi).subscribe(result => {
            this.createCardsSpinner = false;

            if (typeof result == 'string') {
              this.dialog.open(DialogComponent, {
                data: { message: result }
              })

              this.sharedService.exitSystemEvent();
              return false;
            }

            // if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            // if (typeof result == 'object' && result.obj != null && Object.values(result.obj[0]).includes('Order is deleted Successfully')) {
            // this.infoMsg = 'ההזמנה נמחקה בהצלחה';
            // setTimeout(() => {
            //   this.infoMsg = '';
            //   this.router.navigate(['/public/allOrders']);
            // }, 2000);
            // }
            // if (result.err != -1) {
            this.infoMsg = 'בוטל בהצלחה';
            setTimeout(() => {
              this.infoMsg = '';
              this.router.navigate(['/public/allOrders']);
            }, 2000);
            // }
            // else {
            //   this.dialog.open(DialogComponent, {
            //     data: { message: result.errdesc }
            //   });
            // }
            // }
            // else if (typeof result == 'string') {
            //   this.errorMsg = result;
            //   setTimeout(() => {
            //     this.errorMsg = '';
            //   }, 2000);
            // }
            // else {
            //   // this.dialog.open(DialogComponent, {
            //   //   data: {message: MsgList.exitSystemAlert}
            //   // })
            //   this.sharedService.exitSystemEvent();
            // }
          });
        }
      })
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: this.MsgList.readOnly }
      })
    }
  }

  calculateTotalCharge() {
    let ticketCount = this.addToExecOrderForm.get('ticketCount').value;
    let chargeAmount = this.addToExecOrderForm.get('chargeAmount').value;

    this.addToExecOrderForm.get('TotalForItem').setValue(ticketCount * chargeAmount);
    //
  }

  returnHebTranslation(value) {
    return this.CustomerLangObj.filter(el => el.value == value)[0].viewValue;
  }

  saveChanges() {


    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {

      if (this.OrderNameGroup.valid && this.RefControl.value.toString() != '') {


        if (this.RefControl.value == 0) {

          this.errorMsg = this.MsgList.referenceRequired
          setTimeout(() => {
            this.errorMsg = '';

          }, 2000);
          return false;
        }
        this.createCardsSpinner = true;

        let objToApi = {
          Token: this.userToken,
          UserID: this.customerId,
          OrderID: this.orderId,
          OpCode: "Save",
          Reference: this.RefControl.value,
          OrderName: this.OrderNameGroup.get('Comments').value.trim()
        }

        this.chagesToServer = [];



        //alert('before save changes');
        debugger
        this.dataService.InsertUpdateOrder(objToApi).subscribe(result => {
          debugger
          // alert('after save changes');


          this.createCardsSpinner = false;
          if (typeof result == 'string') {
            this.dialog.open(DialogComponent, {
              data: { message: result }
            })

            this.sharedService.exitSystemEvent();
            return false;
          }
          // if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          // if (result.err != -1) {
          // this.orderRefMsg = 'שינויים נשמרו בהצלחה';
          this.infoMsg = 'שינויים נשמרו בהצלחה';
          this.GetOrderDetails();
          setTimeout(() => {
            this.infoMsg = '';
          }, 2000);
          // }
          // else {
          //   this.dialog.open(DialogComponent, {
          //     data: { message: 'אנא מלא תחילה את פרטי ההזמנה' }
          //   })
          // }
          // }
          // else {
          //   // this.dialog.open(DialogComponent, {
          //   //   data: {message: MsgList.exitSystemAlert}
          //   // })
          //   this.sharedService.exitSystemEvent();
          // }
        });
      }
      else {
        this.errorMsg = this.MsgList.fillAllFieldsError;
        setTimeout(() => this.errorMsg = '', 2000);
        this.OrderNameGroup.markAllAsTouched();

      }
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: this.MsgList.readOnly }
      })
    }

  }

  changeDateOfRow(element, controlName) {
    // // 
    // let t = element.ValidationDate;


    this.dialog.open(DatePickerDialog, {
      data: {
        date: element.ValidationDate,
        element: element,
        control: controlName
      }
    }).afterClosed().subscribe(dialogResult => {


      if (new Date(dialogResult.result.date) < new Date()) {
        this.dialog.open(DialogComponent, {
          data: { message: MsgList.wrongDate }
        })
      }
      else {
        let validityDate = new Date(dialogResult.result.date);
        validityDate.setHours(23, 59, 59);
        let objToApi = {
          Token: this.userToken,
          OrderId: this.orderId,
          UserID: this.customerId,
          OpCode: "update",
          Validity: validityDate,
          ChargeAmount: element.LoadSum,
          TicketCount: element.QTY
        }

        this.dataService.InsertUpdateLines(objToApi).subscribe(result => {
          if (typeof result == 'string') {
            this.dialog.open(DialogComponent, {
              data: { message: result }
            })

            this.sharedService.exitSystemEvent();
            return false;
          }
          // if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          // if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
          this.dialog.open(DialogComponent, {
            data: { message: 'נשמר בהצלחה' }
          })

          this.orderDetails = [
            { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
          ];

          this.Orders = new MatTableDataSource(result['obj'][0]['Lines']);
          this.Orders.data.forEach((element, index) => {
            this.orderDetails.unshift(element);
          });

          this.orderDetailsTable = new MatTableDataSource(this.orderDetails);
          this.totalData();
          // }
          // }
          // else {
          //   // this.dialog.open(DialogComponent, {
          //   //   data: {message: MsgList.exitSystemAlert}
          //   // })
          //   this.sharedService.exitSystemEvent();
          // }
        })
      }
    });
  }




  getSmsTemplates() {

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetSMSFormats(objToApi).subscribe(result => {
      if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        })

        this.sharedService.exitSystemEvent();
        return false;
      }

      // if (result['Token'] != undefined || result['Token'] != null) {

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      // if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
      this.smsTemplatesData = [...result.obj];
      // }
      // }
      // else {
      //   // this.dialog.open(DialogComponent, {
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // })
      //   this.sharedService.exitSystemEvent();
      // }
    });
  }

  sendSMS() {


    if (this.sendSmsGroup.valid) {
      this.dialog.open(DialogConfirmComponent, {
        data: { message: 'האם לשלוח SMS?', eventButton: 'שלח' }
      }).afterClosed().subscribe(result => {

        if (result.result == 'yes') {
          if (this.orderCardsData.length > 0) {
            let selectedCards = [];
            this.orderCardsData.forEach(card => {
              selectedCards.push(card.Id)
            });

            let objToApi = {
              Token: this.userToken,
              TemplateId: this.sendSmsGroup.get('smsTemplates').value,
              UserId: this.customerId,
              OrderLineIds: selectedCards,
              CoreOrderId: this.orderId,
              From: this.smsTemplatesData.filter(el => el.Id == this.sendSmsGroup.get('smsTemplates').value)[0]['SenderName']
            }

            this.dataService.SendSMSByOrderLine(objToApi).subscribe(result => {
              if (typeof result == 'string') {
                this.dialog.open(DialogComponent, {
                  data: { message: result }
                })

                this.sharedService.exitSystemEvent();
                return false;
              }
              // if (result['Token'] != undefined || result['Token'] != null) {

              //set new token
              let tempObjUser = JSON.parse(localStorage.getItem('user'));
              tempObjUser['Token'] = result['Token'];
              localStorage.setItem('user', JSON.stringify(tempObjUser));
              this.userToken = result['Token'];

              // if (result.errdesc == 'OK') {

              this.dialog.open(DialogComponent, {
                data: { title: '', message: 'ההודעות נשלחות ברקע', subTitle: ' ההודעה נשלחה ל ' + this.orderCardsData.length + ' נמענים ' }
              })

              this.sendSmsGroup.reset();
              this.openSendSmsBlock();
              // }
              // else {
              //   this.dialog.open(DialogComponent, {
              //     data: { message: result.errdesc }
              //   });
              // }
              // }
              // else {
              //   this.dialog.open(DialogComponent, {
              //     data: { message: result.errdesc }
              //   })
              //   this.sharedService.exitSystemEvent();
              // }
            });

          }
        }
      })
    }
    else {
      this.errorSendSms = 'נא לבחור תבנית ההודעה';
      setTimeout(() => {
        this.errorSendSms = '';
      }, 2000)
    }
  }

  //enable/disable send sms button
  smsTempleteSelect(event) {
    if (event.value != undefined) {

      // this.smsTemplatesData;
      this.sendSmsGroup.get('previewSmsTemplate').setValue(this.smsTemplatesData.filter(el => el.Id == event.value)[0]['TemplateFormat']);
      //enable send sms button
      // this.sendButtonSms = false;
    }
  }

  GetCards() {

    let objToAPI = {
      Token: this.userToken,
      OrderId: this.orderId,
      userId: this.customerId
    }




    this.dataService.GetCardsByOrderId(objToAPI).subscribe(result => {

      if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        })

        this.sharedService.exitSystemEvent();
        return false;
      }
      // if (result['Token'] != undefined || result['Token'] != null) {

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      // if (typeof result == 'object') {
      this.orderCardsData = result['obj'][0];
      this.DigitalBatch = result['obj'][1];


      // }
      // else {
      //   this.dialog.open(DialogComponent, {
      //     data: { message: result }
      //   })
      // }
      // }
      // else {
      //   // this.dialog.open(DialogComponent, {
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // })
      //   this.sharedService.exitSystemEvent();
      // }
    });
  }


  openSendSmsBlock() {

    this.additionalOptionsSMS = !this.additionalOptionsSMS;
  }

  excelFileExport() {

    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      let tableLabels = [
        { value: 'ItemId', viewValue: "מס''ד" },
        { value: 'CardId', viewValue: 'קוד דיגיטלי' },
        { value: 'DSendName', viewValue: 'שם נמען' },
        { value: 'DSendPhone', viewValue: 'מספר נייד נמען	' },
        { value: 'LoadSum', viewValue: 'סכום טעינה ראשוני		' },
        { value: 'ValidationDate', viewValue: '	תוקף	' },
        { value: 'KindOfLoadSumDesc', viewValue: 'סוג שובר טעינה	' },
        { value: 'DSendLastSent', viewValue: 'נשלח לאחרונה' }
      ];

      //add another column to file if order created from excel file
      if (this.DigitalBatch != '' && this.DigitalBatch != undefined) {
        tableLabels.push({ value: 'ValidationField', viewValue: 'שדה אימות' })
      }

      let tableData = JSON.parse(JSON.stringify(this.orderCardsData));

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('ProductSheet');

      var worksheetArr = [];
      tableLabels.forEach(label => {
        worksheetArr.push({ header: label.viewValue, key: label.value, width: 20 });
      });

      worksheet.columns = worksheetArr;

      for (let data of Object.values(tableData)) {
        for (let element of Object.keys(data)) {
          if (element == 'CardId') {
            let oldData = data[element];
            data[element] = oldData + '' + data['PinCode']
          }
        }
      }
      worksheet.addRows(tableData, "n");
      let userData = JSON.parse(localStorage.getItem('user')).obj;
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, userData['Fname'] + '_' + userData['Lname'] + '_' + this.orderId + '.xlsx');
      })
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: this.MsgList.readOnly }
      })
    }
  }

  goToOrderLines(orderId, customerId) {
    let OrderLine = {
      orderId: orderId,
      customerId: customerId
    }

    this.urlSharingService.changeMessage(JSON.stringify(OrderLine));
    this.router.navigate(['/public/orderLines']);
  }

  goToOrder(orderId: number, customerId: number) {
    let Order = {
      orderId: orderId,
      customerId: customerId
    }
    this.urlSharingService.changeMessage(JSON.stringify(Order));

    if (this.router.url.includes('order')) {
      this.ngOnInit();
    }
    else if (this.router.url.includes('newOrder')) {
      this.router.navigate(['/public/order']);
    }
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnDestroy() {
    // this.idUnsubscribe.unsubscribe();
  }
}


//dialog

export interface DatePickerDialogData {
  date: '',
  element: '',
  control: ''
}

@Component({
  selector: 'dialog-datePicker',
  templateUrl: './datePickerDialog.html',
  styleUrls: ['./datePickerStyle.css'],
})
export class DatePickerDialog implements OnInit {
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DatePickerDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DatePickerDialogData,
    private route: Router
  ) {
    // this.setCalendarFilter();
  }

  validity = new FormControl()
  minOrderDate = new Date();


  ngOnInit(): void {

    this.validity.setValue(this.validityChangeFormat());//new Date
  }

  validityChangeFormat() {

    let date = this.data.date.split('/');
    let year = date[2];
    let month = date[0];
    let day = date[1];

    return new Date(day + '/' + month + '/' + year + ' 23:59:59');
  }

  dialogClose() {
    this.dialogRef.close();
  }

  select() {

    this.dialogRef.close({
      result: {
        date: this.validity.value,
        element: this.data.element,
        control: this.data.control
      },
    });
  }
}
