import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-exist-user',
  templateUrl: './exist-user.component.html',
  styleUrls: ['./exist-user.component.css']
})
export class ExistUserComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  userData;
  idUnsubscribe;
  id;
  fullNameUser;

  userToken;

  msgActionButtons: string = '';
  errorActionButtons: string = '';

  saveFormSpinner: boolean = false;
  deleteUserSpinner: boolean = false;

  MsgList= MsgList;

  statusList = [];

  userDataForm = this.fb.group({
    FName: (''), // new  V ---------FName
    LName: (''), // new  V ---------LName
    Email: ['', [Validators.required, Validators.email]],// -----------Email
    StatusId: (''), // -------------StatusDescription
    // Tz: (''),//מספר משתמש של המערכת -------------Tz
    // Id: (''),//מספר עובד -----------id
    Phone: ['', Validators.required],//------------Phone
    CityName: (''),// -----------CityName
    Phone1: (''),// ------------Phone1
    Streetno: (''),// ---------Streetno
    ZIP: (''),// --------ZIP
    Permission: [{value:'משתמש משרד אחורי', disabled: true}, Validators.required], // ---------------Permission
    ApartmentNo: ('')// ---------ApartmentNo
  });
  
  
  constructor(
                private activeRoute: ActivatedRoute, 
                private router: Router,
                private fb: FormBuilder, 
                private dataService: DataServiceService,
                private sharedService: SharedService,
                private dialog: MatDialog) { }

  ngOnInit(): void {
    window.scroll(0,0);
    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {

        this.id = param['id'];
        this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
        this.getUserStatus();
        this.getUserDataById(param['id']);

    })

  }

  getUserDataById(id){
    let objToApi = {
      Token: this.userToken,
      BackUserId: id
    }

    
    this.dataService.GetUsersByFilter(objToApi).subscribe(result => {
      
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if(result.obj != null && result.obj != undefined && Object.keys(result.obj[0]).length > 0){
          this.userData = result.obj[0];
          this.fillFormOfUserData(this.userData);
        }
        else{
          this.dialog.open(DialogComponent,{
            data: {message: result.errdesc}
          });
        }
      }
      else {
        this.dialog.open(DialogComponent,{
          data: {message: result.errdesc != undefined ? result.errdesc : result}
        });
        this.sharedService.exitSystemEvent();
      }
    });
  }

  getUserStatus(){
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

        if(result.obj != null && result.obj != undefined && Object.keys(result.obj).length > 0){
          
        this.statusList = [...result.obj];


        /**
         * Description: "ממתין לאישור"
          StatusId: 1
          StatusType: "PendingApproval"
         */
        }
      }
      else {
        this.dialog.open(DialogComponent,{
          data: {message: result.errdesc != undefined ? result.errdesc : result}
        });
        this.sharedService.exitSystemEvent();
      }
    })
  }

  fillFormOfUserData(user){
    Object.keys(this.userDataForm.controls).forEach(control => {
      if(control == 'StatusId'){
        let statusDesc = this.statusList.filter(status => status.StatusId == user.StatusId);
        this.userDataForm.get(control).setValue(statusDesc[0]['StatusId']);
      }
      if(control != 'Permission' && control != 'StatusId'){
        this.userDataForm.get(control).setValue(user[control]);
      }
    });
  }

  saveData(){

    if(this.userDataForm.valid){
      this.saveFormSpinner = true;
      let objToApi = {
        Token: this.userToken
      }

      Object.keys(this.userDataForm.controls).forEach(control => {
        if(this.userDataForm.get(control).value != ''){
          if(control == 'StatusId'){
            objToApi[control] = this.userDataForm.get(control).value;

          }
          else{
            objToApi[control] = this.userDataForm.get(control).value;
          }
        }
      });

      objToApi['OrganizationName'] = '';
      objToApi['BusinessFile'] = '';
      objToApi['BackOfficeUserId'] = this.id;

      
      this.dataService.InsertUpdateBackOfficeUsers(objToApi).subscribe(result => {
        
        this.saveFormSpinner = false;
        if (result['Token'] != undefined || result['Token'] != null) {
  
          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];
  
          if(result.obj != null && result.obj != undefined && Object.keys(result.obj[0]).length > 0){
            this.userData = result.obj[0];

            this.msgActionButtons = 'נשמר בהצלחה';
            setTimeout(()=>{
              this.msgActionButtons = '';
            }, 2000);

            // this.fillFormOfUserData(this.userData);
          }
          else{
            this.errorActionButtons = result.errdesc;
            setTimeout(()=>{
              this.errorActionButtons = '';
            }, 2000);
          }
        }
        else {
          this.dialog.open(DialogComponent,{
            data: {message: result.errdesc != undefined ? result.errdesc : result}
          });
          this.sharedService.exitSystemEvent();
        }
      });
    }
    else{
      this.errorActionButtons = 'נא למלא שדות חובה';
      setTimeout(()=>{
        this.errorActionButtons = '';
      }, 2000);
    }

  }

  deleteUser(){
    this.dialog.open(DialogConfirmComponent, {
      data: { message: 'האם למחוק ' + this.userData.FName + ' ' + this.userData.LName + '?' }
    }).afterClosed().subscribe(response => {
      if (response.result == 'yes') {
        let objToApi = {
          Token: this.userToken,
          BackUserId: this.userData.Id.toString()
        }
        
        this.dataService.DeleteSuspendBackOfficeUsers(objToApi).subscribe(result => {
          
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (result.errdesc.includes('User Deleted Successfully')) {

              this.dialog.open(DialogComponent, {
                data: { message: 'משתמש נמחק בהצלחה' }
              });
              this.router.navigate(['/public/allUsers']);
            }
            else {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
            }
          }
          else {
            this.dialog.open(DialogComponent,{
              data: {message: result.errdesc != undefined ? result.errdesc : result}
            });
            this.sharedService.exitSystemEvent();
          }
        });
      }
    });
  }

}
