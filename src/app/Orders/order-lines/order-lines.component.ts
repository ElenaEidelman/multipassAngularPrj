import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { SharedService } from 'src/app/shared.service';
import { SelectionModel } from '@angular/cdk/collections';
import { FormBuilder, FormControl } from '@angular/forms';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';

import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { debug, table } from 'console';
import { MsgList } from 'src/app/Classes/msgsList';


@Component({
  selector: 'app-order-lines',
  templateUrl: './order-lines.component.html',
  styleUrls: ['./order-lines.component.css']
})
export class OrderLinesComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  faFileExcel = faFileExcel;

  urlParamDestroy;
  userToken: string;
  userId;
  orderId;
  orderIdToPreview = '';

  tableSpinner: boolean = false;

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

  voidCardSpinner: boolean = false;

  OrderCreatedFromExcel: boolean = false;

  public dataTable = new MatTableDataSource([]);

  public tabelLabels = [
    { value: 'ItemId', viewValue: "מס''ד" },
    { value: 'CardId', viewValue: 'קוד דיגיטלי' },
    { value: 'DSendName', viewValue: 'שם נמען' },
    { value: 'DSendPhone', viewValue: 'מספר נייד נמען	' },
    { value: 'LoadSum', viewValue: 'סכום טעינה ראשוני		' },
    { value: 'ValidationDate', viewValue: '	תוקף	' },
    { value: 'KindOfLoadSumDesc', viewValue: 'סוג שובר טעינה	' },
    { value: 'DSendLastSent', viewValue: 'נשלח לאחרונה' }
  ];
  tabelLabelsList = ['ItemId', 'CardId', 'DSendName', 'DSendPhone', 'LoadSum', 'ValidationDate', 'KindOfLoadSumDesc', 'DSendLastSent'];

  selection = new SelectionModel<any>(true, []);


  constructor(
    private activeRoute: ActivatedRoute,
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private fb: FormBuilder) { }
  ngOnDestroy(): void {
    this.urlParamDestroy.unsubscribe();
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.urlParamDestroy = this.activeRoute.params.subscribe(param => {
      this.userId = param['userId'];
      this.orderId = param['orderId'];
      this.GetCards();
    });
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

    // this.dataTable = new MatTableDataSource([
    //   {ItemId:'1',CardId: '2',DSendName: '3', DSendPhone: '4', LoadSum: '5', ValidationDate: '6', KindOfLoadSumDesc: '7', DSendLastSent: '8'}
    // ]);
    
    this.dataService.GetCardsByOrderId(objToAPI).subscribe(result => {
      
      this.tableSpinner = false;

      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'object') {

          
          //order id to preview
          this.orderIdToPreview = result['obj'][2];
          
          this.dataTable.data = result['obj'][0];

          //DigitalBatch number, only if order created from excel
          this.OrderCreatedFromExcel = result['obj'][1] != '' ? true : false;
          this.DigitalBatch = result['obj'][1];

        }
        else {
          this.dialog.open(DialogComponent, {
            data: {message: result}
          })
        }
      }
      else {
        this.dialog.open(DialogComponent, {
          data: {message: MsgList.exitSystemAlert}
        })
        this.sharedService.exitSystemEvent();
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
      
      this.smsIcon = 'cancel';
      this.getSmsTemplates();
      this.tabelLabelsList.unshift('selectSMS');
    }

  }

  addSelectForBlockedColumn(){
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
      
      this.deleteIcon = 'cancel';
      this.getSmsTemplates();
      this.tabelLabelsList.unshift('selectDeleteCards');
    }
  }

  smsTempleteSelect(event){
    if(event.value != undefined){

      this.smsTemplatesData;
      this.previewSmsTemplate.setValue(this.smsTemplatesData.filter(el => el.Id == event.value)[0]['TemplateFormat']);
      //enable send sms button
      this.sendButtonSms = false;
    }
  }

  sendSMS(){
    let selectedRows = this.selection.selected;
    if(selectedRows.length > 0){
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
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (result.errdesc == 'OK') {
          
          this.dialog.open(DialogComponent, {
            data: {title: 'ההודעות נשלחות ברקע', message: this.previewSmsTemplate.value ,subTitle: ' ההודעה נשלחה ל ' + selectedRows.length  + ' נמענים '  }
          })
        }
        else{
          this.dialog.open(DialogComponent, {
            data: {message: result.errdesc}
          });
        }
      }
      else {
        this.dialog.open(DialogComponent, {
          data: {message: MsgList.exitSystemAlert}
        })
        this.sharedService.exitSystemEvent();
      }
    });

    }else{
      this.errorSendSms = 'נא לבחור כרטיס';
      setTimeout(()=> {
        this.errorSendSms = '';
      },2000)
    }
  }
  voidCards(){
    

    let selectedRows = this.selection.selected;
    if(selectedRows.length > 0){
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
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (result.obj == true && result.errdesc == 'OK') {
          this.cardsDeletedMsg = 'נחסם בהצלחה';
          setTimeout(()=>{
            this.cardsDeletedMsg = '';
          }, 2000);

          this.GetCards();
        }
        if(result.errdesc != 'OK'){
          this.cardsDeletedMsg = result.errdesc;
          setTimeout(()=>{
            this.cardsDeletedMsg = '';
          }, 2000)
        }
      }
      else if(typeof result == 'string'){
        this.dialog.open(DialogComponent, {
          data: {message: result}
        });
      }
      else {
        this.dialog.open(DialogComponent, {
          data: {message: MsgList.exitSystemAlert}
        })
        this.sharedService.exitSystemEvent();
      }
    });

    }else{
      this.cardsDeletedError = 'נא לבחור כרטיס';
      setTimeout(()=> {
        this.cardsDeletedError = '';
      },2000)
    }
  }

  getSmsTemplates(){

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
        this.dialog.open(DialogComponent, {
          data: {message: MsgList.exitSystemAlert}
        })
        this.sharedService.exitSystemEvent();
      }
    });
  }

  excelFileExport(){
    let tableLabels = this.tabelLabels;
    

    //add another column to file if order created from excel file
    if(this.DigitalBatch != ''){
      tableLabels.push({value: 'ValidationField', viewValue: 'שדה אימות'})
    }
    let tableData = JSON.parse(JSON.stringify(this.dataTable.data));;
    
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('ProductSheet');
 
    var worksheetArr = [];
    tableLabels.forEach(label => {
      worksheetArr.push({header: label.viewValue, key: label.value, width: 20});
    });

    worksheet.columns = worksheetArr;

    for(let data of Object.values(tableData)){
      for(let element of Object.keys(data)){
        if(element == 'CardId'){
          let oldData = data[element];
          data[element] = oldData + '' + data['PinCode']
        }
      }
    }
    worksheet.addRows(tableData, "n")
   
    let userData = JSON.parse(localStorage.getItem('user')).obj;
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, userData['Fname'] + '_' + userData['Lname']  + '_' + this.orderId + '.xlsx');
    })
  }


  ngAfterViewInit() {
    if (this.dataTable) {
      this.dataTable.paginator = this.paginator;
      this.dataTable.sort = this.sort;
    }
  }
}
