import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { Workbook } from 'exceljs';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';
import * as fs from 'file-saver';
import { DataServiceService } from 'src/app/data-service.service';
import { SharedService } from 'src/app/Services/SharedService/shared.service';

@Component({
  selector: 'app-cards-list',
  templateUrl: './cards-list.component.html',
  styleUrls: ['./cards-list.component.css']
})
export class CardsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  faFileExcel = faFileExcel;

  constructor(
    private urlSharingService: UrlSharingService,
    private router: Router,
    private dataService: DataServiceService,
    private sharedService: SharedService) { }

  vouchersDataSource = null;
  displayedColumns: string[] = [];
  voucherData = null;
  spinner: boolean = true;
  // allVouchersData = null;

  voucherId;
  userToken;
  // TempCardsData = [
  //   { id: '1', masad: '1', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '2', masad: '2', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '3', masad: '3', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '4', masad: '4', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '5', masad: '5', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '6', masad: '6', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '7', masad: '7', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '8', masad: '8', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '9', masad: '9', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '10', masad: '11', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '11', masad: '11', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  //   { id: '12', masad: '12', cardId: '15983854', printNumber: '122345678-1234', magneticStipCoding: '12345678901234567901', validDate: '30/11/2027' },
  // ];

  cardsLabelForTable = [
    { value: 'Masad', viewValue: 'מסד' },
    { value: 'CardId', viewValue: 'מספר תו' },
    { value: 'BatchNum', viewValue: 'מספר להדפסה' },
    { value: 'PrintNumber', viewValue: 'קידוד פס מגנטי' },// no data !!!!
    { value: 'CardValidDate', viewValue: 'תוקף' },
  ];
  cardsLabelForLoad = [
    { value: 'CardId', viewValue: 'מספר תו' },
    { value: 'FirstName', viewValue: 'שם פרטי' },
    { value: 'LastName', viewValue: 'שם משפחה' },// no data !!!!
    { value: 'ChargeAmount', viewValue: 'סכום' },
    { value: 'PhoneNumber', viewValue: 'טלפון סלולרי' }
  ];

  ngOnInit(): void {
    window.scroll(0, 0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    // //debugger
    let urlParams = this.urlSharingService.messageSource.getValue();
    //let urlParams = '{"voucherData":[{"id":"1","Description":"giftCard","Count":"2","IssuanceDate":"02/11/2022","ValidDate":"02/11/2022","Excel":"http://test.co.il"}]}';
    if (urlParams == '') {
      this.router.navigate(['/public/IssuanceVouchers']);
    }
    else {
      this.urlSharingService.changeMessage('');
      this.voucherData = JSON.parse(urlParams)['voucherData'];
      //debugger
      // this.allVouchersData = JSON.parse(urlParams)['allVouchersData'];
      this.voucherId = JSON.parse(urlParams)['VoucherId'];
      //this.createTableData(this.TempCardsData);
      //debugger
      this.GetCardsListByIssuanceVoucherId(this.voucherId, this.voucherData[0].CardsCount);
    }
  }


  GetCardsListByIssuanceVoucherId(VoucherId: number, tempCardsCount: number) {
    debugger
    let objToApi = {
      Token: this.userToken,
      VoucherId: VoucherId,
      TempCardsCount: tempCardsCount

    }

    debugger
    this.dataService.GetCardsListByIssuanceVoucherId(objToApi).subscribe(result => {
      debugger
      if (typeof result == 'string') {

        this.sharedService.exitSystemEvent(result);
        return false;
      }

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];


      // this.cardsDataSource.data = result.obj;
      ////debugger
      this.createTableData(result.obj);
      this.spinner = false;
    });
  }

  createDisplayedColumns(columns) {
    columns.forEach(el => {
      this.displayedColumns.unshift(el.value);
    });
  }

  createTableData(obj) {
    this.vouchersDataSource = new MatTableDataSource([]);
    this.createDisplayedColumns(this.cardsLabelForTable);
    this.vouchersDataSource.data = obj;



    setTimeout(() => {
      this.vouchersDataSource.paginator = this.paginator;
      this.vouchersDataSource.sort = this.sort;
    }, 0);


  }

  returnHebTranslation(obj, value) {
    ////debugger
    return obj.filter(el => el.value == value)[0].viewValue;
  }


  excelFileExport() {


    let tableLabels = this.cardsLabelForTable;
    let tableData = JSON.parse(JSON.stringify(this.vouchersDataSource.data));

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('ProductSheet');

    var worksheetArr = [];
    tableLabels.forEach(label => {
      worksheetArr.push({ header: label.viewValue, key: label.value, width: 20 });
    });

    worksheet.columns = worksheetArr;

    //debugger
    // for (let data of Object.values(tableData)) {
    //   for (let element of Object.keys(data)) {
    //     // if (element == 'CardId') {
    //     //   let oldData = data[element];
    //     //   data[element] = oldData + '' + data['PinCode']
    //     // }
    //     // else if (element == 'active') {
    //     //   let oldData = data[element];
    //     //   data[element] = oldData == 1 ? 'פעיל' : 'חסום'
    //     // }
    //   }
    // }
    worksheet.addRows(tableData, "n")
    // 046417001
    // let userData = JSON.parse(localStorage.getItem('user')).obj;
    //let userData = this.customerData;

    //debugger
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, this.voucherData[0].IssuanceDescription.replaceAll(' ', '-') + '-table' + '.xlsx');
    })

  }
  excelFileExporforLoad() {


    let tableLabels = this.cardsLabelForLoad;
    let tableData = JSON.parse(JSON.stringify(this.vouchersDataSource.data));

    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet('ProductSheet');

    var worksheetArr = [];
    tableLabels.forEach(label => {
      worksheetArr.push({ header: label.viewValue, key: label.value, width: 20 });
    });
    worksheet.columns = worksheetArr;

    //debugger
    worksheet.addRows(tableData, "n");
    worksheet.views.reduceRight;
    //debugger
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, this.voucherData[0].IssuanceDescription.replaceAll(' ', '-') + '-order' + '.xlsx');
    })

  }

  backToVouchersIssuance() {
    // let VoucherData = {
    //   allVouchersData: this.allVouchersData
    // }
    // this.urlSharingService.changeMessage(JSON.stringify(VoucherData));
    this.router.navigate(['/public/IssuanceVouchers']);
  }
}
