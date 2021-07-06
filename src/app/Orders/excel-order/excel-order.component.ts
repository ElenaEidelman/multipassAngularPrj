import { Route } from '@angular/compiler/src/core';
import { typeWithParameters } from '@angular/compiler/src/render3/util';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChildren, ViewEncapsulation } from '@angular/core';
import { tick } from '@angular/core/testing';
import { ControlContainer, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Data, Router, RouterModule } from '@angular/router';
import { resourceUsage } from 'process';
import { elementAt } from 'rxjs/operators';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { SharedService } from 'src/app/shared.service';
import { AlertMessage } from 'src/assets/alertMessage';

@Component({
  selector: 'app-excel-order',
  templateUrl: './excel-order.component.html',
  styleUrls: ['./excel-order.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class ExcelOrderComponent implements OnInit, OnDestroy, OnChanges {
    @ViewChildren('orderLinesChildren') orderLinesChildren;
  

  // OrderData;

  constructor(
                private activeRoute: ActivatedRoute, 
                private fb: FormBuilder, 
                private dataService: DataServiceService, 
                private sharedService: SharedService,
                private router: Router,
                private dialog: MatDialog) { }
  
  // insertOrderLineSpinner: boolean = false;
  // createCardsSpinner: boolean = false;
  // deleteCardsSpinner: boolean = false;


  errorMsg: string = '';
  orderMsg: string = '';
  orderMsgDelete: string = '';
  errorMsgDelete: string = '';
  addOrderLineErrMsg: string = '';

  excelOrder: boolean = false;
  //translate customer data value to hebrew
  CustomerLangObj = [
    {value: 'Fname', viewValue: 'שם'},
    {value: 'Lname', viewValue: 'שם משפחה'},
    {value: 'Tz', viewValue: 'ח.פ'},
    {value: 'Email', viewValue: 'מייל'},
    {value: 'Phone', viewValue: 'טלפון'},
    {value: 'Phone1', viewValue: 'טלפון נוסף'}
  ];

  Customer;

//orderDetail must contain one row with empty data
  orderDetails = [
    {id:0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem : 0}
  ];
 
  // displayedColumnsOrderDetails = ['id','QTY','LoadSum','ValidationDate','TotalForItem','additionalColumn'];

  orderDetailsUpdateForm = this.fb.group({});

  // columnsHeb = {
  //   'Quantity' : "כמות",
  //   'sum' : "סכום",
  //   'Total' : "סה''כ"
  // }

  columnsHeb = [
    {value: 'Quantity', viewValue: 'כמות'},
    {value: 'sum', viewValue: 'סכום'},
    {value: 'Total', viewValue: "סה''כ"}
  ];


  dataSource = new MatTableDataSource([]);

  dataByPage;

  orderId;
  customerId;
  idUnsubscribe;

  alertMessage: string = '';
  orderTitle = '';

  sendSuccess: boolean = false; 
  viewAddToExecOrderForm: boolean = true;

  totalTicketCount: number = 0;
  totalOrderSum: number = 0;

  userToken : string;

  orderDetailsTable;

  excelData;
  columnHeaders = [];
  displayedColumns: string[] = [];


  //for additional empty row foraddToExecOrderForm
  addToExecOrderForm = this.fb.group({
    ticketCount: ['', [Validators.required, Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    chargeAmount: ['', [Validators.required, Validators.min(1), Validators.max(1000), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    validity: [new Date(new Date().setDate(new Date().getDate() + 1)), Validators.required],
    TotalForItem: [{value: '', disabled: true}]
  });

  //מספר אסמכתה
  RefControl = new FormControl('');

  ngOnInit() {
    window.scroll(0,0);
    this.createDisplayedColumns(this.columnsHeb);


    window.scroll(0,0);

    let url = this.router.url;
    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
      this.userToken = JSON.parse(localStorage.getItem('user')).Token;

      let objToApi = {
        Token : this.userToken
      }

      //if order id received
      if(url.includes('order')){
        this.orderId = param['id'];
        this.customerId = param['customerId'];
        this.excelOrder = false;
        objToApi['CoreOrderID'] = this.orderId;

        debugger
        this.dataService.GetOrderDetails(objToApi).subscribe(result => {
         debugger
          if(typeof result == 'string'){
            alert(result);
          }
          else{
            if(result['Token'] != undefined){
  
              //set new token
              // let tempObjUser = JSON.parse(localStorage.getItem('user'));
              // tempObjUser['Token'] = result['Token'];
              // localStorage.setItem('user',JSON.stringify(tempObjUser));
    
              
              //
             // debugger
              this.dataByPage = result['obj'][0];
                  
              //get customer data
              this.Customer = result['obj'][0]['User'];
    
              //debugger
              this.dataSource = new MatTableDataSource(result['obj'][0]['Lines']);

              this.dataSource.data.forEach((element, index) => {
                debugger
                this.orderDetails.unshift(element);
              });
  
              this.orderDetailsTable = new MatTableDataSource(this.orderDetails);
              // this.setTitles();
              // this.totalData();
            }
            else{
              alert(JSON.stringify(result));
              // this.sharedService.exitSystemEvent();
            }
          }
        })
      }

      //if customer id recevied for new order
      if(url.includes('excelOrder')){
        this.customerId = param['customerId'];
        this.excelOrder = true;

        let objToApi  = {
          Token: this.userToken,
          CustomerId: param['customerId']
        }
        this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {
          debugger
          this.Customer = result.obj[0];
          this.dataByPage = result.obj[0];
        });
        
        let orderDetails = [{id:0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem : 0}];
        this.orderDetailsTable = new MatTableDataSource(orderDetails);
      }
    })
    
    this.RefControl.setValue(this.orderId);
    // this.totalData();
    this.sendCard();
    console.log("this.customerId",this.customerId);
    
  }

  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.unshift(el.value);
    });
  }

  sendCard(){
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    // console.log("this.userId",this.userId)
    let objToApi = {
      Token: token,
      UserID: this.customerId,
      OpCode: "upload",
      FileName: "NewdigitalOrderonevalue_210104025948.xls"
    }
    console.log("objToApi",objToApi)

    this.dataService.InsertUpdateOrderByExcel(objToApi).subscribe(result => {
      console.log("InsertUpdateOrderByExcel",result);
      debugger

      if(typeof result == 'string'){
        this.errorMsg = result;
        setTimeout(()=>{
          this.errorMsg = '';
        },5000)
      }
      else{
        if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
          // this.allCustomersDataSpare = result['obj'];
          this.dataSource.data = result['obj'][0];
          console.log(" this.dataSource.data", this.dataSource.data);

        }
        if(typeof result == 'object' &&  result['obj'] == null){
          // this.errorMsg = 'No Data Found';
          setTimeout(()=>{
            this.errorMsg = '';
          },3000);
        }
      }

    });
  }

  createCard(){
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    // console.log("this.userId",this.userId)
    let objToApi = {
      Token: token,
      UserID: this.customerId,
      OpCode: "create",
      FileName: "NewdigitalOrderonevalue_210104025948.xls"
    }
    console.log("objToApi",objToApi)

    this.dataService.InsertUpdateOrderByExcel(objToApi).subscribe(result => {
      console.log("InsertUpdateOrderByExcel",result);
      debugger

      if(typeof result == 'string'){
        this.errorMsg = result;
        setTimeout(()=>{
          this.errorMsg = '';
        },5000)
      }
      else{
        if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
          // this.allCustomersDataSpare = result['obj'];
          this.dataSource.data = result['obj'][0];
          console.log(" this.dataSource.data", this.dataSource.data);

        }
        if(typeof result == 'object' &&  result['obj'] == null){
          // this.errorMsg = 'No Data Found';
          setTimeout(()=>{
            this.errorMsg = '';
          },3000);
        }
      }

    });
  }

  returnHebTranslation(value){
    return this.CustomerLangObj.filter(el => el.value == value)[0].viewValue;
  }

  
  ngOnChanges(changes: SimpleChanges){

  }

  ngOnDestroy(){
    this.idUnsubscribe.unsubscribe();
  }

}
