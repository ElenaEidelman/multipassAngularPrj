import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { formatDate } from '@angular/common';
// import { NativeDateAdapter, DateAdapter, MAT_DATE_FORMATS } from '@angular/material';



@Component({
  selector: 'app-all-orders',
  templateUrl: './all-orders.component.html',
  styleUrls: ['./all-orders.component.css']
})
export class AllOrdersComponent implements OnInit {

  allOrders;
  constructor(private fb: FormBuilder) { }

  Orders:any = [
    {orderId: 900000181, orderiDcrm: 12, companyName: 'מולטיפאס', comaxCustomerNumber: 12345, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-01-2021', dateActivation: '24/01/2021 13:44', orderValue: '400.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000182, orderiDcrm: 13, companyName: 'test', comaxCustomerNumber: 123456, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:24', dateIssue: '24-02-2021', dateActivation: '24/01/2021 13:45', orderValue: '401.00', orderStatus: 'נשלח לקומקס', orderStatusId: 1},
    {orderId: 900000183, orderiDcrm: 14, companyName: 'test name', comaxCustomerNumber: 123458, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:25', dateIssue: '24-03-2021', dateActivation: '24/01/2021 13:46', orderValue: '402.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000184, orderiDcrm: 15, companyName: 'test company', comaxCustomerNumber: 123457, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:26', dateIssue: '24-04-2021', dateActivation: '24/01/2021 13:47', orderValue: '403.00', orderStatus: 'נשלח לקומקס', orderStatusId: 1},
    {orderId: 900000185, orderiDcrm: 16, companyName: 'title company', comaxCustomerNumber: 123459, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:27', dateIssue: '24-05-2021', dateActivation: '24/01/2021 13:48', orderValue: '404.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000186, orderiDcrm: 17, companyName: 'company name', comaxCustomerNumber: 123450, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:28', dateIssue: '24-06-2021', dateActivation: '24/01/2021 13:49', orderValue: '405.00', orderStatus: 'הזמנה פתוחה' ,orderStatusId: 0},
    {orderId: 900000187, orderiDcrm: 18, companyName: 'test', comaxCustomerNumber: 12345, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-07-2021', dateActivation: '24/01/2021 13:50', orderValue: '406.00', orderStatus: 'הזמנה פתוחה', orderStatusId: 0},
    {orderId: 900000188, orderiDcrm: 12, companyName: 'מולטיפאס', comaxCustomerNumber: 12345, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-01-2021', dateActivation: '24/01/2021 13:44', orderValue: '400.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000189, orderiDcrm: 13, companyName: 'test', comaxCustomerNumber: 123456, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:24', dateIssue: '24-02-2021', dateActivation: '24/01/2021 13:45', orderValue: '401.00', orderStatus: 'נשלח לקומקס', orderStatusId: 1},
    {orderId: 900000190, orderiDcrm: 14, companyName: 'test name', comaxCustomerNumber: 123458, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:25', dateIssue: '24-03-2021', dateActivation: '24/01/2021 13:46', orderValue: '402.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000191, orderiDcrm: 15, companyName: 'test company', comaxCustomerNumber: 123457, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:26', dateIssue: '24-04-2021', dateActivation: '24/01/2021 13:47', orderValue: '403.00', orderStatus: 'נשלח לקומקס', orderStatusId: 1},
    {orderId: 900000192, orderiDcrm: 16, companyName: 'title company', comaxCustomerNumber: 123459, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:27', dateIssue: '24-05-2021', dateActivation: '24/01/2021 13:48', orderValue: '404.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000193, orderiDcrm: 17, companyName: 'company name', comaxCustomerNumber: 123450, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:28', dateIssue: '24-06-2021', dateActivation: '24/01/2021 13:49', orderValue: '405.00', orderStatus: 'הזמנה פתוחה' ,orderStatusId: 0},
    {orderId: 900000194, orderiDcrm: 18, companyName: 'test', comaxCustomerNumber: 12345, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-07-2021', dateActivation: '24/01/2021 13:50', orderValue: '406.00', orderStatus: 'הזמנה פתוחה', orderStatusId: 0}
  ];

  displayedColumns: string[] = ['orderId', 'orderiDcrm', 'companyName', 'comaxCustomerNumber','ticketCount','dateCreation','dateIssue','dateActivation','orderValue','orderStatus','delC'];

  displayedColumnsHeb = {
    'orderId' : 'מספר הזמנה', 
    'orderiDcrm' : 'מספר הזמנה CRM', 
    'companyName' : 'שם חברה', 
    'comaxCustomerNumber' : 'מספר לקוח קומקס',
    'comaxFileId' : 'מספר מסמך קומקס',
    'ticketCount' : 'כמות כרטיסים בהזמנה',
    'dateCreation' : 'תאריך יצירת הזמנה',
    'dateIssue' : 'תאריך הנפקה',
    'dateActivation' : '	תאריך אקטיבציה',
    'orderValue' : 'שווי ההזמנה',
    'orderStatus' : 'סטטוס הזמנה',
  }
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

  ngOnInit() {
    this.allOrders = this.Orders;
  }

  deleteOrder(order){
    this.Orders = this.Orders.filter(el => el['orderId'] != order.orderId);
    this.allOrders = this.Orders;
    //alert(order.orderId);
  }
  resetForm(){}
  filterTable(){
    //debugger
    console.log(this.filterTableGroup.value);
  }

}
