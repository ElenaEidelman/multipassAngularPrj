import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { ChartDataSets, ChartOptions } from 'chart.js';
import { Label } from 'ng2-charts';
import { CustomerData } from '../Classes/customerData';
import { MsgList } from '../Classes/msgsList';
import { DataServiceService } from '../data-service.service';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { SharedService } from '../shared.service';




@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  userToken;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
                public dialog: MatDialog, 
                private dataService: DataServiceService,
                private sharedService: SharedService) { }

  // data table
  // public newOrderLabelForTable;
  public newOrderDataSource: MatTableDataSource<CustomerData>;  

  private labelTemp = [
    {value: 'UserName', viewValue: 'שם לקוח'},
    {value: 'UserId', viewValue: 'תז/ח.פ.'},
    {value: 'Total', viewValue: 'הזמנות'},
    {value: 'StatusDesc', viewValue: 'סטטוס'}
  ];
  public newOrderLabelForTable = [];
  
  public lastCustomersLabelForTable = [];
  private lastCustomersLabelTemp = [
      {value: 'UserName', viewValue: 'שם לקוח'},
      {value: 'CreationDate', viewValue: 'תאריך הצתרפות'},
      {value: 'StatusName', viewValue: 'סטטוס'}
    ];
  public lastCustomersDataSource: MatTableDataSource<any>;




 

  // data chart
  public newUsersChartData: ChartDataSets[];
  public newUsersChartLabel:Label[];

  public newOrdersChartData: ChartDataSets[];
  public newOrdersChartLabels:Label[];

  public hotOrdersChartData: ChartDataSets[];
  public hotOrdersChartLabels:Label[];

  public activeCustomersChartData: ChartDataSets[];
  public activeCustomersChartLabels:Label[];

  



  ngOnInit(): void {
    window.scroll(0,0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    this.GetHomeData();
  }

  GetHomeData(){

    let objToApi = {
      Token: this.userToken
    }



    this.dataService.GetHomeData(objToApi).subscribe(result => {
      if (result['Token'] != undefined || result['Token'] != null) {
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
          
          debugger
          //create tables
          this.createDisplayedColumns('newOrderLabelForTable', this.labelTemp);
          this.createDisplayedColumns('lastCustomersLabelForTable', this.lastCustomersLabelTemp);
          this.newOrderDataSource = new MatTableDataSource(result.obj[1]);
          this.lastCustomersDataSource = new MatTableDataSource(result.obj[5]);



          //create graphs

          //new users
          let usersData = result.obj[5].map(o => o.TotalOrders);
          let usersLabels = result.obj[5].map(o => o.UserName);
          this.newUsersChartData = [
            { data: usersData, label: 'סיכום הזמנות ללקוח' }
          ];
          this.newUsersChartLabel = usersLabels;
      
      
          //new orders
          let ordersData = result.obj[1].map(o => o.Total);
          let ordersLabels = result.obj[1].map(o => o.OrganizationName);
          this.newOrdersChartData = [
            { data: ordersData, label: 'הזמנות חדשות' }
          ];
          this.newOrdersChartLabels = ordersLabels;


          //hot orders
          let hotOrdersData = result.obj[7].map(o => o.Total);
          let hotOrdersLabels = result.obj[7].map(o => o.OrganizationName);
          this.hotOrdersChartData = [
            { data: hotOrdersData, label: 'הזמנות חמות' }
          ];
          this.hotOrdersChartLabels = hotOrdersLabels;
      
      
          //active users
          let activeUsersData = result.obj[9].map(o => o.Total);
          let activeUsersLabels = result.obj[9].map(o => o.OrganizationName);
          this.activeCustomersChartData = [
            { data: activeUsersData, label: 'לקוחות פעילים' }
          ];
          this.activeCustomersChartLabels = activeUsersLabels;
        }
      }
      else {
          this.dialog.open(DialogComponent, {
            data: {message: MsgList.exitSystemAlert}
          })
          this.sharedService.exitSystemEvent();
      }
    })
  }

  createDisplayedColumns(colObj, columns) {
    columns.forEach(el => {
      this[colObj].push(el.value);
    });
  }




  ngAfterViewInit() {
    if(this.newOrderDataSource != undefined){
      this.newOrderDataSource.paginator = this.paginator;
      this.newOrderDataSource.sort = this.sort;
    }
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.newOrderDataSource.filter = filterValue.trim().toLowerCase();

    if (this.newOrderDataSource.paginator) {
      this.newOrderDataSource.paginator.firstPage();
    }
  }

  returnHebTranslation(obj,value){
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  // openDialogNewOrder(){
  //   const dialogRef = this.dialog.open(DialogContentExampleDialog, {
  //     data: this.lastCustomersDataSource
  //   });

  //   dialogRef.afterClosed().subscribe(result => {
  //     console.log(`Dialog result: ${result}`);
  //   });
  // }

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