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
  file;
  userToken: string;
  customerId;

  ngOnInit(): void {

    window.scroll(0,0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    debugger
    this.getExcelFile();
  }

  getExcelFile(){
    
    debugger
    if(localStorage.getItem('excelFileData') != ''){
      debugger
      let excelFileData = JSON.parse(localStorage.getItem('excelFileData'));
      this.customerId = excelFileData.customerId;
      debugger
      let objToApi = {
        Token: this.userToken,
        CustomerId: excelFileData.customerId,
        ExcelFileName: excelFileData.excelName
      }
    }
    else{
      this.router.navigate(['/public/home']);
    }

    

  }


  goToCreateOrder(){

    this.router.navigate(['/public/newOrder/', this.customerId]);
  }
  ngOnDestroy(){
    localStorage.setItem('excelFileData', '');
  }
}
