import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DataServiceService } from 'src/app/data-service.service';
import { ActivatedRoute, RouterLinkActive } from '@angular/router';
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
  checkBoxValue:boolean = false;

  Report1Form = this.fb.group({
      // sendImmedCheckB:[{ value: '', disabled: false }],
      CurrentReport: "Loading",
      FDate: [{ value: '', disabled: false }],
      TDate: [{ value: '', disabled: false }],
      CustomerEmail: [{ value: '', disabled: false }],
      ScheduleDate: [{ value: '', disabled: false }],
      Checkedsend: [{ value: '', disabled: false }],
      customer :[{ value: '', disabled: false }],
      UserId: [{ value: '', disabled: false }],
  });

  Report2Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Balance",
    FDate:[{ value: '', disabled: false }],
    TDate: [{ value: '', disabled: false }],
    CustomerEmail: [{ value: '', disabled: false }],
    ScheduleDate: [{ value: '', disabled: false }],
    Checkedsend: [{ value: '', disabled: false }],
    customer :[{ value: '', disabled: false }],
    UserId:[{ value: '', disabled: false }],
});

Report3Form = this.fb.group({
  // sendImmedCheckB:[{ value: '', disabled: false }],
  CurrentReport: "Realization",
  FDate:[{ value: '', disabled: false }],
  TDate: [{ value: '', disabled: false }],
  CustomerEmail: [{ value: '', disabled: false }],
  ScheduleDate: [{ value: '', disabled: false }],
  Checkedsend: [{ value: '', disabled: false }],
  customer :[{ value: '', disabled: false }],
  UserId:[{ value: '', disabled: false }],
});

  spinner: boolean = false;

  constructor(private fb: FormBuilder,
    private dataService: DataServiceService,
    private activateRoute: ActivatedRoute) { }

  changeElementTitle(obj){
    // this.elementTitle = obj.path[0].innerHTML;
    // obj.path.find(el => { 
    // })
    //debugger
  }

  ngOnInit(): void {
    window.scroll(0,0);
    this.spinner = true;

    this.unsubscribeId = this.activateRoute.params.subscribe(param => {
      this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
      this.indexId = param['indexId'];
      this.getAllCustomers();
    });  
  }

  loadingReport(){
    let stime = this.Report1Form.get('ScheduleDate').value?.toLocaleString()
    this.newTime = stime.slice(16,24);

    let objToApi = {
      Token: this.userToken,
      UserId: this.userId,
      ScheduleTime: this.newTime,
      CanceledCheckB: false
    }

    Object.keys(this.Report1Form.value).forEach(val => {
      if(this.Report1Form.get(val).value != '' ){
        objToApi[val] = this.Report1Form.get(val).value;
      }
    })

    this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
      if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
      }
      if(typeof result == 'string'){
        this.formErrorMsg = result;
        setTimeout(()=>{
          this.formErrorMsg = '';
        },10000);
      }
      if(typeof result == 'object' &&  result['obj'] == null){
        this.formErrorMsg = 'No Data Found';
        setTimeout(()=>{
          this.formErrorMsg = '';
        },3000);
      }
    })
  }

  balanceReport(){
    let stime = this.Report2Form.get('ScheduleDate').value?.toLocaleString()
    this.newTime = stime.slice(16,24);

    let objToApi = {
      Token: this.userToken,
      UserId: this.userId,
      ScheduleTime: this.newTime,
      CanceledCheckB: false
    }

    Object.keys(this.Report2Form.value).forEach(val => {
      if(this.Report2Form.get(val).value != '' ){
        objToApi[val] = this.Report2Form.get(val).value;
      }
    })

    this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
      if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
      }
      if(typeof result == 'string'){
        this.formErrorMsg = result;
        setTimeout(()=>{
          this.formErrorMsg = '';
        },10000);
      }
      if(typeof result == 'object' &&  result['obj'] == null){
        this.formErrorMsg = 'No Data Found';
        setTimeout(()=>{
          this.formErrorMsg = '';
        },3000);
      }
    })
  }

  realizationReport(){
    let stime = this.Report3Form.get('ScheduleDate').value?.toLocaleString()
    this.newTime = stime.slice(16,24); 

    let objToApi = {
      Token: this.userToken,
      UserId: this.userId,
      ScheduleTime: this.newTime,
      CanceledCheckB: this.checkBoxValue
    }

    Object.keys(this.Report3Form.value).forEach(val => {
      if(this.Report3Form.get(val).value != '' ){
        objToApi[val] = this.Report3Form.get(val).value;
      }
    })

    this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
      if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
      }
      if(typeof result == 'string'){
        this.formErrorMsg = result;
        setTimeout(()=>{
          this.formErrorMsg = '';
        },10000);
      }
      if(typeof result == 'object' &&  result['obj'] == null){
        this.formErrorMsg = 'No Data Found';
        setTimeout(()=>{
          this.formErrorMsg = '';
        },3000);
      }
    })
  }

  getAllCustomers() {
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let objToApi = {
      Token: token
    }
    this.dataService.GetAllCustomers(objToApi).subscribe(result => {
      this.spinner = false;
      if (typeof result == 'string') {
        this.errorMsg = result;
        setTimeout(() => {
          this.errorMsg = '';
        }, 5000)
      }
      else {
        if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {
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
        if (typeof result == 'object' && result['obj'] == null) {
          this.errorMsg = 'No Data Found';
          setTimeout(() => {
            this.errorMsg = '';
          }, 3000);
        }
      }
    });
  }

  fillteringUserData(userId) {
    return this.customers.filter(customer => customer.id == userId)[0];
  }

  optionChange(event) {
    this.userId = event.value.id;
  }

  checkBoxvalue(event){
    console.log(event.checked);
    this.checkBoxValue = event.checked;
  }

  ngAfterViewInit(){
    document.querySelectorAll('.mat-tab-label').forEach(el => {
      el.addEventListener('click', this.changeElementTitle);
    });
  }
}
