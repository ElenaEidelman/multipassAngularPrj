import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';


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
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('openClose', [
      state('true', style({
        overflow: 'hidden',
        height: '*'
      })),
      state('false', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
      })),
      transition('false <=> true', animate('600ms ease-in-out'))
    ])
  ]
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
    private sharedService: SharedService,
    private urlSharingService: UrlSharingService,
    private router: Router) { }

  @ViewChild('closeSelect') closeSelect: any;

  userToken;

  errorMsg: string = '';
  filterMsg: string = '';
  filterSpinner: boolean = false;

  idUnsubscribe;
  MsgList = MsgList;

  filterCustomerForm = this.fb.group({
    customerTz: (''),
    OrganizationName: (''),
    customerEmail: ['', Validators.email],
    OrderStatus: ('')
  });

  statusList = [];

  allCustomersDataSpare;

  customerLabelForTable = [
    { value: 'organizationName', viewValue: 'שם לקוח' },
    { value: 'Tz', viewValue: 'תז/ח.פ.' },
    { value: 'OrderCount', viewValue: 'סה"כ הזמנות' },
    { value: 'StatusDescription', viewValue: 'סטטוס' },
    { value: 'Email', viewValue: 'מייל' }
  ];


  ngOnInit(): void {
    window.scroll(0, 0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    this.idUnsubscribe = this.activeRoute.params.subscribe(param => {
      if (param['id'] != undefined) {
        this.filterCustomerForm.get('customerTz').setValue(param['id']);
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

  getStatusList() {

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
          this.statusList = [...result.obj].sort(function (a, b) {
            if (a.Description < b.Description) { return -1; }
            if (a.Description > b.Description) { return 1; }
            return 0;
          });;
        }
      }
      else {
        // this.dialog.open(DialogComponent, {
        //   data: {message: MsgList.exitSystemAlert}
        // })
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

    this.dataService.GetAllCustomers(objToApi).subscribe(result => {
      debugger

      this.filterSpinner = false;
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {
          this.allCustomersDataSpare = result['obj'];
          this.dataSource.data = result['obj'].sort(function (a, b) {
            if (a.organizationName < b.organizationName) { return -1; }
            if (a.organizationName > b.organizationName) { return 1; }
            return 0;
          });

        }
        // if(typeof result == 'object' &&  result['obj'] == null){
        //   // this.errorMsg = 'No Data Found';
        //   setTimeout(()=>{
        //     this.errorMsg = '';
        //   },3000);
        // }
      }
      else if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        })
      }
      else {
        // this.dialog.open(DialogComponent, {
        //   data: {message: MsgList.exitSystemAlert}
        // })
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

        if (control == 'OrderStatus') {
          objToApi[control] = Array.of(this.filterCustomerForm.get(control).value);
        }
        else {
          objToApi[control] = this.filterCustomerForm.get(control).value;
        }
      }
    })


    if (fieldFilled) {
      this.filterSpinner = true;
      this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {
        this.filterSpinner = false;

        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];


          if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {
            this.dataSource = new MatTableDataSource(result['obj']);

            setTimeout(() => {
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
            }, 0);

          }
          if (typeof result == 'object' && result['obj'] == null) {
            this.dataSource.data = [];
            // this.errorMsg = 'No Data Found';
            setTimeout(() => {
              this.errorMsg = '';
            }, 3000);
          }

        }
        if (typeof result == 'string') {
          this.dialog.open(DialogComponent, {
            data: { message: result }
          });
        }
      });
    }
    else {
      this.filterMsg = MsgList.fillRequiredFields;
      setTimeout(() => {
        this.filterMsg = '';
      }, 3000);
    }
  }

  goToOrderCards(cardId, customerId) {
    //[routerLink]="['/public/orderCards',0,customerData.id]"

    let Card = {
      cardId: cardId,
      customerId: customerId
    }

    this.urlSharingService.changeMessage(JSON.stringify(Card));
    this.router.navigate(['/public/orderCards']);
  }

  recoverTable() {

    Object.keys(this.filterCustomerForm.controls).forEach(control => {
      this.filterCustomerForm.get(control).setValue('');
    });
    this.dataSource.data = this.allCustomersDataSpare;
  }

  resetStatusField(obj) {
    //
    this.filterCustomerForm.get('OrderStatus').setValue('');

  }

  closeMatSelect() {
    //
    // this.closeSelect.open();  //to open the list  

    this.closeSelect.close();  //to close the list  
  }

  deleteCustomer(element) {

    let oName = element.organizationName != undefined ? element.organizationName : element.OrganizationName;
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: { message: 'האם לחסום לקוח  ' + oName + '?', eventButton: 'לחסום' }
    }).afterClosed().subscribe(response => {
      if (response.result == 'yes') {

        let objToApi = {
          Token: this.userToken,
          UserId: element.id.toString()
        }

        this.dataService.DeleteSuspendUsers(objToApi).subscribe(result => {

          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (result.errdesc.includes('Successfully')) {
              this.getAllCustomers();
              this.dialog.open(DialogComponent, {
                data: { message: 'הלקוח נחסם בהצלחה' }
              });
            }
            else {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
            }
          }
          else {
            // this.dialog.open(DialogComponent, {
            //   data: {message: MsgList.exitSystemAlert}
            // })
            this.sharedService.exitSystemEvent();
          }
        });
      }
    });
  }

  goToCustomer(customerId: number) {
    let Customer = {
      customerId: customerId
    }
    this.urlSharingService.changeMessage(JSON.stringify(Customer));
    this.router.navigate(['/public/customer']);
  }

  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

    // this.translateTitles();
  }
}
