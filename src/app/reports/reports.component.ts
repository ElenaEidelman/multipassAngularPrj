import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataServiceService } from 'src/app/data-service.service';
import { ActivatedRoute, RouterLinkActive } from '@angular/router';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../shared.service';
import { MsgList } from '../Classes/msgsList';
import { animate, state, style, transition, trigger } from '@angular/animations';
@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  encapsulation: ViewEncapsulation.None,
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
export class ReportsComponent implements OnInit, AfterViewInit {

  elementTitle: string = 'דוחות';
  formErrorMsg: string = '';
  userToken;
  userId = JSON.parse(localStorage.getItem('user'))['obj']['Id'];
  unsubscribeId;
  errorMsg = '';
  customers;
  indexId;
  ScheduleDate;
  fDate;
  tDate;
  report1;
  checkBoxValue: boolean = false;
  MsgList = MsgList;
  Report1FormView: boolean = true;
  Report2FormView: boolean = true;
  Report3FormView: boolean = true;
  radioCurrentDayPressed1Form: boolean = true;
  radioCurrentDayPressed3Form: boolean = true;
  rangeOfDatesDatePickerView1Form: boolean = false;
  rangeOfDatesDatePickerView3Form: boolean = false;

  maxDateForReport;
  maxDateForReportSpare;



