import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { MockData } from 'src/app/Classes/mockData';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';


@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.css'],
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
export class NewCustomerComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private router: Router,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private urlSharingService: UrlSharingService) { }

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @Input() IfComponentDialog = false;
  @Input() formNewCustomer = '';
  @Input() controllerNewCustomer = '';

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }

  userToken: string;
  errorActionButtons: string = '';
  msgActionButtons: string = '';
  saveFormSpinner: boolean = false;

  statusList = [];

  MsgList = MsgList;
  MockData = MockData;

  newCustomerForm = this.fb.group({
    OrganizationName: ['', [Validators.required, this.noWhitespaceValidator]], //Validators.required
    FName: (''),
    LName: (''),
    Email: ['', [Validators.required, Validators.email]], //Validators.required,
    Phone: ['', [Validators.required, Validators.pattern('[[0][0-9]{8,9}]*')]],//["", { validators: [Validators.required], updateOn: "blur" }]
    Permission: ['מנהל באק אופיס', Validators.required], // Validators.required
    Phone1: ['', [Validators.pattern('[[0][0-9]{8,9}]*')]],
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
  },
    { updateOn: "blur" }
  );

  rolesList = ['מנהל באק אופיס', 'מפעיל באק אופיס'];



  ngOnInit(): void {
    window.scroll(0, 0);
    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));

    this.sharedService.pagesAccessLevel.next('');
    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.newCustomerForm.disable()
    }
    debugger
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getUserStatus();
  }

  getUserStatus() {
    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetUserStatus(objToApi).subscribe(result => {
      if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        })

        this.sharedService.exitSystemEvent();
        return false;
      }
      // if (result['Token'] != undefined || result['Token'] != null) {
      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      // if (result.obj != null && result.obj != undefined && Object.keys(result.obj).length > 0) {

      this.statusList = [...result.obj].sort(function (a, b) {
        if (a.Description < b.Description) { return -1; }
        if (a.Description > b.Description) { return 1; }
        return 0;
      });

      let statusSet = this.statusList.filter(status => {
        return status.StatusId == 2;
      });

      this.newCustomerForm.get('StatusId').setValue(statusSet[0]['StatusId']);
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


  saveForm() {
    if (this.newCustomerForm.valid) {
      this.saveFormSpinner = true;

      let objToApi = {
        Token: this.userToken, //req
      }

      Object.keys(this.newCustomerForm.controls).forEach(control => {
        if (this.newCustomerForm.get(control).value != '' && control != 'StatusId' && control != 'HouseNumber') {
          objToApi[control] = this.newCustomerForm.get(control).value.trim();
        }
        else if (control == 'HouseNumber') {
          objToApi['Address'] = this.newCustomerForm.get(control).value.trim();
        }
        else if (control == 'StatusId') {

          objToApi[control] = this.statusList.filter(status => status.StatusId == this.newCustomerForm.get(control).value)[0]['StatusId']
        }
      });



      this.dataService.InsertUpdateUser(objToApi).subscribe(result => {

        this.saveFormSpinner = false;
        if (typeof result == 'string') {
          this.dialog.open(DialogComponent, {
            data: { message: result }
          })

          this.sharedService.exitSystemEvent();
          return false;
        }
        // if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        // if (result.err != -1) {

        //if have created new customer from dropdown menu from orderCards page
        if (this.formNewCustomer != '' && this.controllerNewCustomer != '') {
          let objForShare = {
            form: this.formNewCustomer,
            controller: this.controllerNewCustomer,
            createdCustomer: result.obj[0]
          }


          this.sharedService.newCustomerData.next(JSON.stringify(objForShare));

        }
        this.msgActionButtons = 'לקוח חדש נשמר בהצלחה';

        setTimeout(() => {
          this.msgActionButtons = '';

          if (this.IfComponentDialog) {
            this.dialog.closeAll();
          }
          else {
            // this.router.navigate(['/public/customer/', result.obj[0].id]);
            let Customer = {
              customerId: result.obj[0].id
            }
            this.urlSharingService.changeMessage(JSON.stringify(Customer));
            this.router.navigate(['/public/customer']);
          }
        }, 2000);
        // }
        // else {
        //   this.errorActionButtons = result.errdesc;

        //   setTimeout(() => {
        //     this.errorActionButtons = '';
        //   }, 3000);
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
      this.errorActionButtons = 'אנא מלא שדות חובה';

      setTimeout(() => {
        this.errorActionButtons = '';
      }, 3000);
    }
  }


  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}
