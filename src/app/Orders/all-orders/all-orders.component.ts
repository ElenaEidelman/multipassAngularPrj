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




@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css']
})
export class AllOrdersComponent implements OnInit, AfterViewInit, OnDestroy {

  
  constructor(
              private fb: FormBuilder, 
              private dataService: DataServiceService, 
              private router: Router, 
              private acivatedRoute: ActivatedRoute,
              private sharedService: SharedService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  //allOrders;
  displayedColumns: string[] = [];

  errorMsg: string = '';

  filterActionButtonSpinner: boolean = true;
  noTableData: boolean = false;

  activeRouteUnsubscribe;

  statusListArr = [];


  filterTableGroup = this.fb.group({
    OrganizationName: (''),
    CoreOrderId: (''),
    FromDate: (''),
    ToDate: (''),
    InitialAmount: (''),
    Status: (''),
  });

   dataSource = new MatTableDataSource([]);
   dataSourceSpare = new MatTableDataSource([]);
   statusList = new Set();

   userToken: string;

    orderLabelForTable = [
    {value: 'idex', viewValue: 'מספר הזמנה'}, //v
    {value: 'OrganizationName', viewValue: 'שם הלקוח'},
    {value: 'Total', viewValue: 'שווי ההזמנה'},//v
    {value: 'CardsQty', viewValue: 'כמות שוברים בהזמנה'},
    {value: 'MDate', viewValue: 'תאריך יצירת הזמנה'},
    {value: 'ApproveDate', viewValue: 'תאריך שליחה'},//v
    {value: 'UserId', viewValue: 'מספר לקוח בהנה"ח'},//v
    {value: 'Status', viewValue: 'סטטוס הזמנה'},
  ];
  

  ngOnInit() {
    window.scroll(0,0);

    this.filterActionButtonSpinner = true;
    this.userToken = JSON.parse(localStorage.getItem('user')).Token
    this.getStatusList();
    this.createDisplayedColumns(this.orderLabelForTable);

    this.activeRouteUnsubscribe = this.acivatedRoute.params.subscribe(param => {
      if(param['customerName'] != undefined){
        this.filterTableGroup.get('OrganizationName').setValue(param['customerName']);
        this.filterTable();
      }
      else{
        this.getOrdersList();    
      }
    })

  }

  getStatusList(){
    //api/Orders/GetOrdersStatus
    //Token

    let objToApi={
      Token: this.userToken
    }

    this.dataService.GetOrdersStatus(objToApi).subscribe(result => {
      debugger
      if(typeof result == 'object' && result.obj != null){
        this.statusListArr = [...result.obj];
      }
    });


  }
  getOrdersList(){
    this.filterActionButtonSpinner = true;
    let objToApi = {
      Token: this.userToken
    }

    //getAllOrders
    //GetOrdersByFilter
    this.filterActionButtonSpinner = true;
    this.dataService.GetOrdersByFilter(objToApi).subscribe(result => {
      debugger

      this.filterActionButtonSpinner = false;
      if(result['Token'] != undefined){

        //set new token
        // let tempObjUser = JSON.parse(localStorage.getItem('user'));
        // tempObjUser['Token'] = result['Token'];
        // localStorage.setItem('user',JSON.stringify(tempObjUser));

        // JSON.parse(localStorage.getItem('user'))
        if(typeof result == 'object' && result.obj != null){
          this.dataSourceSpare.data = result['obj'];
          this.dataSource.data = result['obj'];
        }
        if(result.errdesc == 'No Data Found'){
          this.noTableData = true;
        }

      }
      else{
        alert(result);
        // this.sharedService.exitSystemEvent();
      }
    })
  }
  // returnStatusList(){
  //   this.dataSource.data.forEach(data => {
  //     debugger
  //     for(let el in data){
  //       if(el == 'StatusDesc'){
  //         this.statusList.add(el);
  //       }
  //     }
  //   });
  //   return this.statusList;
  // }

  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.push(el.value);
    });

    //add additional column
    this.displayedColumns.push('delC');
    //debugger
  }

  deleteOrder(order){

    debugger

        ///api/InsertUpdateOrder/DeleteVoidOrder
        let objToApi = {
          Token: this.userToken,
          OrderId: order.id,
          UserID: order.UserId,       
           OpCode:"delete"
      
        }
        this.dataService.DeleteVoidOrder(objToApi).subscribe(result => {
         if(typeof result == 'object' && Object.values(result.obj[0]).includes('Order is deleted Successfully')){

          alert(result.obj[0]);
          this.getOrdersList();
         }
         if(typeof result == 'string'){

         }
        });
  }

  returnHebTranslation(obj,value){
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  resetForm(){

    this.acivatedRoute.params.subscribe(param => {
      this.filterTableGroup.reset();
      if(Object.keys(param).length > 0){
 
        //for clear params from url
        this.router.navigate(['/public/allOrders']);
      }
      else{
        if(this.dataSourceSpare.data.length > 0){
          this.dataSource.data = this.dataSourceSpare.data;
        }
        else{
          this.getOrdersList();
        }
      }
    });

  }
  filterTable(){

    this.noTableData = false;
    let filterList = this.filterTableGroup.value;
    let inputSelected = false;

    let objToApi = {
      Token: this.userToken,
    }

    //fill obj to api
    debugger
    Object.keys(filterList).forEach(element => {
      if(filterList[element]!= null && filterList[element].toString() != ''){
        inputSelected = true;
        objToApi[element] = filterList[element];
      }
    });


    if(!inputSelected){
      this.errorMsg = 'נא למלא לפחות אחד מהשדות';
      setTimeout(()=>{
        this.errorMsg = '';
      },3000);
    }
    else{

      this.filterActionButtonSpinner = true;

      debugger
      this.dataService.GetOrdersByFilter(objToApi).subscribe(result => {
        debugger
        this.filterActionButtonSpinner = false;
        if(typeof result == 'object' && result.obj != null){
          this.dataSource.data = [...result['obj']];
        }

        if(result.errdesc == 'No Data Found'){
          this.noTableData = true;
          this.dataSource.data = [];
        }
        if(typeof result == 'string'){
          this.errorMsg = result;

          setTimeout(() => {
            this.errorMsg = '';
          }, 3000);
        }
      })
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(){
    this.activeRouteUnsubscribe.unsubscribe();
  }

}
