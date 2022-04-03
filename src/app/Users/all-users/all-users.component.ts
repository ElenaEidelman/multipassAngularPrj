import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table/';
import { Router } from '@angular/router';
import { CustomerData } from 'src/app/Classes/customerData';
import { MockData } from 'src/app/Classes/mockData';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';


@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.css']
})
export class AllUsersComponent implements OnInit {

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }

  MsgList = MsgList;
  MockData = MockData;

  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private urlSharingService: UrlSharingService,
    private router: Router) { }

  userToken;
  userId;

  filterCustomerForm = this.fb.group({
    customerId: (''),
    customerEmail: ['', Validators.email],
    orderStatus: ('')
  });

  //filter table by customer status
  statusList = [
    { value: 'nextTo', viewValue: 'ליד' },
    { value: 'pending', viewValue: 'ממתין לאישור' },
    { value: 'active', viewValue: 'פעיל' },
    { value: 'delayed', viewValue: 'מושהה' },
    { value: 'refused', viewValue: 'מסורב' }
  ];

  // customerLabelForTable = [
  //   {value: 'customerName', viewValue: 'שם לקוח'},
  //   {value: 'customerId', viewValue: 'תז/ח.פ.'},
  //   {value: 'orders', viewValue: 'הזמנות'},
  //   {value: 'status', viewValue: 'סטטוס'}
  // ];

  userLabelForTable = [
    { value: 'id', viewValue: 'מספר משתמש' },
    { value: 'FName', viewValue: 'שם' },
    { value: 'LName', viewValue: 'שם משפחה' },
    // { value: 'Tz', viewValue: 'מספר משתמש' },
    { value: 'role', viewValue: 'רמת הרשאה' },
    { value: 'Email', viewValue: 'דוא"ל' },
    { value: 'Phone', viewValue: 'טלפון' },
    { value: 'StatusDescription', viewValue: 'סטטוס' },
    { value: 'delUser', viewValue: 'מחיקת משתמש' }
  ];

  ngOnInit(): void {
    window.scroll(0, 0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));

    this.sharedService.pagesAccessLevel.next('');
    this.createDisplayedColumns(this.userLabelForTable);
    // this.createDataSourceForTable();

    this.getAllUsers();
  }

  getAllUsers() {

    ///api/AllUsers/GetAllUsers


    let objToApi = {
      Token: this.userToken
    }
    this.dataService.GetAllUsers(objToApi).subscribe(result => {

      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        this.sharedService.exitSystemEvent(result);
        return false;
      }
      // if (result['Token'] != undefined || result['Token'] != null) {
      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      this.dataSource.data = result.obj;
      // }
      // else {
      //   // this.dialog.open(DialogComponent, {
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // })
      //   this.sharedService.exitSystemEvent();
      // }
    });
  }

  createDisplayedColumns(columns) {
    columns.forEach(el => {
      this.displayedColumns.unshift(el.value);
    });

    //add additional column
    // this.displayedColumns.unshift('delUser');
    // this.displayedColumns.unshift('goToUser');
  }
  // createDataSourceForTable() {
  //   this.dataSource = new MatTableDataSource([
  //     { id: '2523', fullName: 'fName lName 1', empNumber: '1578569', permisLvl: 'lvl1', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: '' },
  //     { id: '2524', fullName: 'fName lName 2', empNumber: '1578569', permisLvl: 'lvl1', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: '' },
  //     { id: '2525', fullName: 'fName lName 3', empNumber: '1578569', permisLvl: 'lvl1', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: '' },
  //     { id: '2526', fullName: 'fName lName 4', empNumber: '1578569', permisLvl: 'lvl1', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: '' },
  //     { id: '2527', fullName: 'fName lName 5', empNumber: '1578569', permisLvl: 'lvl1', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: '' },
  //     { id: '2528', fullName: 'fName lName 6', empNumber: '1578569', permisLvl: 'lvl1', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: '' }
  //   ]);
  // }


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
  translateTitles() {
    document.querySelectorAll('.mat-paginator-page-size-label').forEach(title => {
      title.innerHTML = 'פריטים פר עמוד';
    });
  }

  deleteUser(user) {
    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      this.dialog.open(DialogConfirmComponent, {
        data: { message: 'האם לחסום ' + user.FName + ' ' + user.LName + '?', eventButton: 'לחסום' }
      }).afterClosed().subscribe(response => {
        if (response.result == 'yes') {

          let objToApi = {
            Token: this.userToken,
            BackUserId: user.id.toString()
          }

          this.dataService.DeleteSuspendBackOfficeUsers(objToApi).subscribe(result => {
            if (typeof result == 'string') {
              // this.dialog.open(DialogComponent, {
              //   data: { message: result }
              // })

              this.sharedService.exitSystemEvent(result);
              return false;
            }

            // if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            // if (result.errdesc.includes('User Deleted Successfully')) {
            this.getAllUsers();
            this.dialog.open(DialogComponent, {
              data: { message: 'משתמש נמחק בהצלחה' }
            });
            // }
            // else {
            //   this.dialog.open(DialogComponent, {
            //     data: { message: result.errdesc }
            //   });
            // }
            // }
            // else {
            //   // this.dialog.open(DialogComponent, {
            //   //   data: {message: MsgList.exitSystemAlert}
            //   // })
            //   this.sharedService.exitSystemEvent();
            // }
          });
        }
      });
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: MsgList.readOnly }
      })
    }
  }

  goToUser(userId: number) {
    let User = {
      userId: userId
    }
    this.urlSharingService.changeMessage(JSON.stringify(User));
    this.router.navigate(['/public/user']);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.translateTitles();
  }

}
