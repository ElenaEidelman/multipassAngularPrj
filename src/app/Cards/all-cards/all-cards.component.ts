import { animate, state, style, transition, trigger } from '@angular/animations';
import { Route } from '@angular/compiler/src/core';
import { AfterViewInit, Component, OnChanges, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/Services/SharedService/shared.service';

import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';


@Component({
  selector: 'app-all-cards',
  templateUrl: './all-cards.component.html',
  styleUrls: ['./all-cards.component.css'],
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
export class AllCardsComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  //filter table by card status
  statusList = [
    { value: 'all', viewValue: 'הכל' },
    { value: 'active', viewValue: 'פעיל' },
    { value: 'block', viewValue: 'חסום' }
  ];


  displayedColumns: string[] = [];

  viewTable: boolean = false;
  spinner: boolean = false;
  userToken;
  userId;
  cardsFilterFormView: boolean = true;
  statusListArr = [];
  smsTemplatesData = [];

  MsgList = MsgList;
  minFromDate;
  minToDate;


  constructor(
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private urlSharingService: UrlSharingService,
    private router: Router) { }


  cardsForm = this.fb.group({
    CardId: (''),
    PhoneNo: ['', Validators.pattern('[[0][0-9]{9}]*')],
    FullName: (''),
    OrderId: (''),
    FromDate: (''),
    ToDate: (''),
    CustomerId: (''),
  });

  sendSms = this.fb.group({
    smsTemplates: ['', Validators.required],
    previewSmsTemplate: ['', Validators.required]
  });

  cardsDataSource = new MatTableDataSource([]);
  public linksListById;

  formErrorMsg: string = '';

  cardsLabelForTable = [
    { value: 'CardId', viewValue: 'מספר שובר' },
    { value: 'CompanyName', viewValue: 'שם לקוח' },
    { value: 'PhoneNumber', viewValue: 'מספר טלפון' },
    { value: 'CurrentBudget', viewValue: 'יתרה' },// no data !!!!
    { value: 'OrderId', viewValue: 'מספר הזמנה' },
    { value: 'CreationDate', viewValue: 'תאריך הנפקה' },
    // {value: 'dataSend', viewValue: 'תאריך שליחה'},
    { value: 'Status', viewValue: 'סטטוס שובר' } //CardStatusDesc
  ];
  ngOnInit(): void {
    window.scroll(0, 0);


    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getSmsTemplates();
    this.getStatusList();

    this.userId = JSON.parse(localStorage.getItem('user')).obj.Id;
    // this.getCardsFilteredData();
    // this.getFilteredCards();
  }

  getFilteredCards() {

    // this.cardsDataSource = new MatTableDataSource([]);
    this.cardsDataSource.data = [];
    this.displayedColumns = [];
    this.viewTable = false;

    // let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let formSearchFiled = false;
    let objToApi = {
      Token: this.userToken
    }

    Object.keys(this.cardsForm.value).forEach(val => {
      if (this.cardsForm.get(val).value != '') {
        formSearchFiled = true;
        if (val == 'ToDate') {
          let toDate = this.cardsForm.get(val).value;
          objToApi[val] = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59);
        }
        else {
          objToApi[val] = this.cardsForm.get(val).value;
        }
      }
    })

    if (formSearchFiled) {
      this.spinner = true;


      debugger
      this.dataService.GetAllCards(objToApi).subscribe(result => {
        debugger

        this.spinner = false;

        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
            this.createTableData(result['obj']);
          }
          else if (result.obj == null && result.errdesc.includes('No Data Found')) {
            this.formErrorMsg = result.errdesc;
            setTimeout(() => {
              this.formErrorMsg = '';
            }, 10000);
          }
        }
        else if (typeof result == 'string') {
          this.formErrorMsg = result;
          setTimeout(() => {
            this.formErrorMsg = '';
          }, 10000);
        }
        else {
          // this.dialog.open(DialogComponent, {
          //   data: {message: MsgList.exitSystemAlert}
          // })
          this.sharedService.exitSystemEvent();
        }
      })
    }


    else {
      this.formErrorMsg = MsgList.fillRequiredFields;
      setTimeout(() => {
        this.formErrorMsg = '';
      }, 3000);
    }
  }

  dateFromChanged(event, controller) {

    debugger
    if (controller == 'FromDate') {
      this.minToDate = new Date(event.value);
    }
    else if (controller == 'ToDate') {
      this.minFromDate = new Date(event.value);
    }
    // return this.filterTableGroup.get('ToDate').value != '' ? new Date(this.filterTableGroup.get('ToDate').value) : '';
  }


  createTableData(obj) {
    this.cardsDataSource.data = [];
    this.createDisplayedColumns(this.cardsLabelForTable);
    this.viewTable = true;
    this.cardsDataSource.data = obj;

    setTimeout(() => {
      this.cardsDataSource.paginator = this.paginator;
      this.cardsDataSource.sort = this.sort;
    }, 1000);


  }

  resetForm() {
    this.viewTable = false;

    this.cardsForm.reset();
    this.cardsFilterFormView = false;

    setTimeout(() => {
      this.cardsFilterFormView = true;
    }, 0);
  }

  returnHebTranslation(obj, value) {
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  createDisplayedColumns(columns) {
    columns.forEach(el => {
      this.displayedColumns.unshift(el.value);
    });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.cardsDataSource.filter = filterValue.trim().toLowerCase();

    if (this.cardsDataSource.paginator) {
      this.cardsDataSource.paginator.firstPage();
    }
  }

  getStatusList() {
    //api/Orders/GetOrdersStatus
    //Token

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetOrdersStatus(objToApi).subscribe(result => {

      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];


        if (typeof result == 'object' && result.obj != null) {
          this.statusListArr = [...result.obj];
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

  //enable/disable send sms button
  smsTempleteSelect(event) {
    if (event.value != undefined) {

      // this.smsTemplatesData;
      this.sendSms.get('previewSmsTemplate').setValue(this.smsTemplatesData.filter(el => el.Id == event.value)[0]['TemplateFormat']);
      //enable send sms button
      // this.sendButtonSms = false;
    }
  }

  getSmsTemplates() {

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetSMSFormats(objToApi).subscribe(result => {


      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
          this.smsTemplatesData = [...result.obj];
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

  sendSMS() {


    if (this.sendSms.valid) {
      this.dialog.open(DialogConfirmComponent, {
        data: { message: 'האם לשלוח SMS?', eventButton: 'שלח' }
      }).afterClosed().subscribe(result => {
        if (result.result == 'yes') {
          let test = this.cardsDataSource;

          // if(this.orderCardsData.length > 0){
          //   let selectedCards = [];
          //   this.orderCardsData.forEach(card => {
          //     selectedCards.push(card.Id)
          //   });

          // let objToApi = {
          //   Token: this.userToken,
          //   TemplateId: this.sendSms.get('smsTemplates').value,
          //   UserId: this.userId,
          //   OrderLineIds: selectedCards,
          //   CoreOrderId: '',
          //   From: this.smsTemplatesData.filter(el => el.Id == this.sendSms.get('smsTemplates').value)[0]['SenderName']
          // }

          // this.dataService.SendSMSByOrderLine(objToApi).subscribe(result => {
          //   if (result['Token'] != undefined || result['Token'] != null) {

          //     //set new token
          //     let tempObjUser = JSON.parse(localStorage.getItem('user'));
          //     tempObjUser['Token'] = result['Token'];
          //     localStorage.setItem('user', JSON.stringify(tempObjUser));
          //     this.userToken = result['Token'];

          //     if (result.errdesc == 'OK') {

          //       this.dialog.open(DialogComponent, {
          //         data: {title: '', message: 'ההודעות נשלחות ברקע' ,subTitle: ' ההודעה נשלחה ל ' + this.orderCardsData.length  + ' נמענים '  }
          //       })

          //       this.sendSmsGroup.reset();
          //       this.openSendSmsBlock();
          //     }
          //     else{
          //       this.dialog.open(DialogComponent, {
          //         data: {message: result.errdesc}
          //       });
          //     }
          //   }
          //   else {
          //     // this.dialog.open(DialogComponent, {
          //     //   data: {message: MsgList.exitSystemAlert}
          //     // })
          //     this.sharedService.exitSystemEvent();
          //   }
          // });

          // }
        }
      })
    }
    else {
      // this.errorSendSms = 'נא לבחור תבנית ההודעה';
      // setTimeout(()=>{
      //   this.errorSendSms = '';
      // }, 2000)
    }
  }

  goToCardInfo(cardId: number, userId: number) {
    let CardInfo = {
      cardId: cardId,
      userId: userId
    }
    this.urlSharingService.changeMessage(JSON.stringify(CardInfo));
    this.router.navigate(['/public/cardInfo']);
  }

  goToOrder(orderId: number, customerId: number) {
    let Order = {
      orderId: orderId,
      customerId: customerId
    }
    this.urlSharingService.changeMessage(JSON.stringify(Order));
    this.router.navigate(['/public/order']);
  }

  goToCustomer(customerId: number) {

    let Customer = {
      customerId: customerId
    }
    this.urlSharingService.changeMessage(JSON.stringify(Customer));
    this.router.navigate(['/public/customer']);
  }

  ngAfterViewInit(): void {
    if (this.cardsDataSource != undefined) {

      this.cardsDataSource.paginator = this.paginator;
      this.cardsDataSource.sort = this.sort;
    }
  }

  ngOnChanges() {

  }
}
