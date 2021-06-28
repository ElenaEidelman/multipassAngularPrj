import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';

export class CustomerData {
  organizationName: string;
  id: string;
  OrdersCount: string;
  StatusDescription: string;
  filterMsg: string = '';

  filterSpinner: boolean = true;
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
  dataSource = new MatTableDataSource([]);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  constructor(
              private fb: FormBuilder, 
              private dataService: DataServiceService, 
              private activeRoute: ActivatedRoute,
              public dialog: MatDialog) {}

  @ViewChild('closeSelect') closeSelect:any;  
  
  userToken;

  errorMsg: string = '';
  filterMsg: string = '';
  filterSpinner: boolean = false;

  idUnsubscribe;

  filterCustomerForm = this.fb.group({
    customerId: (''),
    customerEmail: ['', Validators.email],
    OrderStatus: ('')
  });

  statusList = new Set();
  allCustomersDataSpare;

  customerLabelForTable = [
    {value: 'organizationName', viewValue: 'שם לקוח'},
    {value: 'id', viewValue: 'תז/ח.פ.'},
    {value: 'OrdersCount', viewValue: 'סה"כ הזמנות'},
    {value: 'StatusDescription', viewValue: 'סטטוס'}
  ];


  ngOnInit(): void {
    window.scroll(0,0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    this.idUnsubscribe = this.activeRoute.params.subscribe(param => {
      if(param['id'] != undefined){
        this.filterCustomerForm.get('customerId').setValue(param['id']);
        this.filterTable();
      }
      else{
        this.createDisplayedColumns(this.customerLabelForTable);
        //this.createDataSourceForTable();
        this.getAllCustomers();
      }
    });
  }

  getAllCustomers(){
    this.filterSpinner = true;
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let objToApi = {
      Token: token
    }
    this.dataService.GetAllCustomers(objToApi).subscribe(result => {
      this.filterSpinner = false;
      if(typeof result == 'string'){
        this.errorMsg = result;
        setTimeout(()=>{
          this.errorMsg = '';
        },5000)
      }
      else{
        if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
          this.allCustomersDataSpare = result['obj'];
          this.dataSource.data = result['obj'];
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

  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.unshift(el.value);
    });

    //add additional column
    this.displayedColumns.unshift('newOrder');
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

  filterTable(){
    let fieldFilled: boolean = false;
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let objToApi = {
      Token : token,
    };
    Object.keys(this.filterCustomerForm.value).forEach(key => {
      if(this.filterCustomerForm.get(key).value != '' && this.filterCustomerForm.get(key).value != null){
        fieldFilled = true;
        objToApi[key] = this.filterCustomerForm.get(key).value;
      }
    })


    if(fieldFilled){
      this.filterSpinner = true;
      this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {
        this.filterSpinner = false;
        if(typeof result == 'string'){
          alert (result);
        }
        else{
          if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
            this.dataSource = new MatTableDataSource(result['obj']);
          }
          if(typeof result == 'object' &&  result['obj'] == null){
            this.dataSource.data = [];
            // this.errorMsg = 'No Data Found';
            setTimeout(()=>{
              this.errorMsg = '';
            },3000);
          }
        }
      });
    }
    else{
      this.filterMsg = 'נא למלא לפחות אחד מהשדות';
      setTimeout(() => {
        this.filterMsg = '';
      }, 3000);
    }
  }

  returnStatusList(){
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
      //debugger
    }

    return this.statusList;
  }

  recoverTable(){

    Object.keys(this.filterCustomerForm.controls).forEach(control => {
      this.filterCustomerForm.get(control).setValue('');
    });
    this.dataSource.data = this.allCustomersDataSpare;
  }

  resetStatusField(obj){
    // debugger
    this.filterCustomerForm.get('OrderStatus').setValue('');

  }

  closeMatSelect(){
    // debugger
    // this.closeSelect.open();  //to open the list  
    
    this.closeSelect.close();  //to close the list  
  }

  deleteCustomer(element){

    let oName = element.organizationName != undefined ? element.organizationName : element.OrganizationName;
    const dialogRef = this.dialog.open(DialogConfirmComponent,{
      data: {message: 'האם למחוק ' + oName + '?'}
    }).afterClosed().subscribe(response => {
      if(response.result == 'yes'){

        let objToApi = {
          Token: this.userToken,
          UserId: element.id.toString()
        }
  
        this.dataService.DeleteSuspendUsers(objToApi).subscribe(result => {
          if(result != undefined){
            if(result.obj != null){
              this.dialog.open(DialogComponent,{
                data: {message: 'נמחק בהצלחה'}
              });
            }
            if(result.errdesc != ''){
              this.dialog.open(DialogComponent,{
                data: {message: '--' + result.errdesc + '--'}
              });
            }
          }
        });
      }
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   debugger
    //   console.log(`Dialog result: ${result}`);
    // });

  }
  ngAfterViewInit() {
    if(this.dataSource != undefined){
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      debugger
    }

    // this.translateTitles();
  }
}
