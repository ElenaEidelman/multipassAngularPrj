import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataServiceService } from 'src/app/data-service.service';

export class CustomerData {
  organizationName: string;
  id: string;
  OrdersCount: string;
  StatusDescription: string;
  constructor(organizationName: string, id: string, OrdersCount: string, StatusDescription: string){
    this.organizationName = organizationName;
    this.id = id;
    this.OrdersCount = OrdersCount;
    this.StatusDescription = StatusDescription;

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


  constructor(private fb: FormBuilder, private dataService: DataServiceService) {}

  errorMsg: string = '';

  filterCustomerForm = this.fb.group({
    customerId: (''),
    customerEmail: ['', Validators.email],
    orderStatus: ('')
  });

  //filter table by customer status
  // statusList = [
  //   {value: 'nextTo', viewValue: 'ליד'},
  //   {value: 'pending', viewValue: 'ממתין לאישור'},
  //   {value: 'active', viewValue: 'פעיל'},
  //   {value: 'delayed', viewValue: 'מושהה'},
  //   {value: 'refused', viewValue: 'מסורב'}
  // ];
  statusList = new Set();

  customerLabelForTable = [
    {value: 'organizationName', viewValue: 'שם לקוח'},
    {value: 'id', viewValue: 'תז/ח.פ.'},
    {value: 'OrdersCount', viewValue: 'סה"כ הזמנות'},
    {value: 'StatusDescription', viewValue: 'סטטוס'}
  ];


  ngOnInit(): void {
    window.scroll(0,0);
    this.createDisplayedColumns(this.customerLabelForTable);
    //this.createDataSourceForTable();
    this.getAllCustomers();
  }

  getAllCustomers(){
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let objToApi = {
      Token: token
    }
    //debugger
    this.dataService.GetAllCustomers(objToApi).subscribe(result => {
      if(typeof result == 'string'){
        this.errorMsg = result;
        setTimeout(()=>{
          this.errorMsg = '';
        },5000)
      }
      else{
        if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
          this.dataSource = new MatTableDataSource(result['obj']);
        }
        if(typeof result == 'object' &&  result['obj'] == null){
          this.errorMsg = 'No Data Found';
          setTimeout(()=>{
            this.errorMsg = '';
          },3000);
        }
      }
    });
  }

  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.unshift(el.value);
    });

    //add additional column
    this.displayedColumns.unshift('newOrder');
  }
  // createDataSourceForTable(){
  //   this.dataSource = new MatTableDataSource([
  //     new CustomerData('multipass1','11111','26','פעיל'),
  //     new CustomerData('multipass2','22222','2','ליד'),
  //     new CustomerData('multipass3','33333','3','ממתין לאישור'),
  //     new CustomerData('multipass4','44444','4','מסורב'),
  //     new CustomerData('multipass5','55555','5','מושהה'),
  //     new CustomerData('multipass6','66666','6','מושהה'),
  //     new CustomerData('multipass7','77777','26','פעיל'),
  //     new CustomerData('multipass8','88888','2','ליד'),
  //     new CustomerData('multipass9','99999','3','ממתין לאישור'),
  //     new CustomerData('multipass12','12121','4','מסורב'),
  //     new CustomerData('multipass13','13131','4','מושהה'),
  //     new CustomerData('multipass14','14141','6','מושהה'),
  //   ]);
  // }


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

  filterTable(){
    console.log(this.filterCustomerForm.value);
  }

  returnStatusList(){
    debugger
    if(this.dataSource != undefined){
      this.dataSource.data.forEach(data => {
        for(let el in data){
          if(el == 'StatusDescription'){
            this.statusList.add(data[el]);
          }
        }
      });
    }
    else{
      debugger
    }

    return this.statusList;
  }

  ngAfterViewInit() {
    if(this.dataSource != undefined){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    // this.translateTitles();
  }
}
