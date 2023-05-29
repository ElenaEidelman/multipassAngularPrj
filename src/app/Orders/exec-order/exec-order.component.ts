import { Route } from '@angular/compiler/src/core';
import { typeWithParameters } from '@angular/compiler/src/render3/util';
import { Component, EventEmitter, Inject, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChildren, ViewEncapsulation } from '@angular/core';
import { tick } from '@angular/core/testing';
import { AbstractControl, ControlContainer, FormBuilder, FormControl, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
import { OrderType } from 'src/app/Classes/OrderTypes';
import { ErrorStateMatcher } from '@angular/material/core';
import { TableDialogComponent } from 'src/app/PopUps/GlobalTableDialog/table-dialog/table-dialog.component';



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
  @ViewChildren('orderLinesChildren2') orderLinesChildren2; // for order of loading vouchers manually
  faFileExcel = faFileExcel;
  MsgList = MsgList;
  MockData = MockData;
  dateChanging: boolean = false;
  orderType;
  OrderType = OrderType;

  LoadingVoucherByExcelHavePhoneNumber: boolean = false;




  //titles
  OrderSummaryTitle: string = ''; //סיכום הזמנה דיגיטלית
  GoToOrderLinesTitle: string = '';

  // cardFromNotBelongsError: string = "";
  // cardToNotBelongsError: string = "";


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
  insertOrderLineSpinner2: boolean = false;
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

  TotalForOrderLine: number = 0;
  CardsCountForOrderLine: number = 0;


  fromCrdWrongValue: boolean = true;

  newCustomer = {}; //set all parameters to lowerCase

  chagesToServer = [];
  DigitalBatch;
  orderCardsData;
  policyList = [];
  supplierGroups = [];

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

  orderDetailsVoucherManually = [
    { FromCard: '', ToCard: '', LoadSum: 0, ValidationDate: '', TotalForItem: 0, QTY: 0 }
  ];

  displayedColumnsOrderDetails = ['id', 'QTY', 'LoadSum', 'ValidationDate', 'TotalForItem', 'additionalColumn'];
  displayedColumnsOrderDetailsVouchersManually = ['FromCard', 'ToCard', 'LoadSum', 'ValidationDate', 'TotalForItem', 'QTY', 'additionalColumn'];

  //orderDetailsUpdateForm = this.fb.group({});

  columnsHeb = {
    'id': "מס''ד",
    'QTY': 'כמות כרטיסים	',
    'LoadSum': 'סכום טעינה',
    'ValidationDate': 'תוקף',
    'TotalForItem': "סה''כ סכום טעינה",
  }

  columnsHebVouchersManually = {
    'FromCard': 'מכרטיס',
    'ToCard': 'עד כרטיס',
    'LoadSum': 'סכום טעינה',
    'ValidationDate': 'תוקף',
    'TotalForItem': 'סה"כ סכום טעינה',
    'QTY': 'כמות כרטיסים'
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
  viewAddToExecOrderForm2: boolean = true;
  viewManuallyVouchersForm: boolean = true;
  IsB2COrder: boolean = false;


  totalTicketCount: number = 0;
  totalOrderSum: number = 0;

  userToken: string;
  orderDetailsTable;
  orderDetailsVouchersManuallyTable = new MatTableDataSource();

  date: any;


  //for additional empty row foraddToExecOrderForm
  addToExecOrderForm = this.fb.group({
    ticketCount: ['', [Validators.required, Validators.min(1)]],
    chargeAmount: ['', [Validators.required]],
    validity: [this.getLastDateOfCurrentMonthAnd5Years(), Validators.required],
    TotalForItem: [{ value: '', disabled: true }]
  });

  //for additional empty row for vauchers loading manually
  manuallyVouchersForm = this.fb.group({
    FromCard: ['', [Validators.required]],
    ToCard: [''],
    LoadSum: ['', [Validators.required]],
    ValidationDate: [this.getLastDateOfCurrentMonthAnd5Years(), Validators.required],
    TotalForItem: [{ value: '', disabled: true }],
    CardsCount: [{ value: '', disabled: true }]
  },
    // {
    //   validator: checkMatchValidator('FromCard', 'ToCard')
    // }
  );


  //מספר אסמכתה
  // RefControl = new FormControl('', Validators.required);

  // OrderNameGroup = this.fb.group({
  //   Comments: ['', [Validators.required, this.noWhitespaceValidator]]
  // });
  OrderChangesGroup = this.fb.group({
    RefControl: ['', [Validators.required]],
    Comments: ['', [Validators.required, this.noWhitespaceValidator]],
    SupplierGroups: ['0'],
    PolicyControl: ['', [Validators.required]]
  });

  // policySelectControl = new FormControl(['', Validators.required]);
  // Comments = new FormControl(['', Validators.required]);

  ngOnInit() {
    window.scroll(0, 0);
    let url = this.router.url;
    this.userToken = JSON.parse(localStorage.getItem('user')).Token;
    // //

    //get order type
    this.urlSharingService.orderTypeMessage.subscribe(type => {
      this.orderType = type;
      this.SetDynamicTitles();
    });

    // this.SetDynamicTitles();

    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));
    this.sharedService.pagesAccessLevel.next('');

    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.sendSmsGroup.disable();
      this.addToExecOrderForm.disable();
      // this.RefControl.disable();  //1
      // this.OrderNameGroup.disable();  // 1
      this.OrderChangesGroup.disable();


      //Comments
      //OrderNameGroup
      //RefControl

    }


    this.orderDetails = [
      { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
    ];

    this.orderDetailsVoucherManually = [
      { FromCard: '', ToCard: '', LoadSum: 0, ValidationDate: '', TotalForItem: 0, QTY: 0 }
    ];



    this.getStatusList();
    this.getSmsTemplates();

    this.GetPoliciesByCompanyId();
    //this.GetSupplierGroups();
    this.GetSupplierGroupsDetails();

    //this code need for change url
    let urlParams = this.urlSharingService.messageSource.getValue();

    if (urlParams == '') {
      this.router.navigate(['/public/home']);
    }
    else {
      // this.idUnsubscribe = this.activeRoute.params.subscribe(param => {
      this.urlSharingService.changeMessage('');

      //manual order
      if (url.includes('order')) {
        //
        this.orderId = JSON.parse(urlParams)['orderId'];
        this.customerId = JSON.parse(urlParams)['customerId'];
        this.newOrder = false;

        this.GetOrderDetails();

        //this.GetCards();
        // 
      }

      //new order
      if (url.includes('newOrder')) {
        this.orderStatus.description = 'הזמנה חדשה';
        this.customerId = JSON.parse(urlParams)['customerId'];

        // this.policySelectControl.setValue(JSON.parse(urlParams)['policy']);
        this.newOrder = true;
        ////

        //set comments to field

        // this.OrderNameGroup.get('Comments').setValue(JSON.parse(urlParams)['orderDescription']);
        this.OrderChangesGroup.get('Comments').setValue(JSON.parse(urlParams)['orderDescription']);
        this.OrderChangesGroup.get("RefControl").setValue(0);

        let objToApi = {
          Token: this.userToken,
          CustomerId: this.customerId
        }

        this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {
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
          this.Customer = result.obj[0];

          //set all parameters of customer to lowercase
          Object.keys(this.Customer).forEach(element => {
            this.newCustomer[element.toLowerCase()] = this.Customer[element]
          });

          this.dataByPage = result.obj[0];




          //if order created from excel file
          //also check if it not magnetic order
          if (this.orderType != this.OrderType.LoadingVoucherByExcel && this.orderType != this.OrderType.LoadingVouchersManually) {
            this.excelOrder = (this.dataByPage.DigitalBatch > 0 || this.dataByPage.DigitalBatch != 0) && this.dataByPage.DigitalBatch != null;
          }

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


        if (this.orderType != this.OrderType.LoadingVouchersManually) {
          let orderDetails = [{ id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }];
          this.orderDetailsTable = new MatTableDataSource(orderDetails);
        }
        else if (this.orderType == this.OrderType.LoadingVouchersManually) {
          let orderDetails = [{ FromCard: '', ToCard: '', LoadSum: 0, ValidationDate: '', TotalForItem: 0, QTY: 0 }];
          this.orderDetailsVouchersManuallyTable = new MatTableDataSource(orderDetails);

        }

      }
      // })
      // 
      // this.GetCards();


      // this.RefControl.setValue(this.orderId);
      this.totalData();
    }
  }

  //have to be removed
  // checkCardValidity(element, value) {
  //   //

  //   let fieldFromCard = this.manuallyVouchersForm.get('FromCard');
  //   let fieldToCard = this.manuallyVouchersForm.get('ToCard');

  //   if (value.length == 8) {
  //     
  //     this.checkCardValidityFronSide(element, value);

  //     if (this.manuallyVouchersForm.get(element).valid) {
  //       this.manuallyVouchersForm.get(element).setErrors({ 'CardNumberExist': false })
  //       let objToApi = {
  //         Token: this.userToken,
  //         CardId: value
  //       }
  //       // 
  //       this.dataService.CheckCardBelongingToTheCompany(objToApi).subscribe(result => {
  //         // 
  //         
  //         if (typeof result == 'object') {
  //           if (result['Token'] != null && result['Token'] != '') {

  //             if (+result['err'] < 0) {
  //               switch (element) {
  //                 case 'FromCard':
  //                   fieldFromCard.setErrors({ 'FromCardNotBelongs': true });
  //                   this.cardFromNotBelongsError = result['errdesc'];
  //                   break;
  //                 case 'ToCard':
  //                   fieldToCard.setErrors({ 'ToCardNotBelongs': true });
  //                   this.cardToNotBelongsError = result['errdesc'];
  //                   break;
  //               }
  //             }
  //             else {
  //               fieldFromCard.setErrors({ 'FromCardNotBelongs': false });
  //               fieldToCard.setErrors({ 'ToCardNotBelongs': false });


  //               setTimeout(() => {
  //                 fieldFromCard.setErrors(null);
  //                 fieldToCard.setErrors(null);
  //                 this.cardFromNotBelongsError = '';
  //                 this.cardToNotBelongsError = '';

  //                 // this.checkCardValidityFronSide(element, value);
  //                 this.checkCardValidityFronSide('FromCard', fieldFromCard.value);
  //                 this.checkCardValidityFronSide('ToCard', fieldToCard.value);

  //               }, 0)
  //             }
  //           }
  //         }
  //         else if (typeof result == 'string') {
  //           this.dialog.open(DialogComponent, {
  //             data: { message: result }
  //           })
  //         }
  //       })
  //     }
  //   }


  // }

  checkCardValidityFronSide(element, value) {


    let fieldFromCard = this.manuallyVouchersForm.get('FromCard');
    let fieldToCard = this.manuallyVouchersForm.get('ToCard');
    let cardNumber = value;


    //set tickets count
    if (fieldFromCard.value != '' && fieldFromCard.value.length >= 8 && fieldToCard.value != '' && fieldToCard.value.length >= 8) {
      this.CardsCountForOrderLine = fieldToCard.value - fieldFromCard.value + 1;
    }
    else if (fieldFromCard.value != '' && fieldFromCard.value.length >= 8 && fieldToCard.value == '') {
      this.CardsCountForOrderLine = 1;
    }

    else if (fieldFromCard.value == '') {
      this.CardsCountForOrderLine = 0;
    }


    //check range between to/from card
    if ((fieldToCard.value != null && fieldToCard.value.length > 1) && +fieldToCard.value < +fieldFromCard.value) {
      fieldToCard.setErrors({ 'incorrect': true })

      this.CardsCountForOrderLine = 0;
      this.TotalForOrderLine = 0;
    }
    else {
      fieldToCard.setErrors({ 'incorrect': false })
      // fieldToCard.setErrors({ 'equalValueError': false })
      fieldToCard.setErrors(null);

      if (fieldToCard.value != null) {
        if (fieldToCard.value.length == 0 && fieldFromCard.value.length >= 8) {
          this.CardsCountForOrderLine = 1;

        }
        else if (fieldToCard.value.length > 1 && +fieldToCard.value == +fieldFromCard.value) {
          // fieldToCard.setErrors({ 'equalValueError': true })
          // this.CardsCountForOrderLine = 0;
          // this.TotalForOrderLine = 0;
          this.CardsCountForOrderLine = 1;
          // this.manuallyVouchersForm.get('ToCard').setValue(null);
        }
        else if (fieldToCard.value.length >= 0 && fieldFromCard.value.length >= 8) {
          this.CardsCountForOrderLine = ((fieldToCard.value - fieldFromCard.value) + 1) < 0 ? 0 : (fieldToCard.value - fieldFromCard.value) + 1;

        }
      }




      this.CalculateOrderLineTottalSum();

    }

    //check if entering card is exist on order
    this.orderDetailsVoucherManually.map((cardDetails, index) => {
      if (this.orderDetailsVoucherManually.length > 1 && index != this.orderDetailsVoucherManually.length - 1) {
        if (cardNumber >= cardDetails.FromCard && cardNumber <= cardDetails.ToCard) {
          this.manuallyVouchersForm.get(element).setErrors({ 'CardNumberExist': true });
        }
      }
    })
  }

  CalculateOrderLineTottalSum() {


    try {

      let inseredSum = (this.manuallyVouchersForm.get('LoadSum').value).replaceAll(',', '');
      this.TotalForOrderLine = (this.CardsCountForOrderLine * inseredSum) < 0 ? 0 : (this.CardsCountForOrderLine * inseredSum);
    }
    catch (e) { }

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

  SetDynamicTitles() {


    switch (this.orderType) {

      case this.OrderType.OrderByExcel: this.OrderSummaryTitle = 'סיכום הזמנה דיגיטלית'; this.GoToOrderLinesTitle = 'רשימת הנמענים'; break;
      case this.OrderType.ManualOrder: this.OrderSummaryTitle = 'סיכום הזמנה דיגיטלית'; this.GoToOrderLinesTitle = 'רשימת הנמענים'; break;
      // case this.OrderType.Digital: this.OrderSummaryTitle = 'סיכום הזמנה דיגיטלית'; this.GoToOrderLinesTitle = 'רשימת הנמענים'; break;

      case this.OrderType.LoadingVoucherByExcel: this.OrderSummaryTitle = 'סיכום הזמנה מגנטית'; this.GoToOrderLinesTitle = 'רשימת כרטיסים'; break;
      case this.OrderType.LoadingVouchersManually: this.OrderSummaryTitle = 'סיכום הזמנה מגנטית'; this.GoToOrderLinesTitle = 'רשימת כרטיסים'; break;
      // case this.OrderType.Magnetic: this.OrderSummaryTitle = 'סיכום הזמנה מגנטית'; this.GoToOrderLinesTitle = 'רשימת כרטיסים'; break;
    }
  }
  GetOrderDetails() {
    let objToApi = {
      Token: this.userToken,
      CoreOrderID: this.orderId
    }
    //

    this.dataService.GetOrderDetails(objToApi).subscribe(result => {

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


      //
      //get order type

      if (result.obj[0].GiftCardType == 0) {
        this.orderType = (result.obj[0].DigitalBatch == '' || result.obj[0].DigitalBatch == null) ? this.OrderType.LoadingVouchersManually : this.OrderType.LoadingVoucherByExcel
      }
      else if (result.obj[0].GiftCardType == 1) {
        this.orderType = (result.obj[0].DigitalBatch == '' || result.obj[0].DigitalBatch == null) ? this.OrderType.ManualOrder : this.OrderType.OrderByExcel
      }

      //

      this.SetDynamicTitles();
      if (this.router.url.includes('order')) {
        this.GetCards();
      }

      this.orderIdToPreview = result.obj[0].idex;
      this.IsB2COrder = result.obj[0].IsB2COrder;


      let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].StatusId);
      this.orderStatus.id = statusData[0].StatusId;
      this.orderStatus.description = statusData[0].Description;

      this.dataByPage = result['obj'][0];


      //
      this.OrderChangesGroup.get('PolicyControl').setValue(+result['obj'][0]['Policy']);
      this.OrderChangesGroup.get('Comments').setValue(result['obj'][0]['OrderName']);
      this.OrderChangesGroup.get('SupplierGroups').setValue(result.obj[0].SupplierGroupID);

      // this.policySelectControl.setValue(+result['obj'][0]['Policy']);

      // if (result.obj[0].StatusId > 1) {
      //   this.policySelectControl.disable();
      // }



      //if order created from excel file
      //also check if it not magnetic order
      if (this.orderType != this.OrderType.LoadingVoucherByExcel && this.orderType != this.OrderType.LoadingVouchersManually) {
        this.excelOrder = (this.dataByPage.DigitalBatch > 0 || this.dataByPage.DigitalBatch != 0) && this.dataByPage.DigitalBatch != null;
      }


      //
      this.OrderChangesGroup.get("RefControl").setValue(this.dataByPage.CrmOrderId);//Reference

      //get customer data
      this.Customer = result['obj'][0]['User'];
      //set all parameters of customer to lowercase
      Object.keys(this.Customer).forEach(element => {
        this.newCustomer[element.toLowerCase()] = this.Customer[element]
      });




      this.Orders = new MatTableDataSource(result['obj'][0]['Lines']);

      //if order is by range
      if (this.orderType == this.OrderType.LoadingVouchersManually) {

        this.orderDetailsVoucherManually = [];
        this.Orders.data.forEach((element, index) => {
          this.orderDetailsVoucherManually.push(element);
        });
        this.orderDetailsVoucherManually.push({ FromCard: '', ToCard: '', LoadSum: 0, ValidationDate: '', TotalForItem: 0, QTY: 0 })

        this.orderDetailsVouchersManuallyTable = new MatTableDataSource(this.orderDetailsVoucherManually);
        this.totalDataFromManualVoucher();

      }
      else {
        this.orderDetails = [];
        this.Orders.data.forEach((element, index) => {
          this.orderDetails.push(element);
        });
        this.orderDetails.push({ id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 })


        this.orderDetailsTable = new MatTableDataSource(this.orderDetails);
        this.totalData();
      }


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

  GetPoliciesByCompanyId() {


    let objToApi = {
      Token: this.userToken
    }

    try {
      this.dataService.GetPoliciesByCompanyId(objToApi).subscribe(result => {

        if (result == undefined) {
          // this.sharedService.exitSystemEvent(result);
          return false;
        }
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (result['obj'] != null) {
          this.policyList = result['obj'];
          //



          // this.policyList.unshift({ POL_ID: "", POL_NAME: "" });
          // this.OrderChangesGroup.get("PolicyControl").setValue("");
          // setTimeout(() => {
          //   this.policyList.shift();
          // }, 500)

        }
        else {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          })
        }

      })
    } catch (error) {
      console.log(error);
    }


  }

  // GetSupplierGroups() {
  //   let objToApi = {
  //     Token: this.userToken
  //   }

  //   try {
  //     this.dataService.GetAllSupplierGroups(objToApi).subscribe(result => {
  //       if (typeof result == 'string') {
  //         // this.sharedService.exitSystemEvent(result);
  //         return false;
  //       }
  //       //set new token
  //       let tempObjUser = JSON.parse(localStorage.getItem('user'));
  //       tempObjUser['Token'] = result['Token'];
  //       localStorage.setItem('user', JSON.stringify(tempObjUser));
  //       this.userToken = result['Token'];

  //       if (result['obj'] != null) {
  //         this.supplierGroups = result['obj'];
  //         this.supplierGroups.unshift({ groupId: "0", groupName: "כל הספקים" });
  //         this.OrderChangesGroup.get("SupplierGroups").setValue("0");

  //       }
  //       else {
  //         this.dialog.open(DialogComponent, {
  //           data: { message: result.errdesc }
  //         })
  //       }

  //     })
  //   } catch (error) {
  //     console.log(error);
  //   }

  // }

  GetSupplierGroupsDetails() {
    let objToApi = {
      Token: this.userToken
    }

    try {
      //
      this.dataService.GetSupplierGroupsDetails(objToApi).subscribe(result => {
        //
        if (typeof result == 'string') {
          // this.sharedService.exitSystemEvent(result);
          return false;
        }
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (result['obj'] != null) {
          this.supplierGroups = result['obj'];
          this.supplierGroups.unshift({ SUPGRP_ID: "0", SUPGRP_NAME: "כל הספקים" });
          this.OrderChangesGroup.get("SupplierGroups").setValue("0");

        }
        else {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          })
        }

      })
    } catch (error) {
      console.log(error);
    }

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


  totalDataFromManualVoucher() {
    //
    this.totalTicketCount = 0;
    this.totalOrderSum = 0;
    this.orderDetailsVoucherManually.forEach((el, i) => {
      if (i != this.orderDetailsVoucherManually.length - 1) {
        //
        this.totalTicketCount += (+el.ToCard - +el.FromCard + 1);
        this.totalOrderSum += el.LoadSum * (+el.ToCard - +el.FromCard + 1);
      }

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


        let test = (this.dataByPage.DigitalBatch != undefined && (this.dataByPage.DigitalBatch > 0 ||
          this.dataByPage.DigitalBatch != 0) && (this.orderDetails.length - 1 != 1)) && (this.orderStatus.id == '1' || this.orderStatus.id == '0');


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


        //here111
        if (this.orderType == this.OrderType.LoadingVouchersManually) {

          this.orderDetailsVoucherManually = [
            { FromCard: '', ToCard: '', LoadSum: 0, ValidationDate: '', TotalForItem: 0, QTY: 0 }
          ];

          this.Orders = new MatTableDataSource(result['obj'][0]['Lines']);
          this.Orders.data.forEach((element, index) => {
            this.orderDetailsVoucherManually.unshift(element);
          });

          this.GetCards();
          this.orderDetailsVouchersManuallyTable = new MatTableDataSource(this.orderDetailsVoucherManually);
          this.totalDataFromManualVoucher();


        }
        else {
          this.orderDetails = [
            { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
          ];
          if (result['obj'][0]['Lines'].length > 0) {
            this.orderDetails.unshift(...result['obj'][0]['Lines']);
          }
          this.orderDetailsTable.data = this.orderDetails;
          this.totalData();
        }




      });
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: this.MsgList.readOnly }
      })
    }
  }


  addOrderLine() {
    //
    if (this.newOrder || !this.excelOrder) {
      if (this.addToExecOrderForm.valid) {
        this.insertOrderLineSpinner = true;
        let ticketCount = +((this.addToExecOrderForm.get('ticketCount').value).replaceAll(',', ''));
        let chargeAmount = +((this.addToExecOrderForm.get('chargeAmount').value).replaceAll(',', ''));
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
          // OrderName: this.OrderNameGroup.get('Comments').value,
          OrderName: this.OrderChangesGroup.get('Comments').value,
          Reference: this.OrderChangesGroup.get("RefControl").value == '' ? 0 : this.OrderChangesGroup.get("RefControl").value,
          //Policy: this.OrderChangesGroup.get('PolicyControl').value
        }
        //query for insert update order lines, but not for the first line
        if (this.orderDetailsTable.data.length > 1) {

          objToApi['OrderId'] = this.orderId;

          this.dataService.InsertUpdateLines(objToApi).subscribe(result => {
            if (typeof result == 'string') {
              // this.dialog.open(DialogComponent, {
              //   data: { message: result }
              // })

              this.sharedService.exitSystemEvent(result);
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
            //
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
              this.sharedService.exitSystemEvent(result);
              return false;
            }

            //
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
              this.orderDetailsTable = new MatTableDataSource(this.orderDetails);


              //after created new order, set order id
              this.orderId = result['obj'][0]['orderid'];

              //calculate new total dat
              this.totalData();

              //set status data
              let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].OrderStatus);
              this.orderStatus.id = statusData[0].StatusId;
              this.orderStatus.description = statusData[0].Description;
              //

            }
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


  addOrderLineForManualVoucher() {
    if (this.manuallyVouchersForm.valid) {

      this.insertOrderLineSpinner2 = true;
      let formData = this.manuallyVouchersForm.value;
      //let TotalForItem = (formData.LoadSum).replaceAll(',','') * (formData.ToCard - formData.FromCard + 1);
      //let QTY = formData.ToCard - formData.FromCard + 1;
      let validity = new Date(formData.ValidationDate);
      validity.setHours(23, 59, 59)
      let objToApi = {
        Token: this.userToken,
        UserId: this.customerId,
        ChargeAmount: +(formData.LoadSum.replaceAll(',', '')),
        OpCode: "Magnetic",
        FromCard: formData.FromCard,
        ToCard: formData.ToCard != '' ? formData.ToCard == formData.FromCard ? null : formData.ToCard : null,
        Validity: validity.toISOString(),
      }

      //first line
      if (this.orderDetailsVouchersManuallyTable.data.length == 1) {

        this.dataService.InsertUpdateOrderBatchByRange(objToApi).subscribe(result => {

          this.insertOrderLineSpinner2 = false;
          if (typeof result == 'string') {
            this.sharedService.exitSystemEvent(result);
            return false;
          }
          if (result.err < 0 && result.obj != null && result.obj.length > 0) {

            //here


            //translate table label
            let newDataArr = [];
            result.obj.forEach(data => {

              newDataArr.push({ 'מספר תו': data.CardId, 'הערה': data.ErrorMsg })
            })


            this.dialog.open(TableDialogComponent, {
              maxHeight: '200px',
              data: { title: result.errdesc, data_Source: newDataArr, dataLabelsList: ['מספר תו', 'הערה'] }
            })
            return false;
          }

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          this.orderDetailsVoucherManually = [
            { FromCard: '', ToCard: '', LoadSum: 0, ValidationDate: '', TotalForItem: 0, QTY: 0 }
          ];
          this.dataByPage['MDate'] = new Date();
          this.orderIdToPreview = result.obj[0].idex;
          this.orderDetailsVoucherManually.unshift(...result['obj'][0]['Lines']);
          this.orderDetailsVouchersManuallyTable = new MatTableDataSource(this.orderDetailsVoucherManually);

          //after created new order, set order id
          this.orderId = result['obj'][0]['orderid'];

          //calculate new total dat
          this.totalDataFromManualVoucher();

          //set status data
          let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].OrderStatus);
          this.orderStatus.id = statusData[0].StatusId;
          this.orderStatus.description = statusData[0].Description;
        })
      }
      //second and more lines
      else if (this.orderDetailsVouchersManuallyTable.data.length > 1) {
        objToApi['OrderId'] = this.orderId;
        //
        this.dataService.InsertUpdateLines(objToApi).subscribe(result => {

          this.insertOrderLineSpinner2 = false;
          if (typeof result == 'string') {
            this.sharedService.exitSystemEvent(result);
            return false;
          }
          if (result.err < 0 && result.obj != null && result.obj.length > 0) {
            //translate table label
            let newDataArr = [];
            result.obj.forEach(data => {

              newDataArr.push({ 'מספר תו': data.CardId, 'הערה': data.ErrorMsg })
            })


            this.dialog.open(TableDialogComponent, {
              maxHeight: '200px',
              data: { title: result.errdesc, data_Source: newDataArr, dataLabelsList: ['מספר תו', 'הערה'] }
            })

            return false;
          }
          this.insertOrderLineSpinner2 = false;

          this.manuallyVouchersForm.get('ValidationDate').setValue(this.getLastDateOfCurrentMonthAnd5Years());
          // 
          // if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];


          //
          this.orderDetailsVoucherManually = [
            { FromCard: '', ToCard: '', LoadSum: 0, ValidationDate: '', TotalForItem: 0, QTY: 0 }
          ];


          this.orderDetailsVoucherManually.unshift(...result['obj'][0]['Lines']);
          this.orderDetailsVouchersManuallyTable = new MatTableDataSource(this.orderDetailsVoucherManually);


          //calculate new total dat
          this.totalDataFromManualVoucher();

          //set status data
          let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].OrderStatus);
          this.orderStatus.id = statusData[0].StatusId;
          this.orderStatus.description = statusData[0].Description;

        });

        /////
      }


      //reset form
      //

      this.viewAddToExecOrderForm2 = false;

      setTimeout(() => {
        this.manuallyVouchersForm.reset();
        //
        this.manuallyVouchersForm.markAsUntouched();
        this.CardsCountForOrderLine = 0;
        this.TotalForOrderLine = 0;
        this.manuallyVouchersForm.get('ValidationDate').setValue(this.getLastDateOfCurrentMonthAnd5Years());
        this.viewAddToExecOrderForm2 = true;

      }, 0);
    }
    else {
      this.addOrderLineErrMsg = 'נא למלא את כל השדות';

      setTimeout(() => {
        this.addOrderLineErrMsg = '';
      }, 3000);
    }
  }


  ApproveOrder(element) {
    //
    let buttonClicked = element.currentTarget;
    if (this.orderDetails.length > 1 && this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {


      if (this.OrderChangesGroup.get("RefControl").value == 0 || this.OrderChangesGroup.get("RefControl").value == '') {
        this.infoMsg = this.MsgList.referenceRequired;
        setTimeout(() => {
          this.infoMsg = '';
        }, 2000)

        return false;
      }

      // if (!this.OrderNameGroup.valid) {
      //   this.OrderNameGroup.markAllAsTouched();
      //   return false;
      // }

      if (!this.OrderChangesGroup.valid) {
        this.OrderChangesGroup.markAllAsTouched();
        return false;
      }


      let objToApiChanges = {
        Token: this.userToken,
        UserID: this.customerId,
        OrderID: this.orderId,
        OpCode: "Save",
        Reference: this.OrderChangesGroup.get("RefControl").value == '' ? 0 : this.OrderChangesGroup.get("RefControl").value,
        OrderName: this.OrderChangesGroup.get('Comments').value.trim(),
        Policy: this.OrderChangesGroup.get('PolicyControl').value,
        SupplierGroupId: this.OrderChangesGroup.get('SupplierGroups').value
      }
      //
      //first save reference and comments
      this.createCardsSpinner = true;

      //
      this.dataService.InsertUpdateOrder(objToApiChanges).subscribe(result => {
        //
        this.createCardsSpinner = false;
        if (typeof result == 'string') {
          // this.dialog.open(DialogComponent, {
          //   data: { message: result }
          // })

          this.sharedService.exitSystemEvent(result);
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

  ApproveLoadingOrder(element) {
    // let buttonClicked = element.currentTarget;
    // if (this.orderType == this.OrderType.LoadingVouchersManually) {
    //   alert('under construction');
    // }
    // else if (this.orderType == this.OrderType.LoadingVoucherByExcel) {
    //   alert('under construction');
    // }


    let buttonClicked = element.currentTarget;

    let orderDetailsValid: boolean = false;
    if (this.orderType == this.OrderType.LoadingVouchersManually) {
      orderDetailsValid = this.orderDetailsVoucherManually.length > 1;
    }
    else {
      orderDetailsValid = this.orderDetails.length > 1;
    }
    if (orderDetailsValid && this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {


      if (this.OrderChangesGroup.get("RefControl").value == 0 || this.OrderChangesGroup.get("RefControl").value == '') {
        this.infoMsg = this.MsgList.referenceRequired;
        setTimeout(() => {
          this.infoMsg = '';
        }, 2000)

        return false;
      }

      // if (!this.OrderNameGroup.valid) {
      //   this.OrderNameGroup.markAllAsTouched();
      //   return false;
      // }

      if (!this.OrderChangesGroup.valid) {
        this.OrderChangesGroup.markAllAsTouched();
        return false;
      }


      let objToApiChanges = {
        Token: this.userToken,
        UserID: this.customerId,
        OrderID: this.orderId,
        OpCode: "Save",
        Reference: this.OrderChangesGroup.get("RefControl").value == '' ? 0 : this.OrderChangesGroup.get("RefControl").value,
        OrderName: this.OrderChangesGroup.get('Comments').value.trim(),
        Policy: this.OrderChangesGroup.get('PolicyControl').value,
        SupplierGroupId: this.OrderChangesGroup.get('SupplierGroups').value
      }
      //
      //first save reference and comments
      this.createCardsSpinner = true;

      this.dataService.InsertUpdateOrder(objToApiChanges).subscribe(result => {

        this.createCardsSpinner = false;
        if (typeof result == 'string') {
          // this.dialog.open(DialogComponent, {
          //   data: { message: result }
          // })

          this.sharedService.exitSystemEvent(result);
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


        this.dataService.ApproveBatchOrder(objToApi).subscribe(result => {

          //alert('after approve');

          this.descriptionStatusInjected = '';
          buttonClicked.disabled = false;
          this.createCardsSpinner = false;
          this.infoMsg = '';

          if (typeof result == 'string') {
            // this.dialog.open(DialogComponent, {
            //   data: { message: result }
            // })

            this.sharedService.exitSystemEvent(result);
            return false;
          }
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
            this.goToOrder(result.obj[0]['orderid'], this.customerId);
          }, 2000);
        })
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

  deleteLoadedOrder() {
    alert('under construction');
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

    //
    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {

      if (this.OrderChangesGroup.valid) {


        if (this.OrderChangesGroup.get('RefControl').value == 0 || this.OrderChangesGroup.get('RefControl').value == '') {

          this.errorMsg = this.MsgList.referenceRequired
          setTimeout(() => {
            this.errorMsg = '';

          }, 2000);
          return false;
        }
        this.saveChangesSpinner = true;

        let objToApi = {
          Token: this.userToken,
          UserID: this.customerId,
          OrderID: this.orderId,
          OpCode: "Save",
          Reference: this.OrderChangesGroup.get("RefControl").value,
          OrderName: this.OrderChangesGroup.get('Comments').value.trim(),
          Policy: this.OrderChangesGroup.get('PolicyControl').value,
          SupplierGroupId: this.OrderChangesGroup.get('SupplierGroups').value
        }

        this.chagesToServer = [];



        //alert('before save changes');

        //
        this.dataService.InsertUpdateOrder(objToApi).subscribe(result => {
          //
          // alert('after save changes');


          this.saveChangesSpinner = false;
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
        this.OrderChangesGroup.markAllAsTouched();

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

    debugger
    this.dialog.open(DatePickerDialog, {
      data: {
        date: element.ValidationDate,
        element: element,
        control: controlName
      }
    }).afterClosed().subscribe(dialogResult => {


      debugger
      if (new Date(dialogResult.result.date) < new Date()) {
        this.dialog.open(DialogComponent, {
          data: { message: MsgList.wrongDate }
        })
      }
      else {
        this.dateChanging = true;
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
          this.dateChanging = false;
          if (typeof result == 'string') {
            // this.dialog.open(DialogComponent, {
            //   data: { message: result }
            // })

            // this.sharedService.exitSystemEvent();
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


          if (this.orderType == this.OrderType.LoadingVouchersManually) {

            this.orderDetailsVoucherManually = [
              { FromCard: '', ToCard: '', LoadSum: 0, ValidationDate: '', TotalForItem: 0, QTY: 0 }
            ];

            this.Orders = new MatTableDataSource(result['obj'][0]['Lines']);
            this.Orders.data.forEach((element, index) => {
              this.orderDetailsVoucherManually.unshift(element);
            });

            this.GetCards();
            this.orderDetailsVouchersManuallyTable = new MatTableDataSource(this.orderDetailsVoucherManually);
            this.totalDataFromManualVoucher();


          }
          else {
            this.orderDetails = [
              { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
            ];

            this.Orders = new MatTableDataSource(result['obj'][0]['Lines']);
            this.Orders.data.forEach((element, index) => {
              this.orderDetails.unshift(element);
            });

            this.GetCards();
            this.orderDetailsTable = new MatTableDataSource(this.orderDetails);
            this.totalData();
          }


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
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        // this.sharedService.exitSystemEvent();
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
                // this.dialog.open(DialogComponent, {
                //   data: { message: result }
                // })

                // this.sharedService.exitSystemEvent();
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
              this.GetCards();//here
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

    if (this.orderType == this.OrderType.LoadingVoucherByExcel || this.orderType == this.OrderType.LoadingVouchersManually) {
      objToAPI['OpCode'] = 'Magnetic'
    }



    this.dataService.GetCardsByOrderId(objToAPI).subscribe(result => {

      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        // this.sharedService.exitSystemEvent();
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


      //check if cards loaded by LoadingVoucherByExcel contains phone number
      this.LoadingVoucherByExcelHavePhoneNumber = this.orderCardsData.filter(data => (data.DSendPhone != '' && data.DSendPhone != null)).length > 0;

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
        { value: 'Row', viewValue: "מס''ד" },
        { value: 'CardId', viewValue: 'קוד דיגיטלי' },
        // { value: 'DSendName', viewValue: 'שם נמען' },
        // { value: 'DSendPhone', viewValue: 'מספר נייד נמען' },
        { value: 'LoadSum', viewValue: 'סכום טעינה ראשוני' },
        { value: 'ValidationDate', viewValue: 'תוקף' },
        { value: 'KindOfLoadSumDesc', viewValue: 'סוג תו טעינה' },
        // { value: 'DSendLastSent', viewValue: 'נשלח לאחרונה' }
        { value: 'active', viewValue: 'סטטוס תו' }
      ];

      if (this.excelOrder || this.LoadingVoucherByExcelHavePhoneNumber) {
        tableLabels.splice(tableLabels.length, 0, { value: 'DSendLastSent', viewValue: 'נשלח לאחרונה' });
        tableLabels.splice(3, 0, { value: 'DSendName', viewValue: 'שם נמען' });
        tableLabels.splice(4, 0, { value: 'DSendPhone', viewValue: 'מספר נייד נמען' });
      }



      //here

      //add another column to file if order created from excel file
      if ((this.DigitalBatch != '' && this.DigitalBatch != undefined) && (this.orderType != this.OrderType.LoadingVoucherByExcel && this.orderType != this.OrderType.LoadingVouchersManually)) {
        tableLabels.push({ value: 'ValidationField', viewValue: 'שדה אימות' })
      }

      if (this.orderType == this.OrderType.LoadingVoucherByExcel || this.orderType == this.OrderType.LoadingVouchersManually) {
        // tableLabels.push({ value: 'PrintNumber', viewValue: ' קידוד כרטיס' })
        tableLabels.splice(2, 0, { value: 'Track', viewValue: ' קידוד כרטיס' })
      }

      // if (this.orderType == this.OrderType.LoadingVouchersManually) {
      //   tableLabels.splice(2, 0, { value: 'Track', viewValue: ' קידוד כרטיס' })

      // }

      let tableData = JSON.parse(JSON.stringify(this.orderCardsData));
      debugger

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
          if (element == 'DSendLastSent') {
            data[element] = this.formatDate(data[element]);
          }
          if (element == 'active') {
            data[element] = data[element] == 1 ? 'פעיל' : 'חסום'
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
      customerId: customerId,
      orderType: this.orderType
    }
    //
    this.urlSharingService.changeMessage(JSON.stringify(OrderLine));
    //
    //this.urlSharingService.changeOrderType(this.orderType);
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

  formatDate(dateForFormat: any) {

    if (dateForFormat != null && dateForFormat != "") {
      let date = new Date(dateForFormat.toString());
      let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
      let year = date.getFullYear();

      return day + '/' + month + '/' + year;
    }
    else {
      return "";
    }

  }
  formatDateWithLine(dateForFormat: any) {

    if (dateForFormat != null && dateForFormat != "") {
      let date = new Date(dateForFormat.toString());
      let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
      let year = date.getFullYear();

      return day + '-' + month + '-' + year;
    }
    else {
      return "";
    }

  }

  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnDestroy() {
    // this.idUnsubscribe.unsubscribe();
    this.urlSharingService.changeOrderType('');
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
