import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';

import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormControl } from '@angular/forms';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { MsgList } from 'src/app/Classes/msgsList';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { debug } from 'console';
import { MockData } from 'src/app/Classes/mockData';
import { OrderType } from 'src/app/Classes/OrderTypes';


@Component({
  selector: 'app-order-lines',
  templateUrl: './order-lines.component.html',
  styleUrls: ['./order-lines.component.css'],
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
export class OrderLinesComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }


  faFileExcel = faFileExcel;
  MsgList = MsgList;
  MockData = MockData;

  urlParamDestroy;
  userToken: string;
  userId;
  orderId;
  OrderType = OrderType;
  orderType;
  orderIdToPreview = '';
  orderStatus;

  tableSpinner: boolean = true;
  orderHaveCards: boolean = false;
  LoadingVoucherByExcelHavePhoneNumber: boolean = false;

  errorMsg: string = '';
  errorSendSms: string = '';

  smsIcon: string = 'sms';
  deleteIcon: string = 'block';



  smsTemplates = new FormControl();
  previewSmsTemplate = new FormControl();
  smsTemplatesData = [];
  sendButtonSms: boolean = true;
  additionalOptionsSMS: boolean = false;

  additionalOptionDelete: boolean = false;
  cardsDeletedError: string = '';
  cardsDeletedMsg: string = '';
  DigitalBatch = '';

  customerData;

  voidCardSpinner: boolean = false;

  OrderCreatedFromExcel: boolean = false;

  public dataTable = new MatTableDataSource([]);

  public tabelLabels = [
    { value: 'Row', viewValue: "מס''ד" },
    { value: 'CardId', viewValue: 'קוד דיגיטלי' },
    // { value: 'DSendName', viewValue: 'שם נמען' },
    // { value: 'DSendPhone', viewValue: 'מספר נייד נמען	' },
    { value: 'LoadSum', viewValue: 'סכום טעינה ראשוני		' },
    { value: 'ValidationDate', viewValue: '	תוקף	' },
    { value: 'KindOfLoadSumDesc', viewValue: 'סוג תו טעינה	' },
    // { value: 'DSendLastSent', viewValue: 'נשלח לאחרונה' },
    { value: 'active', viewValue: 'סטטוס תו' },
  ];
  // tabelLabelsList = ['Row', 'CardId', 'DSendName', 'DSendPhone', 'LoadSum', 'ValidationDate', 'KindOfLoadSumDesc', 'DSendLastSent', 'active'];
  tabelLabelsList = ['Row', 'CardId', 'LoadSum', 'ValidationDate', 'KindOfLoadSumDesc', 'active'];

  selection = new SelectionModel<any>(true, []);


  constructor(
    private activeRoute: ActivatedRoute,
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private urlSharingService: UrlSharingService,
    private router: Router) { }


  ngOnInit(): void {
    window.scroll(0, 0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];


    // this.urlParamDestroy = this.activeRoute.params.subscribe(param => {

    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));
    this.sharedService.pagesAccessLevel.next('');
    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.smsTemplates.disable();
      this.previewSmsTemplate.disable();

    }

    let urlParams = this.urlSharingService.messageSource.getValue();
    if (urlParams == '') {
      this.router.navigate(['/public/home']);
    }
    else {

      this.urlSharingService.changeMessage('');
      this.userId = JSON.parse(urlParams)['customerId'];
      this.orderId = JSON.parse(urlParams)['orderId'];
      this.orderType = JSON.parse(urlParams)['orderType'];


      //add another one column for magnetic cards
      //debugger
      if (this.orderType == this.OrderType.LoadingVoucherByExcel || this.orderType == this.OrderType.LoadingVouchersManually) {
        //add additional column for loaded vouchers
        this.tabelLabels.join();
        this.tabelLabels.splice(2, 0, { value: 'Track', viewValue: "קידוד כרטיס" });
        this.tabelLabels.join();


        this.tabelLabelsList.join();
        this.tabelLabelsList.splice(2, 0, "Track");
      }

      this.GetCards();
      this.GetCustomerById();
    }


    // });
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataTable.data);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataTable.data.length;
    return numSelected === numRows;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  GetCards() {

    this.tableSpinner = true;

    let objToAPI = {
      Token: this.userToken,
      OrderId: this.orderId,
      userId: this.userId
    }

    if (this.orderType == this.OrderType.LoadingVoucherByExcel || this.orderType == this.OrderType.LoadingVouchersManually) {
      objToAPI['OpCode'] = 'Magnetic'
    }

    debugger


    this.dataService.GetCardsByOrderId(objToAPI).subscribe(result => {
      debugger
      this.tableSpinner = false;
      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        // this.sharedService.exitSystemEvent();
        return false;
      }

      if (this.orderType == this.OrderType.LoadingVoucherByExcel) {
        this.LoadingVoucherByExcelHavePhoneNumber = result['obj'][0].filter(data => data.DSendPhone != '').length > 0;
      }

      //LoadingVoucherByExcelHavePhoneNumber
      debugger

      //check if order have created cards

      if (this.orderType != this.OrderType.LoadingVoucherByExcel && this.orderType != this.OrderType.LoadingVouchersManually) {
        result['obj'][0].every(element => {
          if (element['CardId'] != null) {
            this.orderHaveCards = true;
            return false;
          }
          else {
            this.orderHaveCards = false;
            return true;
          }
        });
      }

      //orderHaveCards



      // if (result['Token'] != undefined || result['Token'] != null) {

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      // if (typeof result == 'object') {


      //order id to preview
      this.orderIdToPreview = result['obj'][2];

      //get order status by first card
      this.orderStatus = result.obj[0][0]['Status'];

      this.dataTable.data = result['obj'][0];
      if (this.orderType != this.OrderType.LoadingVoucherByExcel && this.orderType != this.OrderType.LoadingVouchersManually) {
        this.OrderCreatedFromExcel = result['obj'][1] != '' ? true : false;

      }
      debugger

      this.DigitalBatch = result['obj'][1];

      if ((this.OrderCreatedFromExcel && this.orderHaveCards) || this.LoadingVoucherByExcelHavePhoneNumber) {
        this.tabelLabels.splice(3, 0, { value: 'DSendName', viewValue: 'שם נמען' });
        this.tabelLabels.splice(4, 0, { value: 'DSendPhone', viewValue: 'מספר נייד' });

        this.tabelLabelsList.splice(3, 0, 'DSendName');
        this.tabelLabelsList.splice(4, 0, 'DSendPhone');
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataTable.filter = filterValue.trim().toLowerCase();

    if (this.dataTable.paginator) {
      this.dataTable.paginator.firstPage();
    }
  }

  addSelectForSmsColumn() {
    //close all relevant for delete cards
    this.tabelLabelsList = this.tabelLabelsList.filter(el => el != 'selectDeleteCards');
    this.additionalOptionDelete = false;

    this.additionalOptionsSMS = !this.additionalOptionsSMS;

    if (this.tabelLabelsList.indexOf('selectSMS') > -1) {

      this.smsIcon = 'sms';
      this.tabelLabelsList = this.tabelLabelsList.filter(el => el != 'selectSMS');

    }
    else {

      this.deleteIcon = 'block';
      this.smsIcon = 'cancel';
      this.getSmsTemplates();
      this.tabelLabelsList.unshift('selectSMS');
    }

  }

  addSelectForBlockedColumn() {
    this.additionalOptionDelete = !this.additionalOptionDelete;

    // let listOfBlockedCards = this.dataTable.data.filter(el => el.StatusDescriptionRM == 'מבוטל');




    //close all that relevan for sms
    this.tabelLabelsList = this.tabelLabelsList.filter(el => el != 'selectSMS');
    this.additionalOptionsSMS = false;

    if (this.tabelLabelsList.indexOf('selectDeleteCards') > -1) {

      this.deleteIcon = 'block';

      this.tabelLabelsList = this.tabelLabelsList.filter(el => el != 'selectDeleteCards');

    }
    else {

      this.smsIcon = 'sms';
      this.deleteIcon = 'cancel';
      this.getSmsTemplates();
      this.tabelLabelsList.unshift('selectDeleteCards');
    }
  }

  smsTempleteSelect(event) {
    if (event.value != undefined) {

      // this.smsTemplatesData;
      this.previewSmsTemplate.setValue(this.smsTemplatesData.filter(el => el.Id == event.value)[0]['TemplateFormat']);
      //enable send sms button
      this.sendButtonSms = false;
    }
  }

  sendSMS() {

    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {


      let selectedRows = this.selection.selected;
      if (selectedRows.length > 0) {
        let selectedCards = [];
        let senderName = '';
        selectedRows.forEach(card => {
          selectedCards.push(card.Id)
        });

        let objToApi = {
          Token: this.userToken,
          TemplateId: this.smsTemplates.value,
          UserId: this.userId,
          OrderLineIds: selectedCards,
          CoreOrderId: this.orderId,
          From: this.smsTemplatesData.filter(el => el.Id == this.smsTemplates.value)[0]['SenderName']
        }


        this.dataService.SendSMSByOrderLine(objToApi).subscribe(result => {
          debugger
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
            data: { title: 'ההודעות נשלחות ברקע', message: this.previewSmsTemplate.value, subTitle: ' ההודעה נשלחה ל ' + selectedRows.length + ' נמענים ' }
          }).afterClosed().subscribe(result => {

            this.addSelectForSmsColumn();
          })


          // }
          // else {
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

      } else {
        this.errorSendSms = 'נא לבחור כרטיס';
        setTimeout(() => {
          this.errorSendSms = '';
        }, 2000)
      }
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: this.MsgList.readOnly }
      })
    }
  }
  voidCards() {

    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      let selectedRows = this.selection.selected;
      if (selectedRows.length > 0) {
        this.voidCardSpinner = true;
        let selectedCards = [];
        selectedRows.forEach(card => {
          selectedCards.push(card.CardId)
        });

        let objToApi = {
          Token: this.userToken,
          OrderId: this.orderId,
          UserId: this.userId,
          CardLst: selectedCards,
        }


        this.dataService.VoidCards(objToApi).subscribe(result => {

          this.voidCardSpinner = false;
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

          // if (result.obj == true && result.errdesc == 'OK') {
          this.GetCards();
          this.cardsDeletedMsg = 'נחסם בהצלחה';
          this.selection.clear();

          setTimeout(() => {
            this.cardsDeletedMsg = '';
          }, 2000);

          // }
          // if (result.errdesc != 'OK') {
          //   this.cardsDeletedMsg = result.errdesc;
          //   setTimeout(() => {
          //     this.cardsDeletedMsg = '';
          //   }, 2000)
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
        });

      } else {
        this.cardsDeletedError = 'נא לבחור כרטיס';
        setTimeout(() => {
          this.cardsDeletedError = '';
        }, 2000)
      }
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: this.MsgList.readOnly }
      })
    }
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

  excelFileExport() {

    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      let tableLabels = JSON.parse(JSON.stringify(this.tabelLabels));
      //let tableLabels = this.tabelLabels;
      let tableData = JSON.parse(JSON.stringify(this.dataTable.data));
      debugger


      //add another column to file if order created from excel file
      if (this.DigitalBatch != '' && this.DigitalBatch != undefined && this.orderType == this.OrderType.OrderByExcel) {
        tableLabels.push({ value: 'ValidationField', viewValue: 'שדה אימות' })
      }

      debugger
      if ((this.OrderCreatedFromExcel && this.orderHaveCards) || this.LoadingVoucherByExcelHavePhoneNumber) {
        tableLabels.splice(tableLabels.length, 0, { value: 'DSendLastSent', viewValue: 'נשלח לאחרונה' });
        // tableLabels.splice(3, 0, { value: 'DSendName', viewValue: 'שם נמען' });
        // tableLabels.splice(4, 0, { value: 'DSendPhone', viewValue: 'מספר נייד נמען' });
        //here

        // this.tabelLabelsList.splice(this.tabelLabelsList.length, 0, 'DSendLastSent');
        // this.tabelLabelsList.splice(3, 0, 'DSendName');
        // this.tabelLabelsList.splice(4, 0, 'DSendPhone');



      }



      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('ProductSheet');

      var worksheetArr = [];
      tableLabels.forEach(label => {
        worksheetArr.push({ header: label.viewValue, key: label.value, width: 20 });
      });

      worksheet.columns = worksheetArr;

      debugger
      for (let data of Object.values(tableData)) {
        for (let element of Object.keys(data)) {
          if (element == 'CardId') {
            data[element] = data[element] + '' + data['PinCode']
          }
          else if (element == 'active') {
            data[element] = data[element] == 1 ? 'פעיל' : 'חסום'
          }
          else if (element == 'DSendLastSent') {
            try {
              data[element] = this.formatDate(data[element]);
            }
            catch (err) { }
          }
        }
      }
      worksheet.addRows(tableData, "n")

      // let userData = JSON.parse(localStorage.getItem('user')).obj;
      let userData = this.customerData;

      //debugger
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, userData['FName'] + '_' + userData['LName'] + '_' + this.orderId + '.xlsx');
      })
    }
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
  GetCustomerById() {

    let objToApi = {
      Token: this.userToken,
      CustomerId: this.userId
    }
    this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {
      // if (result['Token'] != undefined || result['Token'] != null) {

      // if (typeof result == 'object' && result.obj != null) {
      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        // this.sharedService.exitSystemEvent();
        return false;
      }


      this.customerData = result.obj[0];
      // }
      // if (result.obj == null && result.errdesc != '') {
      //   this.dialog.open(DialogComponent, {
      //     data: { message: result.errdesc }
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

  goToOrder(orderId: number, customerId: number) {
    let Order = {
      orderId: orderId,
      customerId: customerId
    }

    this.urlSharingService.changeOrderType(this.orderType);
    this.urlSharingService.changeMessage(JSON.stringify(Order));
    this.router.navigate(['/public/order']);
  }


  goToCardInfo(cardId: number, userId: number) {
    let CardInfo = {
      cardId: cardId,
      userId: userId
    }

    this.urlSharingService.changeMessage(JSON.stringify(CardInfo));
    this.router.navigate(['/public/cardInfo']);
  }


  ngOnDestroy(): void {
    // this.urlParamDestroy.unsubscribe();
  }


  ngAfterViewInit() {
    if (this.dataTable) {
      this.dataTable.paginator = this.paginator;
      this.dataTable.sort = this.sort;
    }
  }
}
