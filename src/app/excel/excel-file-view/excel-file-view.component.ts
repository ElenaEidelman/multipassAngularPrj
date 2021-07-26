import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-excel-file-view',
  templateUrl: './excel-file-view.component.html',
  styleUrls: ['./excel-file-view.component.css']
})
export class ExcelFileViewComponent implements OnInit, OnDestroy {

  constructor(
              private router: Router
              ) { }
  excelData;
  userToken: string;
  customerId;
  tableSource;
  tableLabels;
  excelFileData;

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
    let localStorageObj = {
      UserID: this.customerId,
      FileName: this.excelFileData.excelName
    }
    localStorage.setItem('createOrderByExcel', JSON.stringify(localStorageObj));
    localStorage.removeItem('excelFileData');
    this.router.navigate(['/public/excelOrder/', this.customerId]);
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
