import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DataServiceService } from 'src/app/data-service.service';
import { ActivatedRoute, RouterLinkActive } from '@angular/router';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../shared.service';
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
  

  Report1Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Loading",
    FDate: [{ value: '', disabled: false }],
    TDate: [{ value: '', disabled: false }],
    CustomerEmail: [{ value: '', disabled: false }],
    ScheduleDate: [{ value: '', disabled: false }],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ value: '', disabled: false }],
    UserId: [{ value: '', disabled: false }],
  });

  Report2Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Balance",
    FDate: [{ value: '', disabled: false }],
    TDate: [{ value: '', disabled: false }],
    CustomerEmail: [{ value: '', disabled: false }],
    ScheduleDate: [{ value: '', disabled: false }],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ value: '', disabled: false }],
    UserId: [{ value: '', disabled: false }],
  });

  Report3Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Realization",
    FDate: [{ value: '', disabled: false }],
    TDate: [{ value: '', disabled: false }],
    CustomerEmail: [{ value: '', disabled: false }],
    ScheduleDate: [{ value: '', disabled: false }],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ value: '', disabled: false }],
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

    this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
      if(typeof result == 'string'){
        this.dialog.open(DialogComponent, {
          data: {message: result}
        });
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        this.sharedService.exitSystemEvent();
      }
      if (typeof result == 'object' && result['obj'] == null) {
        this.formErrorMsg = 'No Data Found';
        setTimeout(() => {
          this.formErrorMsg = '';
        }, 3000);
      }
    })
  }

  balanceReport() {
    
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

    
    this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
      
      if(typeof result == 'string'){
        this.dialog.open(DialogComponent, {
          data: {message: result}
        });
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        this.sharedService.exitSystemEvent();
      }
      if (typeof result == 'object' && result['obj'] == null) {
        this.formErrorMsg = 'No Data Found';
        setTimeout(() => {
          this.formErrorMsg = '';
        }, 3000);
      }
    })
  }

  realizationReport() {
    let stime = this.Report3Form.get('ScheduleDate').value?.toLocaleString();
    this.newTime = stime.slice(16, 24);
    let cancelCheckValue = this.Report3Form.get('CanceledCheckB').value?.toLocaleString();
    console.log("cancelCheckValue", cancelCheckValue);

    let objToApi = {
      Token: this.userToken,
      UserId: this.userId,
      ScheduleTime: this.newTime,
      CanceledCheckB: cancelCheckValue
    }

    Object.keys(this.Report3Form.value).forEach(val => {
      if (this.Report3Form.get(val).value != '') {
        objToApi[val] = this.Report3Form.get(val).value;
      }
    })

     
    this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
       
      if(typeof result == 'string'){
        this.dialog.open(DialogComponent, {
          data: {message: result}
        });
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        this.sharedService.exitSystemEvent();
      }
      
    })
  }

  resetForm(){
    this.activateRoute.params.subscribe(param => {
      Object.keys(this.Report1Form.controls).forEach(control => {
        this.Report1Form.get(control).setValue('');
      });
    });
    this.activateRoute.params.subscribe(param => {
      Object.keys(this.Report2Form.controls).forEach(control => {
        this.Report2Form.get(control).setValue('');
      });
    });
    this.activateRoute.params.subscribe(param => {
      Object.keys(this.Report3Form.controls).forEach(control => {
        this.Report3Form.get(control).setValue('');
      });
    });
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
      else if(typeof result == 'string'){
        this.dialog.open(DialogComponent, {
          data: {message: result}
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
