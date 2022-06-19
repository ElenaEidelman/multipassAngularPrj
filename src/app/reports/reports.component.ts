import { Component, OnInit, AfterViewInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { DataServiceService } from 'src/app/data-service.service';
import { ActivatedRoute, RouterLinkActive } from '@angular/router';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { MsgList } from '../Classes/msgsList';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { SharedService } from '../Services/SharedService/shared.service';
import { MockData } from '../Classes/mockData';




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

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }

  elementTitle: string = 'דוחות';
  formErrorMsg: string = '';
  userToken;
  userId = JSON.parse(localStorage.getItem('user'))['obj']['Id'];
  unsubscribeId;
  errorMsg = '';
  customers;
  customersSpare;
  indexId;
  ScheduleDate;
  scheduleDateMin;
  fDate;
  tDate;
  report1;
  checkBoxValue: boolean = false;
  MsgList = MsgList;
  MockData = MockData;
  Report1FormView: boolean = true;
  Report2FormView: boolean = true;
  Report3FormView: boolean = true;
  scheduleDateDisable: boolean = true;
  radioCurrentDayPressed1Form: boolean = true;
  radioCurrentDayPressed3Form: boolean = true;
  rangeOfDatesDatePickerView1Form: boolean = false;
  rangeOfDatesDatePickerView3Form: boolean = false;

  maxDateForReport;
  maxDateForReportSpare;
  minDateForRaport;

  maxDateForReportBalance;
  minDateForReportBalance;



  Report1Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Realization",
    FDate: [{ value: '', disabled: false }],
    TDate: [{ value: '', disabled: false }],
    CustomerEmail: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
    // ScheduleDate: [{ value: '', disabled: false }, Validators.required],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ value: '', disabled: false }, Validators.required],
    UserId: [{ value: '', disabled: false }],
    CanceledCheckB: (''),
    reportData: ('prevMonth'),
    searchCustomer: ['']

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
    searchCustomer: ['']
  });

  Report3Form = this.fb.group({
    // sendImmedCheckB:[{ value: '', disabled: false }],
    CurrentReport: "Loading",
    FDate: [{ value: '', disabled: false }],
    TDate: [{ value: '', disabled: false }],
    CustomerEmail: [{ value: '', disabled: false }, [Validators.required, Validators.email]],
    // ScheduleDate: [{ value: '', disabled: false }, Validators.required],
    Checkedsend: [{ value: '', disabled: false }],
    customer: [{ organizationName: 'כל הלקוחות', id: '0' }, Validators.required],
    UserId: [{ value: '', disabled: false }],
    CanceledCheckB: [{ value: '', disabled: false }],
    reportData: ('prevMonth'),
    searchCustomer: ['']
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

    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));

    this.sharedService.pagesAccessLevel.next('');
    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.Report1Form.disable();
      this.Report2Form.disable();
      this.Report3Form.disable();

    }

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


    debugger
    let maxDateForRep = new Date(new Date().setDate(new Date().getDate() - 1));
    this.maxDateForReport = new Date(maxDateForRep.getFullYear(), maxDateForRep.getMonth(), maxDateForRep.getDate(), 23, 59, 59);
    this.maxDateForReportSpare = new Date(maxDateForRep.getFullYear(), maxDateForRep.getMonth(), maxDateForRep.getDate(), 23, 59, 59);
    debugger
    this.onReport2FormChanges();
  }
  onReport2FormChanges() {

    //report 1
    this.Report1Form.valueChanges.subscribe(val => {
      if (val.FDate != null && val.FDate != '') {

      }
      if (val.TDate != null && val.TDate != '') {

      }

    })



    //report 2
    this.Report2Form.valueChanges.subscribe(val => {
      if ((val.FDate != '' && val.FDate != null) && (val.TDate != '' && val.TDate != null)) {
        this.scheduleDateDisable = false;
        this.scheduleDateMin = new Date();
      }
      else {
        this.scheduleDateDisable = true;
      }
    })

    this.Report2Form.get('FDate').valueChanges.subscribe(val => {
      debugger
      this.minDateForReportBalance = '';
      this.maxDateForReportBalance = '';
    })
    this.Report2Form.get('TDate').valueChanges.subscribe(val => {
      this.minDateForReportBalance = '';
      this.maxDateForReportBalance = '';
    })

    //report 3    
  }

  sendReport(reportName) {
    if (this[reportName].valid) {

      if (new Date(this[reportName].get('TDate').value).getHours() == 0) {
        let reportDate = this[reportName].get('TDate').value;
        this[reportName].get('TDate').setValue(new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate(), 23, 59, 59));
      }


      //2019 11 21 09:53:10 GMT

      let FDate = new Date(this[reportName].get('FDate').value);
      let TDate = new Date(this[reportName].get('TDate').value.toISOString());

      let fdTEST = FDate.getFullYear() + ' ' + ((FDate.getMonth() + 1) < 10 ? '0' + (FDate.getMonth() + 1) : (FDate.getMonth() + 1)) + ' ' + (FDate.getDate() < 10 ? '0' + FDate.getDate() : FDate.getDate()) + ' 00:00:00 GMT';
      let tdTEST = TDate.getFullYear() + ' ' + ((TDate.getMonth() + 1) < 10 ? '0' + (TDate.getMonth() + 1) : (TDate.getMonth() + 1)) + ' ' + (TDate.getDate() < 10 ? '0' + TDate.getDate() : TDate.getDate()) + ' 23:59:59 GMT';

      let objToApi = {
        Token: this.userToken,
        UserId: this[reportName].get('customer').value.id,
        CurrentReport: this[reportName].get('CurrentReport').value,
        CanceledCheckB: this[reportName].get('CanceledCheckB').value.toString() == '' ? 'false' : this[reportName].get('CanceledCheckB').value.toString(),
        FDate: new Date(fdTEST).toISOString(),
        TDate: new Date(tdTEST).toISOString(),
        customeremail: this[reportName].get('CustomerEmail').value
      }


      this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
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

        if (result.errdesc == 'OK') {
          this.dialog.open(DialogComponent, {
            data: { message: 'דוח נשלח בהצלחה' }
          });
        }
        // if (result.errdesc != 'OK') {
        //   this.dialog.open(DialogComponent, {
        //     data: { message: result.errdesc }
        //   })
        // }
        // }

        // else if (typeof result == 'string') {
        //   this.dialog.open(DialogComponent, {
        //     data: { message: result }
        //   })
        // }
        // else {
        //   // this.dialog.open(DialogComponent, {
        //   //   data: {message: MsgList.exitSystemAlert}
        //   // })
        //   this.sharedService.exitSystemEvent();
        // }
      })
    }
  }

  sendBalanceReport() {
    debugger
    if (this.Report2Form.valid) {
      debugger
      let objToApi = {
        Token: this.userToken,
        UserId: this.Report2Form.get('customer').value.id,
        CanceledCheckB: false
      }

      Object.keys(this.Report2Form.value).forEach(val => {
        if (this.Report2Form.get(val).value != '') {
          objToApi[val] = this.Report2Form.get(val).value;
        }
      })
      objToApi['CanceledCheckB'] = false;


      debugger
      this.dataService.CreateRealizationReports(objToApi).subscribe(result => {
        debugger
        if (typeof result == 'string') {
          // this.dialog.open(DialogComponent, {
          //   data: { message: result }
          // })

          this.sharedService.exitSystemEvent(result);
          return false;
        }


        // if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (result.errdesc == 'OK') {
          this.dialog.open(DialogComponent, {
            data: { message: 'דוח נשלח בהצלחה' }
          });

        }
        // if (result.errdesc != 'OK') {
        //   this.dialog.open(DialogComponent, {
        //     data: { message: result.errdesc }
        //   })
        // }
        // }
        // else if (typeof result == 'string') {
        //   this.dialog.open(DialogComponent, {
        //     data: { message: result }
        //   })
        // }
        // else {
        //   // this.dialog.open(DialogComponent, {
        //   //   data: {message: MsgList.exitSystemAlert}
        //   // })
        //   this.sharedService.exitSystemEvent();
        // }

        // if (typeof result == 'object' && result['obj'] == null) {
        //   this.formErrorMsg = 'No Data Found';
        //   setTimeout(() => {
        //     this.formErrorMsg = '';
        //   }, 3000);
        // }
      })
    }
  }


  getAllCustomers() {

    let objToApi = {
      Token: this.userToken
    }
    this.dataService.GetAllCustomers(objToApi).subscribe(result => {
      this.spinner = false;
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

      // if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
      this.customers = result['obj'].sort(function (a, b) {
        if (a.organizationName < b.organizationName) { return -1; }
        if (a.organizationName > b.organizationName) { return 1; }
        return 0;
      });
      this.Report1Form.get('customer').setValue({ organizationName: 'כל הלקוחות', id: '0' });
      this.Report2Form.get('customer').setValue({ organizationName: 'כל הלקוחות', id: '0' });
      this.Report3Form.get('customer').setValue({ organizationName: 'כל הלקוחות', id: '0' });
      this.customers.unshift({ organizationName: 'כל הלקוחות', id: '0' })
      this.customersSpare = JSON.parse(JSON.stringify(this.customers));


      if (this.userId != undefined && this.indexId != undefined) {
        this.Report1Form.controls['customer'].setValue(this.fillteringUserData(this.userId));
        this.Report2Form.controls['customer'].setValue(this.fillteringUserData(this.userId));
        this.Report3Form.controls['customer'].setValue(this.fillteringUserData(this.userId));
      }
      else {
        this.indexId = 0;
      }
      // }
      // else if (typeof result == 'object' && result['obj'] == null) {
      //   this.errorMsg = 'No Data Found';
      //   setTimeout(() => {
      //     this.errorMsg = '';
      //   }, 3000);
      // }
      // }
      // else if (typeof result == 'string') {
      //   this.dialog.open(DialogComponent, {
      //     data: { message: result }
      //   });
      // }
      // else {
      //   // this.dialog.open(DialogComponent, {
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // })
      //   this.sharedService.exitSystemEvent();
      // }

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

        debugger
        this[form].get('FDate').setValue(new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0))

        //if firs day of month


        this[form].get('TDate').setValue(new Date(date.getFullYear(), date.getMonth(), (date.getDate() == 1 ? date.getDate() : date.getDate() - 1), 23, 59, 59))

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
        this[form].get('TDate').setValue(new Date(date.getFullYear(), date.getMonth(), (date.getDate() == 1 ? date.getDate() : date.getDate() - 1), 23, 59, 59))
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

  searchChange(event) {
    this.customersSpare = JSON.parse(JSON.stringify(this.customers));
    this.customersSpare = this.customers.filter(customer => {
      if (customer.organizationName.toLowerCase().includes(event.toLowerCase())) {
        return customer;
      }
    });
  }

  selectedTabChange(event) {
    if (event.tab.position == 0) {
      this.Report1Form.get('searchCustomer').setValue('');
    }
    else if (event.tab.position == 1) {
      this.Report2Form.get('searchCustomer').setValue('');
    }
    else if (event.tab.position == 2) {
      this.Report3Form.get('searchCustomer').setValue('');
    }

    this.customersSpare = JSON.parse(JSON.stringify(this.customers));
  }

  ngAfterViewInit() {
    document.querySelectorAll('.mat-tab-label').forEach(el => {
      el.addEventListener('click', this.changeElementTitle);
    });
  }
}