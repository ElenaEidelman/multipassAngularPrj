import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MsgList } from 'src/app/Classes/msgsList';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';
import { DataServiceService } from 'src/app/data-service.service';
import * as fs from 'file-saver';
import { Workbook } from 'exceljs';

@Component({
  selector: 'app-vouchers-issuance',
  templateUrl: './vouchers-issuance.component.html',
  styleUrls: ['./vouchers-issuance.component.css']
})
export class VouchersIssuanceComponent implements OnInit {

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  userToken;
  MsgList = MsgList;
  // viewTable: boolean = false;
  maxToDate;
  fiveAndHalpYearsFromNow;
  viewForm: boolean = true;
  maxVouchersCount: number = 10000;
  minVouchersCount: number = 1;

  cardsDataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [];


  cardsLabelForTable = [
    { value: 'IssuanceDescription', viewValue: 'תיאור ההנפקה' },
    { value: 'CardsCount', viewValue: 'כמות כרטיסים בהנפקה ' },
    { value: 'CreationDate', viewValue: 'תאריך הנפקה ' },
    { value: 'VoucherValidDate', viewValue: 'תוקף הנפקה' },// no data !!!!
    { value: 'VoucherExcelFilePath', viewValue: ' ' },
    { value: 'VoucherExcelFileLoad', viewValue: ' ' }
  ];

