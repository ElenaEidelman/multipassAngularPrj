import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/shared.service';
import { resourceLimits } from 'worker_threads';

@Component({
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.css'],
  animations:[
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
export class NewUserComponent implements OnInit {

  

  @ViewChild(MatAccordion) accordion: MatAccordion;

  constructor(
                private activeRoute: ActivatedRoute, 
                private router: Router,
                private fb: FormBuilder, 
                private dataService: DataServiceService,
                private sharedService: SharedService,
                private dialog: MatDialog
              ) { }

  
  userData;
  idUnsubscribe;
  id;
  fullNameUser;

  userToken;

  msgActionButtons: string = '';
  errorActionButtons: string = '';

  saveFormSpinner: boolean = false;
  MsgList = MsgList;

  statusList = [];

  userDataForm = this.fb.group({
    FName: (''), // new  V ---------FName
    LName: (''), // new  V ---------LName
    Email: ['', [Validators.required, Validators.email]],// -----------Email
    StatusId: (''), // -------------StatusDescription
    // Tz: (''),//מספר משתמש של המערכת -------------Tz
    Id: (''),//מספר עובד -----------id
    Phone: ['', Validators.pattern('[0]{1}[0-9]{2,3}[0-9]{7}')],//------------Phone
    CityName: (''),// -----------CityName
    Phone1: ['', Validators.pattern('[0]{1}[0-9]{2,3}[0-9]{7}')],// ------------Phone1
    Streetno: (''),// ---------Streetno
    Permission: [{value:'מנהל בק אופיס', disabled: true}, Validators.required],
    ZIP: (''),// --------ZIP
    ApartmentNo: ('')// ---------ApartmentNo
  });


  ngOnInit(): void {
    window.scroll(0,0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getUserStatus();
  }

  saveData(){
    if(this.userDataForm.valid){
      this.saveFormSpinner = true;
      let objToApi = {
        Token: this.userToken
      }

      
      Object.keys(this.userDataForm.controls).forEach(control => {
        if(this.userDataForm.get(control).value != ''){
          objToApi[control] = this.userDataForm.get(control).value;
        }
      });
      objToApi['OrganizationName'] = '';
      objToApi['BusinessFile'] = '';

      
      this.dataService.InsertUpdateBackOfficeUsers(objToApi).subscribe(result => {
        this.saveFormSpinner = false;
        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];
          
          if(result.obj != undefined && result.obj != null && Object.keys(result.obj).length > 0){
            
            this.msgActionButtons = 'נשמר בהצלחה';

            setTimeout(()=>{
              this.msgActionButtons = '';
              this.router.navigate(['/public/user/', result.obj[0]['id']]);
            }, 2000)
          }
          else{
            this.errorActionButtons = result.errdesc;
            setTimeout(()=>{
              this.errorActionButtons = '';
            }, 2000)
          }

          //for user must to set id not description
          
        }
        else {
          // this.dialog.open(DialogComponent, {
          //   data: {message: MsgList.exitSystemAlert}
          // })
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
        this.userDataForm.get('StatusId').setValue(2);
        /**
         * Description: "ממתין לאישור"
          StatusId: 1
          StatusType: "PendingApproval"
         */
        }
      }
      else {
        // this.dialog.open(DialogComponent, {
        //   data: {message: MsgList.exitSystemAlert}
        // })
        this.sharedService.exitSystemEvent();
      }
    })
  }

}
