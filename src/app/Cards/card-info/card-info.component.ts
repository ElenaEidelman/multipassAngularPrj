import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, RouterLinkActive } from '@angular/router';
import { CustomerData } from 'src/app/Classes/customerData';
import { MockData } from 'src/app/Classes/mockData';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DatePickerDialog } from 'src/app/Orders/exec-order/exec-order.component';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';

import { PhoneConfirmComponent } from 'src/app/SMSTemplate/all-sms-templates/all-sms-templates.component';

@Component({
  selector: 'app-card-info',
  templateUrl: './card-info.component.html',
  styleUrls: ['./card-info.component.css'],
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
export class CardInfoComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  MsgList = MsgList;
  MockData = MockData;

  constructor(
    private activateRoute: ActivatedRoute,
    private dataService: DataServiceService,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private fb: FormBuilder,
    private urlSharingService: UrlSharingService,
    private router: Router) { }

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }


  mainSpinner: boolean = true;

  // data table
  public historyTableTemplate = [
    { value: 'empIdField', viewValue: "מספר כרטיס" },
    { value: 'isActiveField', viewValue: 'פעיל' },
    { value: 'activityDateField', viewValue: 'תאריך הפעלה' },
    { value: 'operationTypeField', viewValue: '	סוג פעולה' },
    { value: 'loadActualSumField', viewValue: '	סכום טעינה נוכחי' },
    { value: 'approvedSumField', viewValue: '	סכום עסקה' },
    { value: 'supplierNameField', viewValue: '	שם ספק' },
    { value: 'tranIdField', viewValue: '	מספר אסמכתה' }
  ];
  public historyDataSource = new MatTableDataSource([]);

  public historyLabelForTable = [];

  userId;
  userToken;
  cardId;

  CardInfo;
  OrderDetails;
  orderLine;
  History;

  spinnerActiveVoidCard: boolean = false;

  saveUserDataSpinner: boolean = false;

  saveUserDetailsMSG: string = '';
  saveUserDetailsError: string = '';
  errorSendSms: string = '';


  userDetailsForm = this.fb.group({
    FullName: ['', [Validators.required, this.noWhitespaceValidator]],
    PhoneNumber: ['', [Validators.required, Validators.pattern('[0]{1}[0-9]{2,3}[0-9]{7}')]],
  });

  sendSms = this.fb.group({
    smsTemplates: ['', Validators.required],
    previewSmsTemplate: ['', Validators.required]
  });
  smsTemplatesData = [];
  orderCardsData;

  Note = this.fb.control({ value: '', disabled: true });


  // unsubscribeId;

  ngOnInit(): void {
    window.scroll(0, 0);

    // this.unsubscribeId = this.activateRoute.params.subscribe(param => {
    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));
    this.sharedService.pagesAccessLevel.next('');


    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.sendSms.disable();
      this.userDetailsForm.disable();
    }


    let urlParams = this.urlSharingService.messageSource.getValue();
    if (urlParams == '') {
      this.router.navigate(['/public/home']);
    }
    else {

      this.cardId = JSON.parse(urlParams)['cardId'];
      this.userId = JSON.parse(urlParams)['userId'];
      this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
      this.urlSharingService.changeMessage('');
      this.getSmsTemplates();
      this.getTablesData();
    }
    // });
  }

  getSmsTemplates() {

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetSMSFormats(objToApi).subscribe(result => {
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

      // if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
      this.smsTemplatesData = [...result.obj];
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

  getTablesData() {

    let objToApi = {
      Token: this.userToken,
      CardId: this.cardId,
      UserId: this.userId
    }

    debugger
    this.dataService.GetCardInfoById(objToApi).subscribe(result => {
      debugger
      this.mainSpinner = false;
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

      // if (typeof result == 'object' && result.obj != null) {
      this.CardInfo = result.obj[1][0];
      debugger
      this.orderLine = result.obj[9] != null ? result.obj[9]['Id'] : [];
      this.OrderDetails = result.obj[3];


      this.userDetailsForm.get('FullName').setValue(this.CardInfo.FullName);
      this.userDetailsForm.get('PhoneNumber').setValue(this.CardInfo.PhoneNumber);

      // this.Note.setValue(result.obj[1][0]['RemarkNotes']);
      let historyData = result.obj[7]['lstHistoryTranInfoField'];
      this.historyDataSource.data = historyData;
      this.historyDataSource.paginator = this.paginator;
      this.historyDataSource.sort = this.sort;



      this.createDisplayedColumns('historyLabelForTable', this.historyTableTemplate);

      // this.historyDataSource = new MatTableDataSource([]);


      //implement data
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

  saveUserDetails() {
    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {

      if (this.userDetailsForm.valid) {
        this.saveUserDataSpinner = true;


        let objToApi = {
          Token: this.userToken,
          CardId: this.cardId,
          FullName: this.userDetailsForm.get('FullName').value.trim(),
          Phoneno: this.userDetailsForm.get('PhoneNumber').value,
          UserID: this.userId,
          OrderId: this.OrderDetails != null ? this.OrderDetails.IdForDisplay : null
        }



        this.dataService.UpdateCards(objToApi).subscribe(result => {


          this.saveUserDataSpinner = false;
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

          // if (result.obj != undefined && result.obj != null && Object.keys(result.obj).length > 0) {
          // this.userDetailsForm.get('FullName').setValue(result.obj.DSendName);
          // this.userDetailsForm.get('PhoneNumber').setValue(result.obj.DSendPhone);
          this.historyLabelForTable = [];
          this.getTablesData();

          this.saveUserDetailsMSG = 'נשמר בהצלחה';
          setTimeout(() => {
            this.saveUserDetailsMSG = '';
          }, 2000);

          //saveUserDetailsError
          // }

          // }
          // else {
          //   this.dialog.open(DialogComponent, {
          //     data: { message: result.errdesc }
          //   })
          // }

        });
      }
      else {
        this.saveUserDetailsError = 'נא למלא את כל השדות';
        setTimeout(() => {
          this.saveUserDetailsError = '';
        }, 2000)
      }

      setTimeout(() => {
        this.saveUserDataSpinner = false;
      }, 2000);
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: MsgList.readOnly }
      })
    }

  }
  activeVoidCard(cardStatus) {
    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      this.spinnerActiveVoidCard = true;
      //card is active

      if (cardStatus) {
        let objToApi = {
          Token: this.userToken,
          OrderId: this.OrderDetails != null ? this.OrderDetails.IdForDisplay : null,
          UserId: this.userId,
          CardLst: [this.CardInfo.CardId]
        }



        debugger
        this.dataService.VoidCards(objToApi).subscribe(result => {
          debugger
          this.spinnerActiveVoidCard = false;
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

          // if (result.err != -1) {
          this.CardInfo.IsActive = !this.CardInfo.IsActive;
          debugger
          // this.historyDataSource.data = [];
          this.historyLabelForTable = [];
          this.getTablesData();
          // }
          // else {
          //   this.dialog.open(DialogComponent, {
          //     data: { message: result.errdesc }
          //   });
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

      //card is void
      else {
        let objToApi = {
          Token: this.userToken,
          OrderId: this.OrderDetails != null ? this.OrderDetails.IdForDisplay : null,
          UserId: this.userId,
          CardId: this.CardInfo.CardId
        }

        this.dataService.ActivateCards(objToApi).subscribe(result => {
          this.spinnerActiveVoidCard = false;
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

          // if (result.errdesc == 'OK') {
          this.CardInfo.IsActive = !this.CardInfo.IsActive;
          debugger
          // this.historyDataSource.data = [];
          this.historyLabelForTable = [];
          this.getTablesData();
          // }
          // else {
          //   this.dialog.open(DialogComponent, {
          //     data: { message: result.errdesc }
          //   })
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

    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: MsgList.readOnly }
      })
    }
  }


  createDisplayedColumns(colObj, columns) {
    columns.forEach(el => {
      this[colObj].push(el.value);
    });
  }

  changeDate(dateForChange) {
    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      // 
      let date = new Date(dateForChange);
      let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
      let year = date.getFullYear();
      this.dialog.open(DatePickerDialog, {
        data: {
          date: day + '/' + month + '/' + year
        }
      }).afterClosed().subscribe(dialogResult => {


        if (new Date(dialogResult.result.date) < new Date()) {
          this.dialog.open(DialogComponent, {
            data: { message: MsgList.wrongDate }
          })
        }
        else {
          let validityDate = new Date(dialogResult.result.date);
          validityDate.setHours(23, 59, 59);

          let dateForApi = new Date(validityDate);
          let day = dateForApi.getDate() < 10 ? '0' + dateForApi.getDate() : dateForApi.getDate();
          let month = (dateForApi.getMonth() + 1) < 10 ? '0' + (dateForApi.getMonth() + 1) : (dateForApi.getMonth() + 1);
          let year = dateForApi.getFullYear();


          let objToApi = {
            Token: this.userToken,
            CardLst: [this.CardInfo.CardId + ''],
            OrderId: this.OrderDetails != null ? this.OrderDetails.Id : null,
            UserId: this.userId != null ? this.userId : +this.userId,
            ValidationDate: day + '/' + month + '/' + year
          }




          this.dataService.UpdateExpirationDateOfCards(objToApi).subscribe(result => {
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

            // if (typeof result == 'object' && result.obj != null) {

            let respDate = new Date(result.obj.ValidationDate);

            this.CardInfo.ExpirationDate = new Date(respDate.getFullYear(), respDate.getMonth(), respDate.getDate());
            this.dialog.open(DialogComponent, {
              data: { message: MsgList.savedSuccessfully }
            })
            // }
            // else if (result.obj == null) {
            //   this.dialog.open(DialogComponent, {
            //     data: { message: result.errdesc }
            //   });
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
          });
        }
      });

    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: MsgList.readOnly }
      })
    }

  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.historyDataSource.filter = filterValue.trim().toLowerCase();

    if (this.historyDataSource.paginator) {
      this.historyDataSource.paginator.firstPage();
    }
  }

  returnHebTranslation(obj, value) {
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  changePinCode(pinCode) {
    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      this.dialog.open(DialogConfirmComponent, {
        data: { message: 'האם לשנות את הקוד הסודי?', eventButton: 'לשנות' }
      }).afterClosed().subscribe(result => {


        if (result.result == 'yes') {


          let objToApi = {
            Token: this.userToken.toString(),
            CardId: this.CardInfo.CardId.toString(),
            OrderId: this.OrderDetails != null ? this.OrderDetails.Id.toString() : null,
            // Pin: result.result.pinCode,
            UserId: this.userId,
          }





          this.dataService.UpdatePinCodeOfCards(objToApi).subscribe(result => {
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

            // if (result.err != -1) {
            this.CardInfo.PinCode = result.obj.PinCode;
            // }
            // else {
            //   this.dialog.open(DialogComponent, {
            //     data: { message: result.errdesc }
            //   })
            // }
            // }
            // else {
            //   this.dialog.open(DialogComponent, {
            //     data: { message: MsgList.exitSystemAlert }
            //   })
            //   this.sharedService.exitSystemEvent();
            // }


          })
        }
      })
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: MsgList.readOnly }
      })
    }
  }

  sendSMS() {


    if (this.CardInfo.OrderId != 0) {
      if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
        if (this.sendSms.valid) {
          this.dialog.open(DialogConfirmComponent, {
            data: { message: 'האם לשלוח SMS?', eventButton: 'שלח' }

          }).afterClosed().subscribe(result => {
            if (result.result.includes('yes')) {

              let phone = result.result.split('phone: ')[1];


              // let objToApi = {
              //   Token: this.userToken,
              //   TemplateFormat: this.sendSms.get('previewSmsTemplate').value,
              //   Phone: phone
              // }

              // let objToApi = {
              //   Token: this.userToken,
              //   TemplateId: this.sendSms.get('smsTemplates').value,
              //   UserId : +this.userId,
              //   CoreOrderId:this.OrderDetails.Id,
              //   From: this.OrderDetails.PrimaryUser.OrganizationName
              // }

              let objToApi = {
                Token: this.userToken,
                TemplateId: this.sendSms.get('smsTemplates').value,
                UserId: +this.userId,
                OrderLineIds: Array.of(this.orderLine),
                CoreOrderId: (this.OrderDetails != undefined && this.OrderDetails != null) ? this.OrderDetails.Id : 0,
                From: (this.OrderDetails != undefined && this.OrderDetails != null) ? this.OrderDetails.PrimaryUser.OrganizationName : ""
              }

          
              this.dataService.SendSMSByOrderLine(objToApi).subscribe(result => {

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

                // if (result.err != -1) {
                this.dialog.open(DialogComponent, {
                  data: { message: 'נשלח בהצלחה' }
                });
                // }

                // }
                // else {
                //   // this.dialog.open(DialogComponent, {
                //   //   data: {message: result}
                //   // })
                //   this.sharedService.exitSystemEvent();
                // }
              });
            }
          })
        }
        else {
          this.errorSendSms = 'נא לבחור תבנית ההודעה';
          setTimeout(() => {
            this.errorSendSms = '';
          }, 2000)
        }
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: MsgList.readOnly }
        })
      }
    }

  }

  smsTempleteSelect(event) {
    if (event.value != undefined) {
      this.sendSms.get('previewSmsTemplate').setValue(this.smsTemplatesData.filter(el => el.Id == event.value)[0]['TemplateFormat']);
    }
  }

  goToOrder(orderId: number, customerId: number) {
    let Order = {
      orderId: orderId,
      customerId: customerId
    }
    this.urlSharingService.changeMessage(JSON.stringify(Order));
    this.router.navigate(['/public/order']);
  }


  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

  ngAfterViewInit() {
    if (this.historyDataSource != undefined) {
      this.historyDataSource.paginator = this.paginator;
      this.historyDataSource.sort = this.sort;
    }
  }
}





function find_max(nums) {
  let max_num = Number.NEGATIVE_INFINITY; // smaller than all other numbers
  for (let num of nums) {
    if (num > max_num) {
      max_num = num;
    }
  }
  return max_num;
}