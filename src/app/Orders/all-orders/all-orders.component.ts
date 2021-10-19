import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { OrderData } from '../../Classes/OrderData';
import { DataServiceService } from 'src/app/data-service.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Route } from '@angular/compiler/src/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/shared.service';
import { element } from 'protractor';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { MsgList } from 'src/app/Classes/msgsList';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { UrlSharingService } from 'src/app/Services/url-sharing.service';




@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css'],
  animations:[
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
export class AllOrdersComponent implements OnInit, AfterViewInit, OnDestroy {


  constructor(
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private router: Router,
    private acivatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private urlSharingService: UrlSharingService
 ) { }

    faFileExcel = faFileExcel;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  //allOrders;
  displayedColumns: string[] = [];

  errorMsg: string = '';

  filterActionButtonSpinner: boolean = true;
  noTableData: boolean = false;

  activeRouteUnsubscribe;
  userId;
  statusListArr = [];
  MsgList = MsgList;


  //pattern="[a-zA-Z ]*"
  filterTableGroup = this.fb.group({
    OrganizationName: (''),
    CoreOrderId: (''),
    FromDate: (''),
    ToDate: (''),
    InitialAmount: (''),
    Status: (''),
    CrmOrderId: ('')
  });

  dataSource = new MatTableDataSource([]);
  dataSourceSpare = new MatTableDataSource([]);
  statusList = new Set();

  userToken: string;

  orderLabelForTable = [
    { value: 'idex', viewValue: 'מספר הזמנה' }, //v
    { value: 'OrganizationName', viewValue: 'שם הלקוח' },
    { value: 'Total', viewValue: 'שווי ההזמנה' },//v
    { value: 'CardsQty', viewValue: 'כמות שוברים בהזמנה' },
    { value: 'MDate', viewValue: 'תאריך יצירת הזמנה' },
    { value: 'ApproveDate', viewValue: 'תאריך שליחה' },//v
    { value: 'CrmOrderId', viewValue: 'מספר אסמכתא' },//v
    { value: 'Status', viewValue: 'סטטוס הזמנה' },
  ];


  ngOnInit() {
    window.scroll(0, 0);
    
    this.filterActionButtonSpinner = true;
    this.userToken = JSON.parse(localStorage.getItem('user')).Token
    this.getStatusList();
    this.createDisplayedColumns(this.orderLabelForTable);

    this.activeRouteUnsubscribe = this.acivatedRoute.params.subscribe(param => {
      this.userId = param['userId'];
      console.log(" this.userId", this.userId)
      if (param['customerName'] != undefined) {
        this.filterTableGroup.get('OrganizationName').setValue(param['customerName']);
        this.filterTable();
      }
      else {
        this.getOrdersList();
      }
    })

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
          debugger
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
  getOrdersList() {
    //

    
    this.filterActionButtonSpinner = true;
    let objToApi = {
      Token: this.userToken
    }

    this.filterActionButtonSpinner = true;
    //GetOrdersByFilter
    
    
    this.dataService.getAllOrders(objToApi).subscribe(result => {
      

      this.filterActionButtonSpinner = false;

      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        // JSON.parse(localStorage.getItem('user'))
        if (typeof result == 'object' && result.obj != null) {
          this.dataSourceSpare.data = result['obj'];
          this.dataSource.data = result['obj'];
          debugger
        }
        // if(result.errdesc == 'No Data Found'){
        //   this.noTableData = true;
        // }
        if (result.errdesc != null && result.errdesc != '') {
          this.dialog.open(DialogComponent, {
            data: {message: result.errdesc}
          });        
        }

      }
      else if(typeof result == 'string'){

      }
      else {
        // this.dialog.open(DialogComponent, {
        //   data: {message: MsgList.exitSystemAlert}
        // })
        this.sharedService.exitSystemEvent();
      }
    })
  }

  createDisplayedColumns(columns) {
    columns.forEach(el => {
      this.displayedColumns.push(el.value);
    });

    //add additional column
    this.displayedColumns.push('delC');
    //
  }

  deleteOrder(order) {
    
    this.dialog.open(DialogConfirmComponent, {
      data: { message: 'האם למחוק הזמנה מספר ' + ' ' + order.idex + ' ?' }
    }).afterClosed().subscribe(response => {

      if (response.result == 'yes') {

        ///api/InsertUpdateOrder/DeleteVoidOrder
        let objToApi = {
          Token: this.userToken,
          OrderId: order.id,
          UserID: order.UserId,
          OpCode: "delete"
        }

        
        this.dataService.DeleteVoidOrder(objToApi).subscribe(result => {
          
          if (result['Token'] != undefined) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            
            if (typeof result == 'object' && result.obj != null && Object.values(result.obj[0]).includes('Order is deleted Successfully')) {
              
              this.dialog.open(DialogComponent, {
                data: { message: 'ההזמנה נמחקה בהצלחה' }
              });

              this.dataSource.data = [];
              this.getOrdersList();
            }
            
            if(result.obj == null && result.errdesc != ''){
              
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
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
    })
  }

  blockOrder(order){
    
    this.dialog.open(DialogConfirmComponent, {
      data: { message: 'האם לחסום הזמנה מספר ' + ' ' + order.idex + ' ?', eventButton: 'לחסום' }
    }).afterClosed().subscribe(response => {

      if (response.result == 'yes') {
        ///api/InsertUpdateOrder/DeleteVoidOrder
        let objToApi = {
          Token: this.userToken,
          OrderId: order.id,
          UserID: order.UserId,
          OpCode: "delete"
        }

        
        this.dataService.DeleteVoidOrder(objToApi).subscribe(result => {
          
          if (result['Token'] != undefined) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            
            if (typeof result == 'object' && result.obj != null && result.errdesc.includes('Successfully')) {
              
              this.dialog.open(DialogComponent, {
                data: { message: 'ההזמנה נחסמה בהצלחה' }
              });

              this.dataSource.data = [];
              this.getOrdersList();
            }
            
            if(result.obj == null && result.errdesc != ''){
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
            }
          }
          else if(typeof result == 'string'){
            this.dialog.open(DialogComponent, {
              data: {message: result}
            })
          }
          else {
            // this.dialog.open(DialogComponent, {
            //   data: {message: MsgList.exitSystemAlert}
            // })
            this.sharedService.exitSystemEvent();
          }
        });
      }
    })
  }

  returnHebTranslation(obj, value) {
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  resetForm() {

    this.acivatedRoute.params.subscribe(param => {
      Object.keys(this.filterTableGroup.controls).forEach(control => {
        this.filterTableGroup.get(control).setValue('');
      });
      // this.filterTableGroup.reset();
      if (Object.keys(param).length > 0) {

        //for clear params from url
        this.router.navigate(['/public/allOrders']);
      }
      else {
        if (this.dataSourceSpare.data.length > 0) {
          this.dataSource.data = this.dataSourceSpare.data;
        }
        else {
          this.getOrdersList();
        }
      }
    });

  }

  filterTable() {
    this.noTableData = false;
    let inputSelected = false;

    let objToApi = {
      Token: this.userToken,
    }

    //fill obj to api
    Object.keys(this.filterTableGroup.controls).forEach(control => {
      if (this.filterTableGroup.get(control).value != null && this.filterTableGroup.get(control).value.toString() != '') {
        inputSelected = true;
          objToApi[control] = this.filterTableGroup.get(control).value;
        
      }
    });


    if (!inputSelected) {
      this.errorMsg = 'נא למלא לפחות אחת מהשדות';
      setTimeout(() => {
        this.errorMsg = '';
      }, 3000);
    }
    else {

      this.filterActionButtonSpinner = true;

      debugger
      this.dataService.GetOrdersByFilter(objToApi).subscribe(result => {
        debugger
        this.filterActionButtonSpinner = false;

        if (result['Token'] != undefined || result['Token'] != null && Object.keys(result.obj).length > 0) {
          if (typeof result == 'object' && result.obj != null) {
            this.dataSource.data = [...result['obj']];
          }

          if (result.errdesc == 'No Data Found') {
            this.noTableData = true;
            this.dataSource.data = [];
          }
        }
        else  if (typeof result == 'string') {
          this.errorMsg = result;

          setTimeout(() => {
            this.errorMsg = '';
          }, 3000);
        }
        else {
          // this.dialog.open(DialogComponent, {
          //   data: {message: MsgList.exitSystemAlert}
          // })
          this.sharedService.exitSystemEvent();
        }
      })
    }
  }

  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }


  // goToOrderPage(orderId, userId){

  //   this.urlSharingService.changeMessage('orderId:' + orderId + '-userId:' + userId );
  //   debugger

    
  // }
  ngOnDestroy() {
    this.activeRouteUnsubscribe.unsubscribe();
  }

}
