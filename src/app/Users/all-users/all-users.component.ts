import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table/';
import { CustomerData } from 'src/app/Classes/customerData';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.css']
})
export class AllUsersComponent implements OnInit {

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(private fb: FormBuilder) { }

  filterCustomerForm = this.fb.group({
    customerId: (''),
    customerEmail: ['', Validators.email],
    orderStatus: ('')
  });

  //filter table by customer status
  statusList = [
    {value: 'nextTo', viewValue: 'ליד'},
    {value: 'pending', viewValue: 'ממתין לאישור'},
    {value: 'active', viewValue: 'פעיל'},
    {value: 'delayed', viewValue: 'מושהה'},
    {value: 'refused', viewValue: 'מסורב'}
  ];

  // customerLabelForTable = [
  //   {value: 'customerName', viewValue: 'שם לקוח'},
  //   {value: 'customerId', viewValue: 'תז/ח.פ.'},
  //   {value: 'orders', viewValue: 'הזמנות'},
  //   {value: 'status', viewValue: 'סטטוס'}
  // ];

  userLabelForTable = [
    {value: 'id', viewValue: 'Id'},
    {value: 'fullName', viewValue: 'שם מלא'},
    {value: 'empNumber', viewValue: 'מספר עובד'},
    {value: 'email', viewValue: 'דוא"ל'},
    {value: 'phone', viewValue: 'טלפון'},
    {value: 'status', viewValue: 'סטטוס'},
    {value: 'delUser', viewValue: 'מחיקת משתמש'}
  ];

  ngOnInit(): void {
    this.createDisplayedColumns(this.userLabelForTable);
    this.createDataSourceForTable();
  }

  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.unshift(el.value);
    });

    //add additional column
    // this.displayedColumns.unshift('delUser');
    // this.displayedColumns.unshift('goToUser');
  }
  createDataSourceForTable(){
    this.dataSource = new MatTableDataSource([
      {id: '2523', fullName: 'fName lName 1', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2524', fullName: 'fName lName 2', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2525', fullName: 'fName lName 3', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2526', fullName: 'fName lName 4', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2527', fullName: 'fName lName 5', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2528', fullName: 'fName lName 6', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''}
    ]);
  }


  returnHebTranslation(obj,value){
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  translateTitles(){
    document.querySelectorAll('.mat-paginator-page-size-label').forEach(title => {
      title.innerHTML = 'פריטים פר עמוד';
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.translateTitles();
  }

}
