import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataServiceService } from 'src/app/data-service.service';
import { ActivatedRoute, RouterLinkActive } from '@angular/router';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../shared.service';
import { MsgList } from '../Classes/msgsList';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ReportsComponent implements OnInit, AfterViewInit {

  elementTitle: string = 'דוחות';
  formErrorMsg: string = '';
  userToken;
  userId;
  unsubscribeId;
  errorMsg = '';
  customers;
  indexId;
  ScheduleDate;
  fDate;
  tDate;
  newTime;
  report1;
  checkBoxValue: boolean = false;
  MsgList = MsgList;
  Report1FormView: boolean = true;
  Report2FormView: boolean = true;
  Report3FormView: boolean = true;


  Report1Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Loading",
    FDate: [{ value: '', disabled: false }, Validators.required],
    TDate: [{ value: '', disabled: false }, Validators.required],
    CustomerEmail: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
    ScheduleDate: [{ value: '', disabled: false }, Validators.required],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ value: '', disabled: false }, Validators.required],
    UserId: [{ value: '', disabled: false }],
    CanceledCheckB: [{ value: '', disabled: true }],
  });

  Report2Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Balance",
    FDate: [{ value: '', disabled: false }, Validators.required],
    TDate: [{ value: '', disabled: false }, Validators.required],
    CustomerEmail: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
    ScheduleDate: [{ value: '', disabled: false }, Validators.required],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ value: '', disabled: false }, Validators.required],
    UserId: [{ value: '', disabled: false }],
    CanceledCheckB: [{ value: '', disabled: true }],
  });

  Report3Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Realization",
    FDate: [{ value: '', disabled: false }, Validators.required],
    TDate: [{ value: '', disabled: false }, Validators.required],
    CustomerEmail: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
    ScheduleDate: [{ value: '', disabled: false }, Validators.required],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ value: '', disabled: false }, Validators.required],
    UserId: [{ value: '', disabled: false }],
    CanceledCheckB: [{ value: '', disabled: false }],
  });

  spinner: boolean = false;

  constructor(private fb: FormBuilder,
    private dataService: DataServiceService,
    private activateRoute: ActivatedRoute,
    private dialog: MatDialog,
    private sharedService: SharedService) { }

  changeElementTitle(obj) {
    // this.elementTitle = obj.path[0].innerHTML;
    // obj.path.find(el => { 
    // })
    // 
  }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.spinner = true;
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    this.unsubscribeId = this.activateRoute.params.subscribe(param => {
      this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
      this.indexId = param['indexId'];
      this.getAllCustomers();
    });
  }

  loadingReport() {
    debugger

    if(this.Report1Form.valid){

    let stime = this.Report1Form.get('ScheduleDate').value?.toLocaleString()
    this.newTime = stime.slice(16, 24);

    let objToApi = {
      Token: this.userToken,
      UserId: this.userId,
      ScheduleTime: this.newTime,
      CanceledCheckB: false
    }

    Object.keys(this.Report1Form.value).forEach(val => {

      if (this.Report1Form.get(val).value != '') {
        objToApi[val] = this.Report1Form.get(val).value;
      }
    })
    objToApi['CanceledCheckB'] = false;

    debugger
    this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
      debugger
      if (result['Token'] != undefined || result['Token'] != null) {
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (result.errdesc == 'OK') {
          this.dialog.open(DialogComponent, {
            data: { message: 'דוח נשלח בהצלחה' }
          });
          this.resetForm('Report1Form');
        }
        if (result.errdesc != 'OK') {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          })
        }
      }

      else if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        })
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        this.sharedService.exitSystemEvent();
      }
    })
  }
  }

  balanceReport() {

    if(this.Report2Form.valid){

    let stime = this.Report2Form.get('ScheduleDate').value?.toLocaleString()
    this.newTime = stime.slice(16, 24);

    let objToApi = {
      Token: this.userToken,
      UserId: this.userId,
      ScheduleTime: this.newTime,
      CanceledCheckB: false
    }

    Object.keys(this.Report2Form.value).forEach(val => {
      if (this.Report2Form.get(val).value != '') {
        objToApi[val] = this.Report2Form.get(val).value;
      }
    })
    objToApi['CanceledCheckB'] = false;

    this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
      debugger
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (result.errdesc == 'OK') {
          this.dialog.open(DialogComponent, {
            data: { message: 'דוח נשלח בהצלחה' }
          });
          this.resetForm('Report2Form');
        }
        if (result.errdesc != 'OK') {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          })
        }
      }
      else if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        })
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        this.sharedService.exitSystemEvent();
      }

      // if (typeof result == 'object' && result['obj'] == null) {
      //   this.formErrorMsg = 'No Data Found';
      //   setTimeout(() => {
      //     this.formErrorMsg = '';
      //   }, 3000);
      // }
    })
  }
  }

  realizationReport() {

    if (this.Report3Form.valid) {

      let stime = this.Report3Form.get('ScheduleDate').value?.toLocaleString();
      this.newTime = stime.slice(16, 24);
      let cancelCheckValue = this.Report3Form.get('CanceledCheckB').value?.toLocaleString();

      let objToApi = {
        Token: this.userToken,
        UserId: this.userId,
        ScheduleTime: this.newTime,
        CanceledCheckB: cancelCheckValue == '' ? 'false' : cancelCheckValue.toString()
      }

      Object.keys(this.Report3Form.value).forEach(val => {
        if (this.Report3Form.get(val).value != '') {
          objToApi[val] = this.Report3Form.get(val).value;
        }
      });

      this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
        if (result['Token'] != undefined || result['Token'] != null) {
          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (result.errdesc == 'OK') {
            this.dialog.open(DialogComponent, {
              data: { message: 'דוח נשלח בהצלחה' }
            });

            this.resetForm('Report3Form');
          }
          if (result.errdesc != 'OK') {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            })
          }
        }
        else if (typeof result == 'string') {
          this.dialog.open(DialogComponent, {
            data: { message: result }
          })
        }
        else {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          })
          this.sharedService.exitSystemEvent();
        }
      })
    }
  }

  resetForm(form) {
    this[form].reset();
    this[form + 'View'] = false;

    setTimeout(() => {
      this[form + 'View'] = true;
    }, 0);
  }

  getAllCustomers() {

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetAllCustomers(objToApi).subscribe(result => {

      this.spinner = false;

      if (result['Token'] != undefined || result['Token'] != null) {
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
          this.customers = result['obj'];
          if (this.userId != undefined && this.indexId != undefined) {
            this.Report1Form.controls['customer'].setValue(this.fillteringUserData(this.userId));
            this.Report2Form.controls['customer'].setValue(this.fillteringUserData(this.userId));
            this.Report3Form.controls['customer'].setValue(this.fillteringUserData(this.userId));
          }
          else {
            this.indexId = 0;
          }
        }
        else if (typeof result == 'object' && result['obj'] == null) {
          this.errorMsg = 'No Data Found';
          setTimeout(() => {
            this.errorMsg = '';
          }, 3000);
        }
      }
      else if (typeof result == 'string') {
        this.dialog.open(DialogComponent, {
          data: { message: result }
        });
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        this.sharedService.exitSystemEvent();
      }

    });
  }

  fillteringUserData(userId) {
    return this.customers.filter(customer => customer.id == userId)[0];
  }

  optionChange(event) {
    this.userId = event.value.id;
  }

  checkBoxvalue(event) {
    console.log(event.checked);
    this.checkBoxValue = event.checked;
  }

  ngAfterViewInit() {
    document.querySelectorAll('.mat-tab-label').forEach(el => {
      el.addEventListener('click', this.changeElementTitle);
    });
  }
}