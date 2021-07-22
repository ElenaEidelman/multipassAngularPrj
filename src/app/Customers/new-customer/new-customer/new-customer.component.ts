import { Component, OnInit, ViewChild } from '@angular/core';
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
  styleUrls: ['./new-customer.component.css']
})
export class NewCustomerComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private router: Router,
    private sharedService: SharedService,
    private dialog: MatDialog) { }

  @ViewChild(MatAccordion) accordion: MatAccordion;

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
    Phone: ['', Validators.required],
    Permission: ['', Validators.required], // Validators.required
    Phone1: (''),
    userNumber: [{ value: '', disabled: true }], //?
    CityName: (''),//v
    Streetno: (''),//v
    HouseNumber: (''), //-------------------------
    Entrance: (''),//v
    floor: (''), // -------------------------
    ApartmentNo: (''),//v
    ZIP: (''), // -----------------------
    StatusId: [{ value: 'פעיל', disabled: true }],
    // MultipassIclientID: (''),
    Tz: ['', Validators.required], //, Validators.required
    Notes: (''),
    BusinessFile: ('/test.txt') //must to be required Validators.required
  });


  ngOnInit(): void {
    window.scroll(0, 0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
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
        else if(control == 'StatusId'){
          objToApi[control] = this.statusList.filter(status => status.Description == this.newCustomerForm.get(control).value)['StatusId']
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
            debugger
            this.msgActionButtons = 'לקוח חדש נשמר בהצלחה';

            setTimeout(() => {
              this.msgActionButtons = '';
              this.router.navigate(['/public/customer/', result.obj[0].id]);
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
          this.dialog.open(DialogComponent, {
            data: {message: result.errdesc}
          })
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