  // validDatePickerDisabled: boolean = false;
  filterActionButtonSpinner: boolean = false;
  IssuanceVouchersForm = this.fb.group({
    Description: ['', Validators.required],
    VouchersCount: ['', [Validators.required, this.vouchersCountValidator(this.minVouchersCount, this.maxVouchersCount)]],
    ValidDate: [{ value: '', disabled: false }],
    CheckBoxNoValidation: [false]
  }
  );

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private urlSharingService: UrlSharingService,
    private dataService: DataServiceService,
    private sharedService: SharedService) { }

  ngOnInit(): void {
    window.scroll(0, 0);
    ////debugger
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.fiveAndHalpYearsFromNow = new Date().setFullYear(new Date().getFullYear() + 5, new Date().getMonth() + 6);
    this.IssuanceVouchersForm.get('ValidDate').setValue(new Date(this.fiveAndHalpYearsFromNow));
    this.maxToDate = new Date(this.fiveAndHalpYearsFromNow);
    ////debugger
    this.GetIssuanseVouchers();


    // let urlParams = this.urlSharingService.messageSource.getValue();
    // if (urlParams != '') {
    //   this.urlSharingService.changeMessage('');
    //   this.createTableData(JSON.parse(urlParams)['allVouchersData']);
    //   // this.viewTable = true;
    // }
    // else {
    //   //this.createTableData(this.tempTableData);
    //   this.GetIssuanseVouchers();
    // }



  }


  // vouchersCountValidator(control: AbstractControl): { [key: string]: boolean } | null {
  //   let value = (control.value).replaceAll(',', '');
  //   if (value !== undefined && (isNaN(value) || value < 0 || value > 10000)) {
  //     return { 'count': true };
  //   }
  //   return null;
  // }

  vouchersCountValidator(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | String => {
      let value = control.value != null ? (control.value).replaceAll(',', '') : undefined;
      if (value !== undefined && (isNaN(value) || control.value < min || value > max)) {
        return { 'count': true };
      }
      return '';
    };
  }

  // public noWhitespaceValidator(control: FormControl) {
  //   // //debugger
  //   const isWhitespace = (control.value || '').trim().length === 0;
  //   const isValid = !isWhitespace;
  //   return isValid ? null : { 'whitespace': true };
  // }

  GetIssuanseVouchers() {
    //this.createTableData(this.tempTableData);
    let objToApi = {
      Token: this.userToken
    }

    ////debugger
    this.dataService.GetIssuanceVouchers(objToApi).subscribe(result => {

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
    });
  }


  checkBoxvalue(event) {
    ////debugger
    this.IssuanceVouchersForm.get('CheckBoxNoValidation').setValue(event.checked);
    // this.validDatePickerDisabled = event.checked;
    this.IssuanceVouchersForm.get('ValidDate').setValue(event.checked ? '' : this.IssuanceVouchersForm.get('ValidDate').value);

    if (event.checked) {
      this.IssuanceVouchersForm.get('ValidDate').disable();
    }
    else {
      this.IssuanceVouchersForm.get('ValidDate').enable();
      this.IssuanceVouchersForm.get('ValidDate').setValue(new Date(this.fiveAndHalpYearsFromNow));
    }
  }
  MakeIssuanceVoucher() {
    if (this.IssuanceVouchersForm.valid) {
      const numberFormatter = Intl.NumberFormat('en-US');
      let msg: string = '';
      //let vouchersCount = numberFormatter.format(this.IssuanceVouchersForm.get('VouchersCount').value);
      let vouchersCount = this.IssuanceVouchersForm.get('VouchersCount').value;
      ////debugger
      if (this.IssuanceVouchersForm.get('ValidDate').value == '') {
        msg = 'האם ברצונך להנפיק ' + vouchersCount + ' כרטיסים ללא תוקף '
      }
      else {
        let vouchersValidDate = this.convertDateToNormalPreview(this.IssuanceVouchersForm.get('ValidDate').value);
        msg = 'האם ברצונך להנפיק ' + vouchersCount + ' כרטיסים בתוקף עד ה-' + vouchersValidDate;
      }

      this.dialog.open(DialogConfirmComponent, {
        data: { message: msg, eventButton: 'ביצוע הנפקה', closeNameButton: 'בטל' }
      }).afterClosed().subscribe(result => {

        if (result.result == 'yes') {
          this.filterActionButtonSpinner = true;

          let objToApi = {
            Token: this.userToken,
            IssuanceDescription: this.IssuanceVouchersForm.get('Description').value,
            CardsCount: (this.IssuanceVouchersForm.get('VouchersCount').value).replaceAll(',', ''),
            VoucherValidDate: this.IssuanceVouchersForm.get('ValidDate').value != '' ? this.convertDateToNormalPreview(this.IssuanceVouchersForm.get('ValidDate').value) : null,
            CreationDate: this.getCurrentDate()
          }


          debugger
          this.dataService.InsertIssuanceVouchers(objToApi).subscribe(result => {
            debugger
            this.filterActionButtonSpinner = false;
            if (result != undefined) {
              if (typeof result == 'string') {

                this.sharedService.exitSystemEvent(result);
                return false;
              }

              //set new token
              let tempObjUser = JSON.parse(localStorage.getItem('user'));
              tempObjUser['Token'] = result['Token'];
              localStorage.setItem('user', JSON.stringify(tempObjUser));
              this.userToken = result['Token'];

              debugger
              // this.cardsDataSource.data = result.obj;
              // this.createTableData(result.obj);

              //if vouchers created !!!! have to check true
              debugger
              if (result.obj.length > 0) {
                this.GetIssuanseVouchers();
                this.dialog.open(DialogComponent, {
                  data: { message: 'הנפקה של ' + vouchersCount + ' תווים בוצעה בהצלחה! ', subTitle: 'ההנפקה נוספה לרשימת ההנפקות' }
                }).afterClosed().subscribe(result => {
                  if (result.result == 'no') {
                    ////debugger

                    let This = this;
                    this.IssuanceVouchersForm.reset();
                    this.viewForm = false;
                    setTimeout(() => {
                      // //debugger
                      This.fiveAndHalpYearsFromNow = new Date().setFullYear(new Date().getFullYear() + 5, new Date().getMonth() + 6);
                      This.IssuanceVouchersForm.get('ValidDate').setValue(new Date(This.fiveAndHalpYearsFromNow));
                      This.IssuanceVouchersForm.get('ValidDate').enable();

                      This.IssuanceVouchersForm.get('VouchersCount').setValue('');
                      This.IssuanceVouchersForm.get('VouchersCount').setValidators([Validators.required, this.vouchersCountValidator(this.minVouchersCount, this.maxVouchersCount)]);

                      //This.IssuanceVouchersForm.get('Description').setValue('');
                      This.IssuanceVouchersForm.get('Description').setValidators([Validators.required]);


                      This.IssuanceVouchersForm.get('CheckBoxNoValidation').setValue(false);
                      This.viewForm = true;


                      // Description: ['', [Validators.required]],
                      // VouchersCount: ['', [Validators.required, this.vouchersCountValidator(this.minVouchersCount, this.maxVouchersCount)]],
                    }, 0)

                  }
                })


              }
            }

          }


          );



        }
      })


    }

  }

  createDisplayedColumns(columns) {
    ////debugger
    this.displayedColumns = [];
    columns.forEach(el => {
      this.displayedColumns.unshift(el.value);
    });
  }

  createTableData(obj) {
    this.cardsDataSource.data = [];
    this.createDisplayedColumns(this.cardsLabelForTable);
    this.cardsDataSource.data = obj;

    setTimeout(() => {
      this.cardsDataSource.paginator = this.paginator;
      this.cardsDataSource.sort = this.sort;
    }, 1000);
    // debugger
  }

  returnHebTranslation(obj, value) {
    ////debugger
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  convertDateToNormalPreview(dateOBJ) {
    let date = new Date(dateOBJ.toString());
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    let year = date.getFullYear();

    return day + '/' + month + '/' + year;
  }

  goToOrder(voucherId: number) {
    ////debugger
    let VoucherData = {
      voucherData: this.cardsDataSource.data.filter(voucher => voucher.VoucherId == voucherId.toString()),
      // allVouchersData: this.cardsDataSource.data,
      VoucherId: voucherId
    }
    this.urlSharingService.changeMessage(JSON.stringify(VoucherData));
    this.router.navigate(['/public/CardsList']);
  }

  excelFileExport(byId, voucherDesc, tempCardsCount) {
    let objToApi = {
      Token: this.userToken,
      VoucherId: byId,
      TempCardsCount: tempCardsCount

    }
    this.dataService.GetCardsListByIssuanceVoucherId(objToApi).subscribe(result => {
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
      //this.createTableData(result.obj);
      //this.spinner = false;
      //debugger

      let cardsLabelForExcel = [
        { value: 'Masad', viewValue: 'מסד' },
        { value: 'CardId', viewValue: 'מספר תו' },
        { value: 'PrintNumber', viewValue: 'מספר להדפסה' },
        { value: 'MagneticStripeCoding', viewValue: 'קידוד פס מגנטי' },// no data !!!!
        { value: 'CardValidDate', viewValue: 'תוקף' },
      ];



      let tableLabels = cardsLabelForExcel;
      let tableData = JSON.parse(JSON.stringify(result.obj));

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('ProductSheet');

      var worksheetArr = [];
      tableLabels.forEach(label => {
        worksheetArr.push({ header: label.viewValue, key: label.value, width: 20 });
      });

      worksheet.columns = worksheetArr;
      worksheet.addRows(tableData, "n")
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, voucherDesc.replaceAll(' ', '-') + '-table' + '.xlsx');
      })
    });




  }

  excelFileExporforLoad(byId, voucherDesc, tempCardsCount) {
    let objToApi = {
      Token: this.userToken,
      VoucherId: byId,
      TempCardsCount: tempCardsCount

    }
    this.dataService.GetCardsListByIssuanceVoucherId(objToApi).subscribe(result => {
      if (typeof result == 'string') {

        this.sharedService.exitSystemEvent(result);
        return false;
      }

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      let cardsLabelForExcel = [
        { value: 'CardId', viewValue: 'מספר תו' },
        { value: 'FirstName', viewValue: 'שם פרטי' },
        { value: 'LastName', viewValue: 'שם משפחה' },// no data !!!!
        { value: 'ChargeAmount', viewValue: 'סכום' },
        { value: 'PhoneNumber', viewValue: 'טלפון סלולרי' }
      ];



      let tableLabels = cardsLabelForExcel;
      let tableData = JSON.parse(JSON.stringify(result.obj));

      let workbook = new Workbook();
      let worksheet = workbook.addWorksheet('ProductSheet');

      var worksheetArr = [];
      tableLabels.forEach(label => {
        worksheetArr.push({ header: label.viewValue, key: label.value, width: 20 });
      });

      worksheet.columns = worksheetArr;
      worksheet.addRows(tableData, "n")
      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, voucherDesc.replaceAll(' ', '-') + '-order' + '.xlsx');
      })
    });




  }

  getCurrentDate() {
    let date = new Date();
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    let year = date.getFullYear();

    return day + '/' + month + '/' + year;
  }
}
