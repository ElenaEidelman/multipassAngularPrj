import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.css'],
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
export class NewCustomerComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private router: Router,
    private sharedService: SharedService,
    private dialog: MatDialog) { }

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @Input() IfComponentDialog = false;

  userToken: string;
  errorActionButtons: string = '';
  msgActionButtons: string = '';
  saveFormSpinner: boolean = false;

  statusList = [];

  MsgList = MsgList;

  newCustomerForm = this.fb.group({
    OrganizationName: ['', Validators.required], //Validators.required
    FName: (''),
    LName: (''),
    Email: ['', [Validators.email, Validators.required]], //Validators.required,
    Phone: ['',  [Validators.required, Validators.pattern('[[0][0-9]{9}]*')]],
    Permission: ['מנהל באק אופיס', Validators.required], // Validators.required
    Phone1: ['', Validators.pattern('[[0][0-9]{9}]*')],
    userNumber: [{ value: '', disabled: true }], //?
    CityName: (''),//v
    Streetno: (''),//v
    HouseNumber: (''), //-------------------------
    Entrance: (''),//v
    floor: (''), // -------------------------
    ApartmentNo: (''),//v
    ZIP: (''), // -----------------------
    StatusId: (''),
    // MultipassIclientID: (''),
    Tz: ['', Validators.required], //, Validators.required
    Notes: (''),
    BusinessFile: ('/test.txt') //must to be required Validators.required
  });

  rolesList = ['מנהל באק אופיס','מפעיל באק אופיס'];



  ngOnInit(): void {
    window.scroll(0, 0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getUserStatus();

    let test = this.IfComponentDialog;
    debugger
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
      

        let statusSet = this.statusList.filter(status => {
          return status.StatusId == 2;
        });

        this.newCustomerForm.get('StatusId').setValue(statusSet[0]['StatusId']);
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


  saveForm() {
    if (this.newCustomerForm.valid) {
      this.saveFormSpinner = true;
      
      let objToApi = {
        Token: this.userToken, //req
      }

      Object.keys(this.newCustomerForm.controls).forEach(control => {
        if (this.newCustomerForm.get(control).value != '' && control != 'StatusId') {
          objToApi[control] = this.newCustomerForm.get(control).value
        }
        else if(control == 'HouseNumber'){
          objToApi['Address'] = this.newCustomerForm.get(control).value;
        }
        else if(control == 'StatusId'){
        
          objToApi[control] = this.statusList.filter(status => status.StatusId == this.newCustomerForm.get(control).value)[0]['StatusId']
        }
      });

    
      debugger
      this.dataService.InsertUpdateUser(objToApi).subscribe(result => {
      debugger
        this.saveFormSpinner = false;
        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (typeof result == 'string') {
            this.errorActionButtons = result;

            setTimeout(() => {
              this.errorActionButtons = '';
            }, 3000);
          }
          if (typeof result == 'object' && result.obj != null) {
          
            this.msgActionButtons = 'לקוח חדש נשמר בהצלחה';

            setTimeout(() => {
              this.msgActionButtons = '';

              if(this.IfComponentDialog){
                this.dialog.closeAll();
              }
              else{
                this.router.navigate(['/public/customer/', result.obj[0].id]);
              }
            }, 2000);
          }
          if(result.obj == null && result.errdesc != ''){
            this.errorActionButtons = result.errdesc;

            setTimeout(() => {
              this.errorActionButtons = '';
            }, 3000);
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
    else {
      this.errorActionButtons = 'אנא מלא שדות חובה';

      setTimeout(() => {
        this.errorActionButtons = '';
      }, 3000);
    }
  }
}
