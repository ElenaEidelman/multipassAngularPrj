import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MsgList } from 'src/app/Classes/msgsList';
import { OrderType } from 'src/app/Classes/OrderTypes';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';


@Component({
  selector: 'app-excel-file-view',
  templateUrl: './excel-file-view.component.html',
  styleUrls: ['./excel-file-view.component.css']
})
export class ExcelFileViewComponent implements OnInit, OnDestroy {

  OrderType = OrderType;
  constructor(
    private router: Router,
    private dataService: DataServiceService,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private urlSharingService: UrlSharingService
  ) { }

  excelData;
  // Policy;
  userToken: string;
  customerId;
  tableSource;
  tableLabels;
  excelFileData;
  orderType;
  createOrderSpinner: boolean = false;
  orderTypeObj = OrderType;

  ngOnInit(): void {

    window.scroll(0, 0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getExcelFile();
  }

  getExcelFile() {

    //let t = localStorage.getItem('excelFileData')
    if (localStorage.getItem('excelFileData') != '') {
      this.excelFileData = JSON.parse(localStorage.getItem('excelFileData'));
      this.customerId = this.excelFileData.customerId;
      this.excelData = JSON.parse(this.excelFileData.fileData).obj[0];
      // this.Policy = this.excelFileData.Policy;
      this.orderType = localStorage.getItem('OrderType');
      //debugger
      this.createTableToViewExcelFile(this.excelData);
    }
    else {
      this.router.navigate(['/public/home']);
    }
  }


  goToCreateOrder() {

    let t = this.orderType;
    debugger
    //object for insert orderLines

    this.createOrderSpinner = true;
    let formDataForOrdersLine = new FormData();
    formDataForOrdersLine.append('Token', this.userToken)
    formDataForOrdersLine.append('UserID', this.customerId)
    formDataForOrdersLine.append('OrderName', this.excelFileData.OrderName)
    formDataForOrdersLine.append('OpCode', 'create')
    formDataForOrdersLine.append('FileName', this.excelFileData.excelName)
    // formDataForOrdersLine.append('Policy', this.Policy)


    if (this.orderType != this.orderTypeObj.LoadingVoucherByExcel) {
      //debugger
      this.dataService.InsertUpdateOrderByExcel(formDataForOrdersLine).subscribe(result => {
        //debugger
        this.createOrderSpinner = false;

        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];


          if (result.obj != undefined && result.obj != null && Object.keys(result.obj).length > 0) {
            // this.urlSharingService.changeMessage('orderId:' + result.obj[0].orderid + '-' + 'customerId:' + this.customerId);

            let Order = {
              orderId: result.obj[0].orderid,
              customerId: this.customerId
            }

            this.urlSharingService.changeMessage(JSON.stringify(Order));
            this.urlSharingService.changeOrderType(this.orderType);
            //localStorage.setItem('OrderType', this.orderType);
            this.router.navigate(['/public/order/']);
          }

        }
        else {
          // this.dialog.open(DialogComponent, {
          //   data: { message: MsgList.exitSystemAlert }
          // })
          this.sharedService.exitSystemEvent(MsgList.exitSystemAlert);
        }
      });
    }
    else {
      debugger
      this.dataService.InsertUpdateBatchOrder(formDataForOrdersLine).subscribe(result => {
        debugger
        this.createOrderSpinner = false;

        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (result.err < 0) {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            })
            return false;
          }

          if (result.obj != undefined && result.obj != null && Object.keys(result.obj).length > 0) {
            // this.urlSharingService.changeMessage('orderId:' + result.obj[0].orderid + '-' + 'customerId:' + this.customerId);

            let Order = {
              orderId: result.obj[0].orderid,
              customerId: this.customerId
            }

            this.urlSharingService.changeMessage(JSON.stringify(Order));
            this.urlSharingService.changeOrderType(this.orderType);
            this.router.navigate(['/public/order/']);
          }

        }
        else {
          // this.dialog.open(DialogComponent, {
          //   data: { message: MsgList.exitSystemAlert }
          // })
          this.sharedService.exitSystemEvent(MsgList.exitSystemAlert);
        }
      });
    }

  }

  createTableToViewExcelFile(fileData) {
    // this.tableLabels = Object.keys(fileData[0]).filter(key => key != 'NewFileName');
    this.tableLabels = Object.keys(fileData[0]).filter(key => key == 'סכום' || key == "סה''כ" || key == 'כמות');

    this.tableSource = [...fileData];
  }

  cancelOrder() {
    switch (this.orderType) {
      case this.OrderType.OrderByExcel: this.router.navigate(['/public/orderCards']);
      case this.OrderType.LoadingVoucherByExcel: this.router.navigate(['/public/LoadingVouchers']);
    }

    // if (this.orderType = this.OrderType.OrderByExcel) {
    //   this.router.navigate(['/public/orderCards']);
    // }

  }
  ngOnDestroy() {
    localStorage.removeItem('excelFileData');
    localStorage.removeItem('OrderType');
  }
}
