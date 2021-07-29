import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';

@Component({
  selector: 'app-excel-file-view',
  templateUrl: './excel-file-view.component.html',
  styleUrls: ['./excel-file-view.component.css']
})
export class ExcelFileViewComponent implements OnInit, OnDestroy {

  constructor(
              private router: Router,
              private dataService: DataServiceService,
              private dialog: MatDialog
              ) { }
  excelData;
  userToken: string;
  customerId;
  tableSource;
  tableLabels;
  excelFileData;
  createOrderSpinner: boolean = false;

  ngOnInit(): void {

    window.scroll(0,0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getExcelFile();
  }

  getExcelFile(){
    if(localStorage.getItem('excelFileData') != ''){
      this.excelFileData = JSON.parse(localStorage.getItem('excelFileData'));
      this.customerId = this.excelFileData.customerId;
      this.excelData = JSON.parse(this.excelFileData.fileData).obj;
      this.createTableToViewExcelFile(this.excelData);
    }
    else{
      this.router.navigate(['/public/home']);
    }
  }


  goToCreateOrder(){
    // let localStorageObj = {
    //   UserID: this.customerId,
    //   FileName: this.excelFileData.excelName
    // }
    // localStorage.setItem('createOrderByExcel', JSON.stringify(localStorageObj));
    // localStorage.removeItem('excelFileData');
    // this.router.navigate(['/public/excelOrder/', this.customerId]);


    // let forNewOrderData = JSON.parse(localStorage.getItem('createOrderByExcel'));

    //object for insert orderLines

    this.createOrderSpinner = true;
    let formDataForOrdersLine = new FormData();
    formDataForOrdersLine.append('Token', this.userToken)
    formDataForOrdersLine.append('UserID', this.customerId)
    formDataForOrdersLine.append('Description', this.excelFileData.excelName)
    formDataForOrdersLine.append('OpCode', 'create')

    this.dataService.InsertUpdateOrderByExcel(formDataForOrdersLine).subscribe(result => {
      this.createOrderSpinner = false;
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];


        if (result.obj != undefined && result.obj != null && Object.keys(result.obj).length > 0) {
          this.router.navigate(['/public/order/',  result.obj[0].orderid,this.customerId]);
        }

      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc != undefined ? result.errdesc : result }
        })
      }
    });
  }

  createTableToViewExcelFile(fileData){
    debugger
    // this.tableLabels = Object.keys(fileData[0]).filter(key => key != 'NewFileName');
    this.tableLabels = Object.keys(fileData[0]).filter(key => key == 'סכום' || key == "סה''כ" || key == 'כמות' );

    this.tableSource = [fileData[0]];
  }

  cancelOrder(){
    localStorage.getItem('excelFileData') != '';
    this.router.navigate(['/public/orderCards']);

  }
  ngOnDestroy(){
    localStorage.setItem('excelFileData', '');
  }
}
