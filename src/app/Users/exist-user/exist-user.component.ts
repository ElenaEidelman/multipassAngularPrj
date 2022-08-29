import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { MockData } from 'src/app/Classes/mockData';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';


@Component({
  selector: 'app-exist-user',
  templateUrl: './exist-user.component.html',
  styleUrls: ['./exist-user.component.css']
})
export class ExistUserComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;
  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }

  userData;
  idUnsubscribe;
  id;
  fullNameUser;

  userToken;

  msgActionButtons: string = '';
  errorActionButtons: string = '';

  saveFormSpinner: boolean = false;
  deleteUserSpinner: boolean = false;

  MsgList = MsgList;
  MockData = MockData;

  statusList = [];
  roleList = [];

  userDataForm = this.fb.group({
    FName: ['', [Validators.required, this.noWhitespaceValidator]], // new  V ---------FName
    LName: ['', [Validators.required, this.noWhitespaceValidator]], // new  V ---------LName
    Email: ['', [Validators.required, Validators.email]],// -----------Email
    StatusId: (''), // -------------StatusDescription
    // Tz: (''),//מספר משתמש של המערכת -------------Tz
    // Id: (''),//מספר עובד -----------id
    Phone: ['', [Validators.required, Validators.pattern('[[0][0-9]{8,9}]*')]],//------------Phone
    CityName: (''),// -----------CityName
    Phone1: ['', [Validators.pattern('[[0][0-9]{8,9}]*')]],// ------------Phone1
    Streetno: (''),// ---------Streetno
    ZIP: (''),// --------ZIP
    Permission: [{ value: '' }, Validators.required], // ---------------Permission
    ApartmentNo: ('')// ---------ApartmentNo
  },
    { updateOn: "blur" });


  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private urlSharingService: UrlSharingService) { }

  ngOnInit(): void {
    window.scroll(0, 0);

    // this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
    let urlParams = this.urlSharingService.messageSource.getValue();
    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));

    this.sharedService.pagesAccessLevel.next('');
    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.userDataForm.disable();

    }
    if (urlParams == '') {
      this.router.navigate(['/public/allUsers']);
    }
    else {


      this.urlSharingService.changeMessage('');
      this.id = JSON.parse(urlParams)['userId'];
      this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

      this.getUserStatus();
      this.GetRoles();
      this.getUserDataById(this.id);
      // this.GetUserToRole(this.id);


    }
    // })

  }

  getUserDataById(id) {
    let objToApi = {
      Token: this.userToken,
      BackUserId: id
    }


    debugger
    this.dataService.GetUsersByFilter(objToApi).subscribe(result => {
      debugger
      if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        })

        // this.sharedService.exitSystemEvent();
        return false;
      }
      // if (result['Token'] != undefined || result['Token'] != null) {

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      // if (result.obj != null && result.obj != undefined && Object.keys(result.obj[0]).length > 0) {
      this.userData = result.obj[0];

      setTimeout(() => this.fillFormOfUserData(this.userData))
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

  getUserStatus() {
    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetUserStatus(objToApi).subscribe(result => {

      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        // this.sharedService.exitSystemEvent();
        return false;
      }

      // if (result['Token'] != undefined || result['Token'] != null) {
      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      // if (result.obj != null && result.obj != undefined && Object.keys(result.obj).length > 0) {

      this.statusList = [...result.obj];



      /**
       * Description: "ממתין לאישור"
        StatusId: 1
        StatusType: "PendingApproval"
       */
      // }
      // }
      // else {
      //   // this.dialog.open(DialogComponent, {
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // })
      //   this.sharedService.exitSystemEvent();
      // }
    })
  }

  // GetUserToRole(id) {

  //   let objToApi = {
  //     Token: this.userToken,
  //     UserId: id + ''
  //   }

  //   this.dataService.GetUserToRole(objToApi).subscribe(result => {

  //     // if (result['Token'] != undefined || result['Token'] != null) {

  //     //set new token
  //     let tempObjUser = JSON.parse(localStorage.getItem('user'));
  //     tempObjUser['Token'] = result['Token'];
  //     localStorage.setItem('user', JSON.stringify(tempObjUser));
  //     this.userToken = result['Token'];

  //     // if (result.err != -1) {
  //     //   if (Object.keys(result.obj).length > 0) {
  //     //     // this.userDataForm.get('Permission').setValue(result.obj[0]['CredentialId']);

  //     //     //disable select dropdown if user not admin
  //     //     // 
  //     //     // if (result.obj[0]['CredentialId'] != 1) {
  //     //     //   this.userDataForm.get('Permission').disable();
  //     //     // }
  //     //   }
  //     //   else {
  //     //     // this.userDataForm.get('Permission').setValue(3);
  //     //     // this.userDataForm.get('Permission').disable();
  //     //   }
  //     // }
  //     // else {
  //     //   this.dialog.open(DialogComponent, {
  //     //     data: { message: result.errdesc }
  //     //   })
  //     // }
  //     // }
  //     // else {

  //     //   this.sharedService.exitSystemEvent();
  //     // }
  //   })


  // }
  GetRoles() {

    let objToApi = {
      Token: this.userToken
    }


    this.dataService.GetRoles(objToApi).subscribe(result => {

      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        // this.sharedService.exitSystemEvent();
        return false;
      }
      // if (result['Token'] != undefined || result['Token'] != null) {

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      // if (result.err != -1) {

      this.roleList = result.obj;

      // }
      // else {
      //   this.dialog.open(DialogComponent, {
      //     data: { message: result.errdesc }
      //   })
      // }
      // }
      // else {

      //   this.sharedService.exitSystemEvent();
      // }
    })
    // this.roleList = [
    //   { RoleId: '1', Description: 'admin' },
    //   { RoleId: '2', Description: 'admin' },
    //   { RoleId: '3', Description: 'admin' },
    //   { RoleId: '4', Description: 'admin' },
    //   { RoleId: '5', Description: 'admin' }
    // ]
  }

  fillFormOfUserData(user) {
    debugger
    Object.keys(this.userDataForm.controls).forEach(control => {
      debugger
      if (control == 'StatusId') {
        let statusDesc = this.statusList.filter(status => status.StatusId == user.StatusId);

        let t = statusDesc[0]['StatusId'];
        this.userDataForm.get(control).setValue(statusDesc[0]['StatusId']);
      }
      if (control == 'Permission') {

        let t = this.roleList;

        this.userDataForm.get(control).setValue(this.roleList.filter(role => role.Id == user.Permission)[0]['Id']);
      }
      else {
        debugger
        this.userDataForm.get(control).setValue(user[control]);
      }
    });

    let t = this.userDataForm.value;

  }

  saveData() {

    if (this.userDataForm.valid) {
      this.saveFormSpinner = true;
      let objToApi = {
        Token: this.userToken
      }

      Object.keys(this.userDataForm.controls).forEach(control => {
        if (this.userDataForm.get(control).value != '') {
          if (control == 'StatusId') {
            objToApi[control] = this.userDataForm.get(control).value;

          }
          else {
            objToApi[control] = this.userDataForm.get(control).value != null ? this.userDataForm.get(control).value.toString().trim() : this.userDataForm.get(control).value;
          }
        }
      });

      objToApi['OrganizationName'] = this.userDataForm.get('FName').value + ' ' + this.userDataForm.get('LName').value;
      objToApi['BusinessFile'] = '';
      objToApi['BackOfficeUserId'] = this.id;



      this.dataService.InsertUpdateBackOfficeUsers(objToApi).subscribe(result => {

        this.saveFormSpinner = false;

        if (typeof result == 'string') {
          // this.dialog.open(DialogComponent, {
          //   data: { message: result }
          // })

          // this.sharedService.exitSystemEvent();
          return false;
        }
        // if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        // if (result.obj != null && result.obj != undefined && Object.keys(result.obj[0]).length > 0) {
        this.userData = result.obj[0];


        Object.keys(this.userDataForm.controls).forEach(control => {
          this.userDataForm.get(control).setValue(this.userData[control])
        })

        this.userDataForm.get('Permission').setValue(this.userData['role'])

        this.msgActionButtons = 'נשמר בהצלחה';
        setTimeout(() => {
          this.msgActionButtons = '';
        }, 2000);

        // this.fillFormOfUserData(this.userData);
        // }
        // else {
        //   this.errorActionButtons = result.errdesc;
        //   setTimeout(() => {
        //     this.errorActionButtons = '';
        //   }, 2000);
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
    else {
      this.errorActionButtons = 'נא למלא שדות חובה';
      setTimeout(() => {
        this.errorActionButtons = '';
      }, 2000);
    }

  }

  deleteUser() {
    this.dialog.open(DialogConfirmComponent, {
      data: { message: 'האם למחוק ' + this.userData.FName + ' ' + this.userData.LName + '?' }
    }).afterClosed().subscribe(response => {
      if (response.result == 'yes') {
        let objToApi = {
          Token: this.userToken,
          BackUserId: this.userData.Id.toString()
        }

        this.dataService.DeleteSuspendBackOfficeUsers(objToApi).subscribe(result => {

          if (typeof result == 'string') {
            // this.dialog.open(DialogComponent, {
            //   data: { message: result }
            // })

            // this.sharedService.exitSystemEvent();
            return false;
          }
          // if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          // if (result.errdesc.includes('User Deleted Successfully')) {

          this.dialog.open(DialogComponent, {
            data: { message: 'משתמש נמחק בהצלחה' }
          });
          this.router.navigate(['/public/allUsers']);
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

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}