  Report1Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Loading",
    FDate: [{ value: '', disabled: false }],
    TDate: [{ value: '', disabled: false }],
    CustomerEmail: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
    // ScheduleDate: [{ value: '', disabled: false }, Validators.required],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ value: '', disabled: false }, Validators.required],
    UserId: [{ value: '', disabled: false }],
    CanceledCheckB: (''),
    reportData: ('prevMonth')
  });

  Report2Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Balance",
    FDate: [{ value: '', disabled: false }],
    TDate: [{ value: '', disabled: false }],
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
    FDate: [{ value: '', disabled: false }],
    TDate: [{ value: '', disabled: false }],
    CustomerEmail: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
    // ScheduleDate: [{ value: '', disabled: false }, Validators.required],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ organizationName: 'כל הלקוחות', id: '0' }, Validators.required],
    UserId: [{ value: '', disabled: false }],
    CanceledCheckB: [{ value: '', disabled: false }],
    reportData: ('prevMonth')
  });

  reportDataList = [
    { valHeb: 'חודש קודם', valEng: 'prevMonth' },
    { valHeb: 'מתחילת החודש', valEng: 'beginingOfMonth' },
    { valHeb: 'רק היום', valEng: 'currentDay' },
    { valHeb: 'טווח תאריכים', valEng: 'rangeOfDates' },
  ];

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
      this.indexId = param['indexId'];
      this.getAllCustomers();
    });


    //set prev month date for reports
    let date = new Date();

    let prevMonth = date.getMonth() - 1;
    let lastDayOfPrevMonth = new Date(+(new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)) - 1);


    this.Report1Form.get('FDate').setValue(new Date(date.getFullYear(), prevMonth, 1, 0, 0, 0))
    this.Report1Form.get('TDate').setValue(new Date(date.getFullYear(), prevMonth, lastDayOfPrevMonth.getDate(), 23, 59, 59))

    this.Report3Form.get('FDate').setValue(new Date(date.getFullYear(), prevMonth, 1, 0, 0, 0))
    this.Report3Form.get('TDate').setValue(new Date(date.getFullYear(), prevMonth, lastDayOfPrevMonth.getDate(), 23, 59, 59))


    let maxDateForRep = new Date(new Date().setDate(new Date().getDate() - 1));
    this.maxDateForReport = new Date(maxDateForRep.getFullYear(), maxDateForRep.getMonth(), maxDateForRep.getDate(), 23,59,59);
    this.maxDateForReportSpare = new Date(maxDateForRep.getFullYear(), maxDateForRep.getMonth(), maxDateForRep.getDate(), 23,59,59);
    
    debugger
  }

  loadingReport(reportName) {
    if (this[reportName].valid) {

      if (new Date(this[reportName].get('TDate').value).getHours() == 0) {
        let reportDate = this[reportName].get('TDate').value;
        this[reportName].get('TDate').setValue(new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate(), 23, 59, 59));
      }

      let objToApi = {
        Token: this.userToken,
        UserId: this[reportName].get('customer').value.id,
        CurrentReport: this[reportName].get('CurrentReport').value,
        CanceledCheckB: this[reportName].get('CanceledCheckB').value.toString() == '' ? 'false' : this[reportName].get('CanceledCheckB').value.toString(),
        FDate: this[reportName].get('FDate').value,
        TDate: this[reportName].get('TDate').value,
        customeremail: this[reportName].get('CustomerEmail').value
      }

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
          // this.dialog.open(DialogComponent, {
          //   data: {message: MsgList.exitSystemAlert}
          // })
          debugger
          this.sharedService.exitSystemEvent();
        }
      })
    }
  }

  balanceReport() {

    if (this.Report2Form.valid) {

      let objToApi = {
        Token: this.userToken,
        UserId: this.userId,
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
          // this.dialog.open(DialogComponent, {
          //   data: {message: MsgList.exitSystemAlert}
          // })
          debugger
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

  // realizationReport() {

  //   if (this.Report3Form.valid) {

  //     let cancelCheckValue = this.Report3Form.get('CanceledCheckB').value?.toLocaleString();

  //     let objToApi = {
  //       Token: this.userToken,
  //       UserId: this.userId,
  //       CanceledCheckB: cancelCheckValue == '' ? 'false' : cancelCheckValue.toString()
  //     }

  //     Object.keys(this.Report3Form.value).forEach(val => {
  //       if (this.Report3Form.get(val).value != '') {
  //         objToApi[val] = this.Report3Form.get(val).value;
  //       }
  //     });

  //     this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
  //       if (result['Token'] != undefined || result['Token'] != null) {
  //         //set new token
  //         let tempObjUser = JSON.parse(localStorage.getItem('user'));
  //         tempObjUser['Token'] = result['Token'];
  //         localStorage.setItem('user', JSON.stringify(tempObjUser));
  //         this.userToken = result['Token'];

  //         if (result.errdesc == 'OK') {
  //           this.dialog.open(DialogComponent, {
  //             data: { message: 'דוח נשלח בהצלחה' }
  //           });

  //           this.resetForm('Report3Form');
  //         }
  //         if (result.errdesc != 'OK') {
  //           this.dialog.open(DialogComponent, {
  //             data: { message: result.errdesc }
  //           })
  //         }
  //       }
  //       else if (typeof result == 'string') {
  //         this.dialog.open(DialogComponent, {
  //           data: { message: result }
  //         })
  //       }
  //       else {
  //         // this.dialog.open(DialogComponent, {
  //         //   data: {message: MsgList.exitSystemAlert}
  //         // })
  //         debugger
  //         this.sharedService.exitSystemEvent();
  //       }
  //     })
  //   }
  // }

  resetForm(form) {
    // debugger
    // this[form].reset();
    // this[form + 'View'] = false;

    // setTimeout(() => {
    //   if (form == 'Report3Form' || form == 'Report1Form') {
    //     this[form].get('reportData').setValue('prevMonth')
    //   }
    //   this[form + 'View'] = true;
    // }, 0);
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
          this.Report1Form.get('customer').setValue({ organizationName: 'כל הלקוחות', id: '0' });
          this.Report3Form.get('customer').setValue({ organizationName: 'כל הלקוחות', id: '0' });
          this.customers.unshift({ organizationName: 'כל הלקוחות', id: '0' })


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
        // this.dialog.open(DialogComponent, {
        //   data: {message: MsgList.exitSystemAlert}
        // })
        debugger
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

  reportDataRadioEventChanged(event, form) {
    let date = new Date();
    if (form == 'Report1Form') {
      if (event.value == 'currentDay') {
        this.radioCurrentDayPressed1Form = false;
        this.rangeOfDatesDatePickerView1Form = false;
        this.maxDateForReport = new Date();

        this[form].get('FDate').setValue(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))
        this[form].get('TDate').setValue(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59))
      }
      else if (event.value == 'rangeOfDates') {
        this.rangeOfDatesDatePickerView1Form = true;
        this.radioCurrentDayPressed1Form = true;

        this.maxDateForReport = this.maxDateForReportSpare;
      }
      else if (event.value == 'beginingOfMonth') {
        this.radioCurrentDayPressed1Form = true;
        this.rangeOfDatesDatePickerView1Form = false;
        this.maxDateForReport = this.maxDateForReportSpare;

        this[form].get('FDate').setValue(new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0))
        this[form].get('TDate').setValue(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 23, 59, 59))

      }
      else if (event.value == 'prevMonth') {
        this.radioCurrentDayPressed1Form = true;
        this.rangeOfDatesDatePickerView1Form = false;

        let prevMonth = date.getMonth() - 1;
        let lastDayOfPrevMonth = new Date(+(new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)) - 1);

        this[form].get('FDate').setValue(new Date(date.getFullYear(), prevMonth, 1, 0, 0, 0))
        this[form].get('TDate').setValue(new Date(date.getFullYear(), prevMonth, lastDayOfPrevMonth.getDate(), 23, 59, 59))
      }
    }
    else if (form == 'Report3Form') {
      debugger
      if (event.value == 'currentDay') {
        this.radioCurrentDayPressed3Form = false;
        this.rangeOfDatesDatePickerView3Form = false;

        this.maxDateForReport = new Date();

        this[form].get('FDate').setValue(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0))
        this[form].get('TDate').setValue(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59))
      }
      else if (event.value == 'rangeOfDates') {
        this.rangeOfDatesDatePickerView3Form = true;
        this.radioCurrentDayPressed3Form = true;

        this.maxDateForReport = this.maxDateForReportSpare;
      }
      else if (event.value == 'beginingOfMonth') {
        this.radioCurrentDayPressed3Form = true;
        this.rangeOfDatesDatePickerView3Form = false;
        this.maxDateForReport = this.maxDateForReportSpare;

        this[form].get('FDate').setValue(new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0))
        this[form].get('TDate').setValue(new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1, 23, 59, 59))
      }
      else if (event.value == 'prevMonth') {
        this.radioCurrentDayPressed3Form = true;
        this.rangeOfDatesDatePickerView3Form = false;

        let prevMonth = date.getMonth() - 1;
        let lastDayOfPrevMonth = new Date(+(new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0)) - 1);

        this[form].get('FDate').setValue(new Date(date.getFullYear(), prevMonth, 1, 0, 0, 0))
        this[form].get('TDate').setValue(new Date(date.getFullYear(), prevMonth, lastDayOfPrevMonth.getDate(), 23, 59, 59))

      }

    }

  }

  //set default option (all customers) to mat-select
  compareFunction(o1: any, o2: any) {
    return (o1.name == o2.name && o1.id == o2.id);
  }

  ngAfterViewInit() {
    document.querySelectorAll('.mat-tab-label').forEach(el => {
      el.addEventListener('click', this.changeElementTitle);
    });
  }
}