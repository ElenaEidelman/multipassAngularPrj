import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/shared.service';

export class CustomerData {
  organizationName: string;
  id: string;
  OrdersCount: string;
  StatusDescription: string;
  filterMsg: string = '';

  filterSpinner: boolean = true;
  constructor(organizationName: string, id: string, OrdersCount: string, StatusDescription: string) {
    this.organizationName = organizationName;
    this.id = id;
    this.OrdersCount = OrdersCount;
    this.StatusDescription = StatusDescription;

  }
}


@Component({
  selector: 'app-all-customers',
  templateUrl: './all-customers.component.html',
  styleUrls: ['./all-customers.component.css'],
  encapsulation: ViewEncapsulation.None
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
    public dialog: MatDialog,
    private sharedService: SharedService) { }

  @ViewChild('closeSelect') closeSelect: any;

  userToken;

  errorMsg: string = '';
  filterMsg: string = '';
  filterSpinner: boolean = false;

  idUnsubscribe;
  MsgList = MsgList;

  filterCustomerForm = this.fb.group({
    customerId: (''),
    customerEmail: ['', Validators.email],
    OrderStatus: ('')
  });

  statusList = [];

  allCustomersDataSpare;

  customerLabelForTable = [
    { value: 'organizationName', viewValue: 'שם לקוח' },
    { value: 'id', viewValue: 'תז/ח.פ.' },
    { value: 'OrdersCount', viewValue: 'סה"כ הזמנות' },
    { value: 'StatusDescription', viewValue: 'סטטוס' }
  ];


  ngOnInit(): void {
    window.scroll(0, 0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    this.idUnsubscribe = this.activeRoute.params.subscribe(param => {
      if (param['id'] != undefined) {
        this.filterCustomerForm.get('customerId').setValue(param['id']);
        this.filterTable();
      }
      else {
        this.createDisplayedColumns(this.customerLabelForTable);
        //this.createDataSourceForTable();
        this.getAllCustomers();
      }
    });
    this.getStatusList();
  }

  getStatusList(){

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetUserStatus(objToApi).subscribe(result => {
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
          this.statusList = [...result.obj];
        }
      }
      else {
        this.dialog.open(DialogComponent, {
          data: {message: result.errdesc}
        })
        this.sharedService.exitSystemEvent();
      }
    });
  }

  getAllCustomers() {
    this.dataSource.data = [];
    this.filterSpinner = true;
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let objToApi = {
      Token: token
    }
    debugger
    this.dataService.GetAllCustomers(objToApi).subscribe(result => {
      debugger
      this.filterSpinner = false;
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'string') {
          this.errorMsg = result;
          setTimeout(() => {
            this.errorMsg = '';
          }, 5000)
        }
        if (result.errdesc != '' && result.errdesc != null) {
          alert(result.errdesc);
        }
        if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {
          this.allCustomersDataSpare = result['obj'];
          this.dataSource.data = result['obj'];
        }
        // if(typeof result == 'object' &&  result['obj'] == null){
        //   // this.errorMsg = 'No Data Found';
        //   setTimeout(()=>{
        //     this.errorMsg = '';
        //   },3000);
        // }
      }
      else {
        debugger
        alert(result.errdesc);
        this.sharedService.exitSystemEvent();
      }
    });
  }

  createDisplayedColumns(columns) {
    columns.forEach(el => {
      this.displayedColumns.unshift(el.value);
    });

    //add additional column
    this.displayedColumns.unshift('newOrder');
  }



  returnHebTranslation(obj, value) {
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterTable() {
    let fieldFilled: boolean = false;
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let objToApi = {
      Token: token,
    };
    Object.keys(this.filterCustomerForm.controls).forEach(control => {
      if (this.filterCustomerForm.get(control).value != '' && this.filterCustomerForm.get(control).value != null) {
        fieldFilled = true;

        if(control == 'OrderStatus'){
          objToApi[control] = Array.of(this.filterCustomerForm.get(control).value);
        }
        else{
          objToApi[control] = this.filterCustomerForm.get(control).value;
        }
      }
    })


    if (fieldFilled) {
      this.filterSpinner = true;

      debugger
      this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {
        debugger
        this.filterSpinner = false;

        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (typeof result == 'string') {
            alert(result);
          }
          else {
            if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {
              this.dataSource = new MatTableDataSource(result['obj']);
            }
            if (typeof result == 'object' && result['obj'] == null) {
              this.dataSource.data = [];
              // this.errorMsg = 'No Data Found';
              setTimeout(() => {
                this.errorMsg = '';
              }, 3000);
            }
          }
        }
      });
    }
    else {
      this.filterMsg = 'נא למלא לפחות אחד מהשדות';
      setTimeout(() => {
        this.filterMsg = '';
      }, 3000);
    }
  }

  recoverTable() {

    Object.keys(this.filterCustomerForm.controls).forEach(control => {
      this.filterCustomerForm.get(control).setValue('');
    });
    this.dataSource.data = this.allCustomersDataSpare;
  }

  resetStatusField(obj) {
    // debugger
    this.filterCustomerForm.get('OrderStatus').setValue('');

  }

  closeMatSelect() {
    // debugger
    // this.closeSelect.open();  //to open the list  

    this.closeSelect.close();  //to close the list  
  }

  deleteCustomer(element) {

    let oName = element.organizationName != undefined ? element.organizationName : element.OrganizationName;
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { message: 'האם למחוק ' + oName + '?' }
    }).afterClosed().subscribe(response => {
      if (response.result == 'yes') {

        let objToApi = {
          Token: this.userToken,
          UserId: element.id.toString()
        }
        debugger
        this.dataService.DeleteSuspendUsers(objToApi).subscribe(result => {
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (result.errdesc.includes('User Deleted Successfully')) {
              this.getAllCustomers();
              this.dialog.open(DialogComponent, {
                data: { message: 'לקוח נמחק בהצלחה' }
              });
            }
            else {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
            }
          }
          else {
            alert(result.errdesc);
            this.sharedService.exitSystemEvent();
          }
        });
      }
    });
  }
  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    // this.translateTitles();
  }
}
