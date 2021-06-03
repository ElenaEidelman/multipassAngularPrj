import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { OrderData } from '../../Classes/OrderData';
import { DataServiceService } from 'src/app/data-service.service';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { Route } from '@angular/compiler/src/core';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/shared.service';



@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css']
})
export class AllOrdersComponent implements OnInit, AfterViewInit {

  
  constructor(private fb: FormBuilder, private dataService: DataServiceService, private router: Router, private sharedService: SharedService) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  //allOrders;
  displayedColumns: string[] = [];



  favoriteSeason: string;
  filterTableGroup = this.fb.group({
    OrganizationName: (''),
    // customerId: (''),
    idex: (''),
    fromData: (''),
    untilData: (''),
    initialChargeAmount: (''),
    StatusDesc: (''),
    // dateActIssGroup: ('dateIssue')

  });

   dataSource = new MatTableDataSource([]);
   dataSourceSpare = new MatTableDataSource([]);
   statusList = new Set();

    orderLabelForTable = [
    {value: 'idex', viewValue: 'מספר הזמנה'},
    {value: 'OrganizationName', viewValue: 'שם הלקוח'},
    {value: 'Total', viewValue: 'שווי ההזמנה'},
    {value: 'ticketCount', viewValue: 'כמות שוברים בהזמנה'},
    {value: 'CreationDate', viewValue: 'תאריך יצירת הזמנה'},
    {value: 'ApproveDate', viewValue: 'תאריך שליחה'},
    {value: 'UserId', viewValue: 'מספר לקוח בהנה"ח'},
    {value: 'StatusDesc', viewValue: 'סטטוס הזמנה'},
  ];
  

  ngOnInit() {
    window.scroll(0,0);
    //this.allOrders = this.Orders;
    debugger
    this.getOrdersList();
    this.createDisplayedColumns(this.orderLabelForTable);
    //this.createDataSourceForTable();


  }

  getOrdersList(){
    let userToken = JSON.parse(localStorage.getItem('user')).Token;
    let dataArray = [];

    let objToApi = {
      Token: userToken
    }
    this.dataService.getAllOrders(objToApi).subscribe(result => {
      debugger
      if(result['Token'] != undefined){

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user',JSON.stringify(tempObjUser));

        JSON.parse(localStorage.getItem('user'))
        this.dataSourceSpare.data = result['obj'];
        this.dataSource.data = result['obj'];
      }
      else{
        this.sharedService.exitSystemEvent();
      }
    })
  }
  returnStatusList(){
    this.dataSource.data.forEach(data => {
      for(let el in data){
        if(el == 'StatusDesc'){
          this.statusList.add(data[el]);
        }
      }
    });
    return this.statusList;
  }
  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.push(el.value);
    });

    //add additional column
    this.displayedColumns.push('delC');
    //debugger
  }
  // createDataSourceForTable(){
  //   this.dataSource = new MatTableDataSource([
  //     // new OrderData('900000025', 12345, 'multipass','11111',1122, 5, '24/01/2021', '24/01/2021', '400.00', 'הזמנה סגורה' ,2),
  //     // new OrderData('900000026',12345,'multipass2','22222',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה פתוחה',0),
  //     // new OrderData('900000027',12345,'multipass3','33333',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה פתוחה',0),
  //     // new OrderData('900000028',12345,'multipass4','44444',1122,5,'24/01/2021','24/01/2021','400.00','מבוטלת',1),
  //     // new OrderData('900000029',12345,'multipass5','55555',1122,5,'24/01/2021','24/01/2021','400.00','מבוטלת',1),
  //     // new OrderData('900000030',12345,'multipass6','66666',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה פתוחה',0),
  //     // new OrderData('900000031',12345,'multipass7','77777',1122,5,'24/01/2021','24/01/2021','400.00','מבוטלת',1),
  //     // new OrderData('900000032',12345,'multipass8','88888',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה פתוחה',0),
  //     // new OrderData('900000033',12345,'multipass9','99999',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //     // new OrderData('900000034',12345,'multipass12','12121',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //     // new OrderData('900000035',12345,'multipass13','13131',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //     // new OrderData('900000036',12345,'multipass14','14141',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //     // new OrderData('900000037',12345,'multipass15','15151',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //     // new OrderData('900000038',12345,'multipass15','15151',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2)

  //   ]);
  // }
  deleteOrder(order){
    //this.dataSource = this.dataSource.filter(el => el['orderId'] != order.orderId);
    //this.allOrders = this.Orders;
    //alert(order.orderId);
  }
  returnHebTranslation(obj,value){
    return obj.filter(el => el.value == value)[0].viewValue;
  }
  resetForm(){
    this.dataSource.data = this.dataSourceSpare.data;
  }
  filterTable(){
    let filterList = this.filterTableGroup.value;
    //debugger
    this.dataSource.data = this.dataSourceSpare.data;

    let checkIfNumber;
    Object.keys(filterList).forEach(element => {
      if(filterList[element] != ''){
        checkIfNumber = +filterList[element] != NaN ? filterList[element] : +filterList[element];
        this.dataSource.data = this.dataSource.data.filter(data => data[element] == checkIfNumber);
      }
    });
  }

  // translateTitles(){
  //   document.querySelectorAll('.mat-paginator-page-size-label').forEach(title => {
  //     //title.innerHTML = 'פריטים פר עמוד';
  //   });
  //   document.querySelectorAll('.mat-paginator-range-label').forEach(title => {
  //     //debugger
  //     //title.innerHTML = title.innerHTML.replace('of','מ');
  //   });
  // }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    //this.translateTitles();
  }

}
