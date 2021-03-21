import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { OrderData } from '../../Classes/OrderData';
// import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';

// export class OrderData {
//   orderId: string;
//   orderiDcrm: number;
//   companyName: string;
//   comaxCustomerNumber: number;
//   comaxFileId: number;
//   ticketCount: number;
//   dateCreation: string;
//   dateIssue: string;
//   dateActivation: string;
//   orderValue: string;
//   orderStatus:string;
//   orderStatusId: number;


//   constructor(orderId: string, 
//               orderiDcrm: number, 
//               companyName: string, 
//               comaxCustomerNumber: number, 
//               comaxFileId: number, 
//               ticketCount: number, 
//               dateCreation: string,
//               dateIssue: string,
//               dateActivation: string,
//               orderValue: string,
//               orderStatus: string,
//               orderStatusId: number){
//     this.orderId = orderId;
//     this.orderiDcrm = orderiDcrm;
//     this.companyName = companyName;
//     this.comaxCustomerNumber = comaxCustomerNumber;
//     this.comaxFileId = comaxFileId;
//     this.ticketCount = ticketCount;
//     this.dateCreation = dateCreation;
//     this.dateIssue = dateIssue;
//     this.dateActivation = dateActivation;
//     this.orderValue = orderValue;
//     this.orderStatus = orderStatus;
//     this.orderStatusId = orderStatusId;

//   }
// }


@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css']
})
export class AllOrdersComponent implements OnInit {

  
  constructor(private fb: FormBuilder) { }
  //allOrders;
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<OrderData>;


  favoriteSeason: string;
  filterTableGroup = this.fb.group({
    companyName: (''),
    orderId: (''),
    fromData: (new Date()),
    untilData: (new Date()),
    initialChargeAmount: (''),
    comaxCustomerNumber: (''),
    comaxFileId: (''),
    orderStatus: (''),
    dateActIssGroup: ('dateIssue')

  });

  orderLabelForTable = [
    {value: 'orderId', viewValue: 'מספר הזמנה'},
    {value: 'orderiDcrm', viewValue: 'מספר הזמנה CRM'},
    {value: 'companyName', viewValue: 'שם חברה'},
    {value: 'comaxCustomerNumber', viewValue: 'מספר לקוח קומקס'},
    {value: 'comaxFileId', viewValue: 'מספר מסמך קומקס'},
    {value: 'ticketCount', viewValue: 'כמות כרטיסים בהזמנה'},
    {value: 'dateCreation', viewValue: 'תאריך יצירת הזמנה'},
    {value: 'dateIssue', viewValue: 'תאריך הנפקה'},
    {value: 'dateActivation', viewValue: 'תאריך אקטיבציה'},
    {value: 'orderValue', viewValue: 'שווי ההזמנה'},
    {value: 'orderStatus', viewValue: 'סטטוס הזמנה'},
  ];

  ngOnInit() {
    //this.allOrders = this.Orders;

    this.createDisplayedColumns(this.orderLabelForTable);
    this.createDataSourceForTable();
  }

  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.push(el.value);
    });

    //add additional column
    this.displayedColumns.push('delC');
    //debugger
  }
  createDataSourceForTable(){
    this.dataSource = new MatTableDataSource([
      new OrderData('1', 12345, 'multipass','11111', 1122, 1122, 5, '24/01/2021 13:23', '24/01/2021 13:23', '24/01/2021 13:23', '400.00', 'הזמנה סגורה' ,2),
      new OrderData('2',12345,'multipass2','22222',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה פתוחה',0),
      new OrderData('3',12345,'multipass3','33333',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה פתוחה',0),
      new OrderData('1',12345,'multipass4','44444',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','נשלח לקומקס',1),
      new OrderData('1',12345,'multipass5','55555',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','נשלח לקומקס',1),
      new OrderData('1',12345,'multipass6','66666',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה פתוחה',0),
      new OrderData('1',12345,'multipass7','77777',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','נשלח לקומקס',1),
      new OrderData('1',12345,'multipass8','88888',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה פתוחה',0),
      new OrderData('1',12345,'multipass9','99999',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass12','12121',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass13','13131',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass14','14141',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass15','15151',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass16','16161',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass17','17171',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass18','18181',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),

    ]);
  }
  deleteOrder(order){
    //this.dataSource = this.dataSource.filter(el => el['orderId'] != order.orderId);
    //this.allOrders = this.Orders;
    //alert(order.orderId);
  }
  returnHebTranslation(obj,value){
    return obj.filter(el => el.value == value)[0].viewValue;
  }
  resetForm(){}
  filterTable(){
    //debugger
    console.log(this.filterTableGroup.value);
  }

}
