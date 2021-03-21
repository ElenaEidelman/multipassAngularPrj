import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

export class CustomerData {
  customerName: string;
  customerId: string;
  orders: string;
  status: string;
  constructor(customerName: string, customerId: string, orders: string, status: string){
    this.customerName = customerName;
    this.customerId = customerId;
    this.orders = orders;
    this.status = status;

  }
}


@Component({
  selector: 'app-all-customers',
  templateUrl: './all-customers.component.html',
  styleUrls: ['./all-customers.component.css']
})
export class AllCustomersComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<CustomerData>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(private fb: FormBuilder) {}

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

  customerLabelForTable = [
    {value: 'customerName', viewValue: 'שם לקוח'},
    {value: 'customerId', viewValue: 'תז/ח.פ.'},
    {value: 'orders', viewValue: 'סה"כ הזמנות'},
    {value: 'status', viewValue: 'סטטוס'}
  ];


  ngOnInit(): void {
    this.createDisplayedColumns(this.customerLabelForTable);
    this.createDataSourceForTable();
  }

  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.unshift(el.value);
    });

    //add additional column
    this.displayedColumns.unshift('newOrder');
  }
  createDataSourceForTable(){
    this.dataSource = new MatTableDataSource([
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
      new CustomerData('multipass14','14141','6','מושהה'),
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
