import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { CustomerData } from '../Classes/customerData';




@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  // data table
  public newOrderLabelForTable;
  public newOrderDataSource: MatTableDataSource<CustomerData>;  
  
  public lastCustomersLabelForTable;
  public lastCustomersDataSource: MatTableDataSource<any>;


 

  // data chart
  public newCustomersChartData: ChartDataSets[];
  public newCustomersChartLabels:Label[];

  public newOrdersChartData: ChartDataSets[];
  public newOrdersChartLabels:Label[];

  public hotOrdersChartData: ChartDataSets[];
  public hotOrdersChartLabels:Label[];

  public activeCustomersChartData: ChartDataSets[];
  public activeCustomersChartLabels:Label[];



  ngOnInit(): void {
    window.scroll(0,0);
    this.getTablesData();
    this.getChartsData();
  }

  getChartsData(){
    this.newCustomersChartData = [
      { data: [100000,200000,300000,400000,500000, 600000], label: 'סיכום הזמנות ללקוח' }
    ];
    this.newCustomersChartLabels = ['לקוח 1', 'לקוח 2' , 'לקוח 3' , 'לקוח 4' , 'לקוח 5' , 'לקוח 6'];



    this.newOrdersChartData = [
      { data: [8000, 4000, 2500, 7000, 200,5000, 4900], label: 'הזמנות חדשות' }
    ];
    this.newOrdersChartLabels = ['חברה 1', 'חברה 7', 'חברה 6', 'חברה 5', 'חברה 4', 'חברה 3', 'חברה 2'];
    

    this.hotOrdersChartData = [
      { data: [2000, 10000, 11000, 2300, 5000, 9000.11000], label: 'הזמנות חמות' }
    ];
    this.hotOrdersChartLabels = ['חברה 1', 'חברה 7', 'חברה 6', 'חברה 5', 'חברה 4', 'חברה 3', 'חברה 2'];


    this.activeCustomersChartData = [
      { data: [2000, 5000, 4000, 5500, 11000, 15000, 20000], label: 'לקוחות פעילים' }
    ];
    this.activeCustomersChartLabels = ['חברה 1', 'חברה 7', 'חברה 6', 'חברה 5', 'חברה 4', 'חברה 3', 'חברה 2'];

  }

  getTablesData(){
    this.newOrderLabelForTable = [
      {value: 'customerName', viewValue: 'שם לקוח'},
      {value: 'customerId', viewValue: 'תז/ח.פ.'},
      {value: 'orders', viewValue: 'הזמנות'},
      {value: 'status', viewValue: 'סטטוס'}
    ];
  
    this.newOrderDataSource = new MatTableDataSource([
      new CustomerData('multipass1','11111','26','פעיל'),
      new CustomerData('multipass2','22222','2','ליד'),
      new CustomerData('multipass3','33333','3','ממתין לאישור'),
      new CustomerData('multipass4','44444','4','מסורב'),
      new CustomerData('multipass5','55555','5','מושהה'),
      new CustomerData('multipass6','66666','6','מושהה'),
      new CustomerData('multipass7','77777','26','פעיל'),
      new CustomerData('multipass8','88888','2','ליד'),
      new CustomerData('multipass9','99999','3','ממתין לאישור'),
      new CustomerData('multipass12','12121','4','מסורב'),
      new CustomerData('multipass13','13131','4','מושהה'),
      new CustomerData('multipass14','14141','6','מושהה')
    ]);

    this.lastCustomersLabelForTable = [
      {value: 'companyName', viewValue: 'שם חברה'},
      {value: 'addDataDate', viewValue: 'תאריך הצתרפות'},
      {value: 'status', viewValue: 'סטטוס'}
    ];
  
    this.lastCustomersDataSource = new MatTableDataSource([
      {customerId: '11111',companyName: 'multipass1', addDataDate:'10/02/2021 13:52:36',status:'פעיל'},
      {customerId: '22222',companyName: 'multipass2', addDataDate:'10/03/2021 13:52:36',status:'פעיל'},
      {customerId: '33333',companyName: 'multipass3', addDataDate:'10/04/2021 13:52:36',status:'פעיל'},
      {customerId: '44444',companyName: 'multipass4', addDataDate:'10/05/2021 13:52:36',status:'פעיל'},
      {customerId: '55555',companyName: 'multipass5', addDataDate:'10/06/2021 13:52:36',status:'פעיל'},
      {customerId: '66666',companyName: 'multipass6', addDataDate:'10/07/2021 13:52:36',status:'פעיל'},
      {customerId: '77777',companyName: 'multipass7', addDataDate:'10/08/2021 13:52:36',status:'פעיל'},
      {customerId: '88888',companyName: 'multipass8', addDataDate:'10/08/2021 13:52:36',status:'פעיל'},
      {customerId: '99999',companyName: 'multipass9', addDataDate:'10/09/2021 13:52:36',status:'פעיל'},
      {customerId: '12121',companyName: 'multipass12', addDataDate:'10/10/2021 13:52:36',status:'פעיל'},
      {customerId: '13131',companyName: 'multipass13', addDataDate:'10/11/2021 13:52:36',status:'פעיל'},
    ]);
  }
  openDialogNewOrder(){
    const dialogRef = this.dialog.open(DialogContentExampleDialog, {
      data: this.lastCustomersDataSource
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}

export interface DialogData {
  data: string;
}

@Component({
  selector: 'dialog-content-example-dialog',
  templateUrl: './addOrderDialog.html',
  styleUrls: ['dialog.component.css']
})
export class DialogContentExampleDialog {
  constructor(public dialogRef: MatDialogRef<DialogContentExampleDialog>, @Inject(MAT_DIALOG_DATA) public data: DialogData){}

  faFileExcel = faFileExcel;
  selectedValue: string;
  // names  = [
  //   {value: 'steak-0', viewValue: 'Steak'},
  //   {value: 'pizza-1', viewValue: 'Pizza'},
  //   {value: 'tacos-2', viewValue: 'Tacos'}
  // ];

  dialogClose(){
    this.dialogRef.close();
  }
}