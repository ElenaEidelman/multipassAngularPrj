import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, NgControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { resourceUsage } from 'process';
import { MockData } from 'src/app/Classes/mockData';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/Services/SharedService/shared.service';


@Component({
  selector: 'app-all-sms-templates',
  templateUrl: './all-sms-templates.component.html',
  styleUrls: ['./all-sms-templates.component.css'],
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
export class AllSmsTemplatesComponent implements OnInit {

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }

  @ViewChildren("txtArea") textAreas: QueryList<ElementRef>;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('newTemplate') newTemplate: ElementRef;

  spinnerId = -1;
  spinnerById = [];
  newSMSSend: boolean = false;
  voucherNumberInsered: boolean = true;
  voucherValidityInsered: boolean = true;
  newTemplateFormView: boolean = true;

  voucherNumberInseredById: string = '';
  voucherValidityInseredById: string = '';


  userToken;
  userId;
  errorMessagenewSms: string = '';
  spinnerNewTemp: boolean = false;
  newTemplateSendError: string = '';
  MsgList = MsgList;
  MockData = MockData;

  templatesSMS = [];

  newTemplateForm = this.fb.group({
    TemplateName: ['', [Validators.required, this.noWhitespaceValidator]],
    SenderName: ['', [Validators.required, this.noWhitespaceValidator, Validators.pattern('[a-zA-z0-9]*')]],
    TemplateFormat: ['', [Validators.required, this.noWhitespaceValidator]]
  });
  SMSForm = this.fb.group({});



  openNewTemplate: boolean = false;
  edit: boolean = false;

  editingTempId: number;

  saveMessage: string = '';


  constructor(
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog) { }


  ngOnInit(): void {
    window.scroll(0, 0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));

    this.sharedService.pagesAccessLevel.next('');
    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.newTemplateForm.disable();
    }

    this.GetSMSFormats();

    // this.createForm('SMSForm', this.templatesSMS, 'Id-');
  }

  GetSMSFormats() {
    // this.templatesSMS = [];

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetSMSFormats(objToApi).subscribe(result => {
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

      // if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {


      this.templatesSMS = [];
      this.templatesSMS.push(...result.obj);


      this.createForm('SMSForm', this.templatesSMS, 'Id-');
      // }
      // if (typeof result == 'string') {
      //   // this.errorMsg = result;
      //   setTimeout(() => {
      //     // this.errorMsg = '';
      //   }, 5000)
      // }
      // if (result.errdesc != '' && result.errdesc != null) {
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

    });
  }


  createForm(form, values, controlName) {
    this[form] = this.fb.group({});
    const validators = [Validators.required, this.noWhitespaceValidator];
    values.forEach((value) => {
      let group = this.fb.group({});
      group.addControl('TemplateFormat' + value.Id, this.fb.control([value.TemplateFormat, validators]));
      group.addControl('SenderName' + value.Id, this.fb.control([value.SenderName, [...validators, Validators.pattern('[a-zA-z0-9]*')]]));
      group.addControl('TemplateName' + value.Id, this.fb.control([value.TemplateName, validators]));

      this[form].addControl(controlName + value.Id, this.fb.group(group.value));

      this[form].updateValueAndValidity();
    });

    //disable all inputs
    Object.keys(this.SMSForm.value).forEach((el, i) => {
      Object.keys(this.SMSForm.get(el).value).forEach((control, index) => {
        this.SMSForm.get(el).get(control).disable();
      })
    })
  }

  addNewTemplate() {
    this.openNewTemplate = !this.openNewTemplate;

    setTimeout(() => {
      //focus text area
      this.newTemplate.nativeElement.focus();
    }, 100);
  }

  saveTemplate(template) {
    if (template != 'newTemplate') {
      if (this.SMSForm.get('Id-' + template.Id).valid) {

        this.voucherValidityInseredById = this.SMSForm.get('Id-' + template.Id).value['TemplateFormat' + template.Id].indexOf('<תוקף>') == -1 ? 'voucherValidityInseredById' + template.Id : '';
        this.voucherNumberInseredById = this.SMSForm.get('Id-' + template.Id).value['TemplateFormat' + template.Id].indexOf('<מספר שובר>') == -1 ? 'voucherNumberInseredById' + template.Id : '';

        if (this.SMSForm.get('Id-' + template.Id).value['TemplateFormat' + template.Id].indexOf('<תוקף>') != -1 &&
          this.SMSForm.get('Id-' + template.Id).value['TemplateFormat' + template.Id].indexOf('<מספר שובר>') != -1) {


          //check if template name exist in another template

          let tempName = this.SMSForm.get('Id-' + template.Id).get('TemplateName' + template.Id).value;
          if (this.templatesSMS.filter(tmp => tmp.TemplateName == tempName && tmp.Id != template.Id).length > 0) {
            document.getElementById('msgErrorBySms' + template.Id).innerHTML = MsgList.smsTemplateNameExist;

            setTimeout(() => {
              document.getElementById('msgErrorBySms' + template.Id).innerHTML = '';
            }, 2000);
          }
          else {

            this.voucherNumberInseredById = '';

            this.templatesSMS;

            let objToApi = {
              Token: this.userToken,
              TemplateName: this.SMSForm.get('Id-' + template.Id).get('TemplateName' + template.Id).value.trim(),
              SenderName: this.SMSForm.get('Id-' + template.Id).get('SenderName' + template.Id).value.trim(),
              TemplateFormat: this.SMSForm.get('Id-' + template.Id).get('TemplateFormat' + template.Id).value,
              TemplateId: template.Id
            }
            this.dataService.CreateOrUpdateSMSTemplate(objToApi).subscribe(result => {
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

              // if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {

              document.getElementById('msgBySms' + template.Id).innerHTML = 'נשמר בהצלחה';
              setTimeout(() => {
                document.getElementById('msgBySms' + template.Id).innerHTML = '';
                this.edit = !this.edit;
                this.editingTempId = -1;
              }, 2000);
              setTimeout(() => {
                this.GetSMSFormats();
              }, 3000);

              this.SMSForm.get('Id-' + template.Id).get('TemplateFormat' + template.Id).disable();
              this.SMSForm.get('Id-' + template.Id).get('SenderName' + template.Id).disable();
              this.SMSForm.get('Id-' + template.Id).get('TemplateName' + template.Id).disable();
              // }
              // if (typeof result == 'string') {
              //   this.errorMessagenewSms = result;

              //   setTimeout(() => {
              //     this.errorMessagenewSms = '';
              //   }, 5000)
              // }
              // if (result.obj == null && result.errdesc != '' && result.errdesc != null) {
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
            });
          }
        }
        else {
          document.getElementById('msgErrorBySms' + template.Id).innerHTML = 'נא להזין שדות חובה';

          setTimeout(() => {
            document.getElementById('msgErrorBySms' + template.Id).innerHTML = '';
          }, 2000);
        }
      }
      else {
        document.getElementById('msgErrorBySms' + template.Id).innerHTML = 'נא למלא את כל השדות';

        setTimeout(() => {
          document.getElementById('msgErrorBySms' + template.Id).innerHTML = '';
        }, 2000);
      }
    }
    else {

      this.voucherValidityInsered = this.newTemplateForm.get('TemplateFormat').value.indexOf('<תוקף>') == -1 ? false : true;
      this.voucherNumberInsered = this.newTemplateForm.get('TemplateFormat').value.indexOf('<מספר שובר>') == -1 ? false : true;

      if (this.newTemplateForm.valid && this.voucherValidityInsered && this.voucherNumberInsered) {

        if (this.templatesSMS.filter(template => template.TemplateName == this.newTemplateForm.get('TemplateName').value).length > 0) {
          this.errorMessagenewSms = MsgList.smsTemplateNameExist;

          setTimeout(() => {
            this.errorMessagenewSms = '';
          }, 2000);
          return false;

        }
        this.voucherNumberInsered = this.newTemplateForm.value.TemplateFormat.indexOf('<מספר שובר>') == -1;
        this.voucherValidityInsered = this.newTemplateForm.value.TemplateFormat.indexOf('<תוקף>') == -1;

        if (this.newTemplateForm.value.TemplateFormat.indexOf('<תוקף>') != -1 &&
          this.newTemplateForm.value.TemplateFormat.indexOf('<מספר שובר>') != -1) {
          this.spinnerNewTemp = true;
          let objToApi = {
            Token: this.userToken,
            TemplateName: this.newTemplateForm.get('TemplateName').value.trim(),
            SenderName: this.newTemplateForm.get('SenderName').value.trim(),
            TemplateFormat: this.newTemplateForm.get('TemplateFormat').value,
          }

          this.dataService.CreateOrUpdateSMSTemplate(objToApi).subscribe(result => {
            this.spinnerNewTemp = false;
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

            // if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0 && result.errdesc == 'Template Created Successfully') {
            this.templatesSMS.unshift(...result.obj);

            this.saveMessage = 'נשמר בהצלחה';
            setTimeout(() => {
              this.saveMessage = '';
              this.openNewTemplate = false;
            }, 2000);

            this.resetNewTemplate();
            this.voucherNumberInsered = true;
            this.voucherValidityInsered = true;


            this.createForm('SMSForm', this.templatesSMS, 'Id-');

            // }
            // if (typeof result == 'string') {
            //   this.errorMessagenewSms = result;

            //   setTimeout(() => {
            //     this.errorMessagenewSms = '';
            //   }, 5000)
            // }
            // if (result.obj == null && result.errdesc != '' && result.errdesc != null) {
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
          });
        }
        else {
          this.errorMessagenewSms = 'נא להזין שדות חובה';

          setTimeout(() => {
            this.errorMessagenewSms = '';
          }, 2000);
        }
      }
      else {
        this.errorMessagenewSms = 'נא למלא את כל השדות';

        setTimeout(() => {
          this.errorMessagenewSms = '';
        }, 2000);
      }
    }
  }

  resetNewTemplate() {

    this.newTemplateForm.reset();
    this.newTemplateForm.get('TemplateName').setValue('');
    this.newTemplateForm.get('SenderName').setValue('');
    this.newTemplateForm.get('TemplateFormat').setValue('');
    this.newTemplateFormView = false;

    setTimeout(() => {
      this.newTemplateFormView = true;
    }, 100);
  }
  editTemplate(template, index) {
    //close another template if it been opened
    if (this.editingTempId != undefined && this.editingTempId != -1) {
      this.closeTemplate({ Id: this.editingTempId });
    }
    this.edit = !this.edit;
    this.editingTempId = template.Id;


    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      this.SMSForm.get('Id-' + template.Id).get('TemplateFormat' + template.Id).enable();
      this.SMSForm.get('Id-' + template.Id).get('SenderName' + template.Id).enable();
      this.SMSForm.get('Id-' + template.Id).get('TemplateName' + template.Id).enable();

      this.textAreas.find((item, idx) => {
        return (idx) === index;
      }).nativeElement.focus();
    }
  }


  editButtonClicked(obj, buttonName) {
    //not new template
    if (obj != '') {
      // fill textArea
      let valueTA = this.SMSForm.get('Id-' + obj.Id).get('TemplateFormat' + obj.Id).value;
      let textAreaValue = valueTA != null ? valueTA : '';
      this.SMSForm.get('Id-' + obj.Id).get('TemplateFormat' + obj.Id).setValue(textAreaValue + ' <' + buttonName + '>');
      //focus text area

      this.textAreas.find((item, idx) => {
        return (+item.nativeElement.id.split('textareas')[1]) === obj.Id;
      }).nativeElement.focus();
    }

    //if new template
    else {
      let valueTA = this.newTemplateForm.get('TemplateFormat').value;
      let textAreaValue = valueTA != null ? valueTA : '';
      this.newTemplateForm.get('TemplateFormat').setValue(textAreaValue + ' <' + buttonName + '>');

      //focus text area
      this.newTemplate.nativeElement.focus();
    }


  }

  deleteTemplate(template) {
    /**
     * Route: /api/SMS/DeleteSMSTemplate
Json: 
{
    "Token":"BHW6RE5gNkygs4EjlXCFyC8K8DKouFhkgCfEtAob2zA1",
    "TemplateId":6
}
     */
    if (this.pagePermissionAccessLevel.AccessLevel != this.MockData.accessLevelReadOnly) {
      this.dialog.open(DialogConfirmComponent, {
        data: { message: 'האם למחוק ' + template.TemplateName + ' ?', closeNameButton: 'בעצם לא' }
      }).afterClosed().subscribe(result => {
        if (result.result == 'yes') {

          let objToApi = {
            Token: this.userToken,
            TemplateId: template.Id
          }

          this.dataService.DeleteSMSTemplate(objToApi).subscribe(result => {
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

            // if (result.errdesc.includes('Template is Deleted Successfully')) {
            this.dialog.open(DialogComponent, {
              data: { message: 'נמחק בהצלחה' }
            })

            this.templatesSMS = this.templatesSMS.filter(temp => temp.Id != template.Id);
            // }
            // if (typeof result == 'string') {
            //   // this.errorMsg = result;
            //   setTimeout(() => {
            //     // this.errorMsg = '';
            //   }, 5000)
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
      });
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: this.MsgList.readOnly }
      })
    }

  }
  closeTemplate(template) {
    this.edit = !this.edit;
    this.editingTempId = -1;

    this.SMSForm.get('Id-' + template.Id).get('TemplateFormat' + template.Id).disable();
    this.SMSForm.get('Id-' + template.Id).get('SenderName' + template.Id).disable();
    this.SMSForm.get('Id-' + template.Id).get('TemplateName' + template.Id).disable();
  }

  sendSMSForExample(template, newTmp: boolean) {
    if (newTmp) {
      this.voucherValidityInsered = this.newTemplateForm.get('TemplateFormat').value.indexOf('<תוקף>') == -1 ? false : true;
      this.voucherNumberInsered = this.newTemplateForm.get('TemplateFormat').value.indexOf('<מספר שובר>') == -1 ? false : true;
    }
    if (newTmp && !this.newTemplateForm.valid || (this.voucherValidityInsered == false || this.voucherNumberInsered == false)) {
      this.newTemplateSendError = 'נא למלא שדות חובה';
      setTimeout(() => {
        this.newTemplateSendError = '';
      }, 2000);
    }
    if ((newTmp && this.newTemplateForm.valid && this.voucherValidityInsered && this.voucherNumberInsered) || !newTmp) {


      this.dialog.open(PhoneConfirmComponent, {
        data: { message: ' ?מה מספר טלפון לשליחת SMS' }
      }).afterClosed().subscribe(result => {
        if (result != undefined && result.result != 'no') {
          this.newSMSSend = newTmp;
          if (result.result.includes('phone')) {

            this.spinnerById[0] = template['Id'];
            let phone = result.result.split('phone: ')[1];


            let objToApi = {
              Token: this.userToken,
              TemplateFormat: template.TemplateFormat,
              Phone: phone,
              SenderName: template.SenderName
            }



            this.dataService.SendSampleMessage(objToApi).subscribe(result => {



              this.spinnerById[0] = -1;
              if (typeof result == 'string') {
                // this.dialog.open(DialogComponent, {
                //   data: { message: result }
                // })

                // this.sharedService.exitSystemEvent();
                return false;
              }
              this.newSMSSend = !this.newSMSSend;
              // if (result['Token'] != undefined || result['Token'] != null) {
              //set new token
              let tempObjUser = JSON.parse(localStorage.getItem('user'));
              tempObjUser['Token'] = result['Token'];
              localStorage.setItem('user', JSON.stringify(tempObjUser));
              this.userToken = result['Token'];


              // if (result.obj == 'OK') {
              this.dialog.open(DialogComponent, {
                data: { message: 'נשלח בהצלחה' }
              });
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
        }
        else if (result.result == 'no') {
          this.newSMSSend = false;
        }
      })
    }
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }

}



export interface DialogData {
  message: any,
  phone: any
}
@Component({
  selector: 'phone-confirm',
  templateUrl: './confirmPhone.component.html',
  styleUrls: ['./phone-confirm-dialog.component.css'],
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
export class PhoneConfirmComponent implements OnInit {

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<PhoneConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private route: Router) { }

  phoneControl = new FormControl();

  errorPhone: string = '';
  MsgList = MsgList;

  ngOnInit(): void {

    this.phoneControl.setValidators([Validators.required, Validators.pattern('[[0][0-9]{9}]*')]);
  }

  dialogClose() {
    this.dialogRef.close();
  }
  yes() {

    if (this.phoneControl.valid) {
      this.dialogRef.close({ result: 'phone: ' + this.phoneControl.value });
    }
    else {
      this.errorPhone = 'נא להזין מספר טלפון תקין';
      setTimeout(() => {
        this.errorPhone = '';
      }, 2000);
    }
  }
  no() {
    this.dialogRef.close({ result: 'no' });
  }
}