import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Inject, Input, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, NgControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { resourceUsage } from 'process';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-all-sms-templates',
  templateUrl: './all-sms-templates.component.html',
  styleUrls: ['./all-sms-templates.component.css'],
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
export class AllSmsTemplatesComponent implements OnInit {

  @ViewChildren("txtArea") textAreas: QueryList<ElementRef>;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('newTemplate') newTemplate: ElementRef;

  spinnerId = -1;
  spinnerById = [];
  newSMSSend: boolean = false;

  
  userToken;
  userId;
  errorMessagenewSms: string = '';
  spinnerNewTemp: boolean = false;
  newTemplateSendError: string = '';
  MsgList = MsgList;

  templatesSMS = [];

  newTemplateForm = this.fb.group({
    TemplateName: ['', Validators.required],
    SenderName: ['', Validators.required],
    TemplateFormat: ['', Validators.required]
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

    this.GetSMSFormats();

    // this.createForm('SMSForm', this.templatesSMS, 'Id-');
  }

  GetSMSFormats() {

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetSMSFormats(objToApi).subscribe(result => {
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {

          this.templatesSMS.push(...result.obj);

          this.createForm('SMSForm', this.templatesSMS, 'Id-');
        }
        if (typeof result == 'string') {
          // this.errorMsg = result;
          setTimeout(() => {
            // this.errorMsg = '';
          }, 5000)
        }
        if (result.errdesc != '' && result.errdesc != null) {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          })
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


  createForm(form, values, controlName) {
    this[form] = this.fb.group({});
    const validators = [Validators.required];
    values.forEach((value) => {
      let group = this.fb.group({});
      group.addControl('TemplateFormat' + value.Id, this.fb.control([value.TemplateFormat, validators]));
      group.addControl('SenderName' + value.Id, this.fb.control([value.SenderName, validators]));
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

        let objToApi = {
          Token: this.userToken,
          TemplateName: this.SMSForm.get('Id-' + template.Id).get('TemplateName' + template.Id).value,
          SenderName: this.SMSForm.get('Id-' + template.Id).get('SenderName' + template.Id).value,
          TemplateFormat: this.SMSForm.get('Id-' + template.Id).get('TemplateFormat' + template.Id).value,
          TemplateId: template.Id
        }


        this.dataService.CreateOrUpdateSMSTemplate(objToApi).subscribe(result => {
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {

              document.getElementById('msgBySms' + template.Id).innerHTML = 'נשמר בהצלחה';
              setTimeout(() => {
                document.getElementById('msgBySms' + template.Id).innerHTML = '';
                this.edit = !this.edit;
                this.editingTempId = -1;
              }, 2000);

              this.SMSForm.get('Id-' + template.Id).get('TemplateFormat' + template.Id).disable();
              this.SMSForm.get('Id-' + template.Id).get('SenderName' + template.Id).disable();
              this.SMSForm.get('Id-' + template.Id).get('TemplateName' + template.Id).disable();
            }
            if (typeof result == 'string') {
              this.errorMessagenewSms = result;

              setTimeout(() => {
                this.errorMessagenewSms = '';
              }, 5000)
            }
            if (result.obj == null && result.errdesc != '' && result.errdesc != null) {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              })
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
        document.getElementById('msgErrorBySms' + template.Id).innerHTML = 'נא למלא את כל השדות';

        setTimeout(() => {
          document.getElementById('msgErrorBySms' + template.Id).innerHTML = '';
        }, 2000);
      }
    }
    else {
      if (this.newTemplateForm.valid) {
        this.spinnerNewTemp = true;
        let objToApi = {
          Token: this.userToken,
          TemplateName: this.newTemplateForm.get('TemplateName').value,
          SenderName: this.newTemplateForm.get('SenderName').value,
          TemplateFormat: this.newTemplateForm.get('TemplateFormat').value,
        }

        this.dataService.CreateOrUpdateSMSTemplate(objToApi).subscribe(result => {
          this.spinnerNewTemp = false;
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0 && result.errdesc == 'Template Created Successfully') {
              this.templatesSMS.unshift(...result.obj);

              this.saveMessage = 'נשמר בהצלחה';


              this.newTemplateForm.get('TemplateName').setValue('');
              this.newTemplateForm.get('SenderName').setValue('');
              this.newTemplateForm.get('TemplateFormat').setValue('');

              setTimeout(() => {
                this.saveMessage = '';
                this.openNewTemplate = false;
              }, 2000);
              this.createForm('SMSForm', this.templatesSMS, 'Id-');

            }
            if (typeof result == 'string') {
              this.errorMessagenewSms = result;

              setTimeout(() => {
                this.errorMessagenewSms = '';
              }, 5000)
            }
            if (result.obj == null && result.errdesc != '' && result.errdesc != null) {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              })
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
        this.errorMessagenewSms = 'נא למלא את כל השדות';

        setTimeout(() => {
          this.errorMessagenewSms = '';
        }, 2000);
      }
    }
  }

  editTemplate(template, index) {
    this.edit = !this.edit;
    this.editingTempId = template.Id;
    this.SMSForm.get('Id-' + template.Id).get('TemplateFormat' + template.Id).enable();
    this.SMSForm.get('Id-' + template.Id).get('SenderName' + template.Id).enable();
    this.SMSForm.get('Id-' + template.Id).get('TemplateName' + template.Id).enable();

    this.textAreas.find((item, idx) => {
      return (idx) === index;
    }).nativeElement.focus();
  }
  editButtonClicked(obj, buttonName) {
    if (obj != '') {

      // fill textArea
      let valueTA = this.SMSForm.get('Id-' + obj.Id).get('TemplateFormat' + obj.Id).value;
      let textAreaValue = valueTA != null ? valueTA : '';
      this.SMSForm.get('Id-' + obj.Id).get('TemplateFormat' + obj.Id).setValue(textAreaValue + ' <' + buttonName + '>');
      //focus text area
      this.textAreas.find((item, idx) => {
        return (idx) === obj.Id;
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
    this.dialog.open(DialogConfirmComponent, {
      data: { message: 'האם למחוק ' + template.TemplateName + ' ?' }
    }).afterClosed().subscribe(result => {
      if (result.result == 'yes') {

        let objToApi = {
          Token: this.userToken,
          TemplateId: template.Id
        }

        this.dataService.DeleteSMSTemplate(objToApi).subscribe(result => {
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (result.errdesc.includes('Template is Deleted Successfully')) {
              this.dialog.open(DialogComponent, {
                data: { message: 'נמחק בהצלחה' }
              })

              this.templatesSMS = this.templatesSMS.filter(temp => temp.Id != template.Id);
            }
            if (typeof result == 'string') {
              // this.errorMsg = result;
              setTimeout(() => {
                // this.errorMsg = '';
              }, 5000)
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
    });

  }
  closeTemplate(template) {
    this.edit = !this.edit;
    this.editingTempId = -1;

    this.SMSForm.get('Id-' + template.Id).get('TemplateFormat' + template.Id).disable();
    this.SMSForm.get('Id-' + template.Id).get('SenderName' + template.Id).disable();
    this.SMSForm.get('Id-' + template.Id).get('TemplateName' + template.Id).disable();
  }

  sendSMSForExample(template, newTmp: boolean) {
    debugger
    if(newTmp && !this.newTemplateForm.valid){
        this.newTemplateSendError = 'נא למלא שדות חובה';
        setTimeout(() => {
          this.newTemplateSendError = '';
        }, 2000);
    }
    if((newTmp && this.newTemplateForm.valid) || !newTmp){
      this.dialog.open(PhoneConfirmComponent, {
        data: { message: ' ?מה מספר טלפון לשליחת SMS' }
      }).afterClosed().subscribe(result => {
        this.newSMSSend = newTmp;
        if (result.result.includes('phone')) {

          this.spinnerById[0] = template['Id'];
          let phone = result.result.split('phone: ')[1];

          let objToApi = {
            Token: this.userToken,
            TemplateFormat: template.TemplateFormat,
            Phone: phone
          }


          this.dataService.SendSampleMessage(objToApi).subscribe(result => {
            this.spinnerById[0] = -1;
            this.newSMSSend = !this.newSMSSend;
            if (result['Token'] != undefined || result['Token'] != null) {
              //set new token
              let tempObjUser = JSON.parse(localStorage.getItem('user'));
              tempObjUser['Token'] = result['Token'];
              localStorage.setItem('user', JSON.stringify(tempObjUser));
              this.userToken = result['Token'];

              debugger
              if (result.obj == 'OK') {
                this.dialog.open(DialogComponent, {
                  data: { message: 'נשלח בהצלחה' }
                });
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
      })
    }

  // }
  // else{

  // }
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
export class PhoneConfirmComponent implements OnInit {

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<PhoneConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private route: Router) { }

  phoneControl = new FormControl();
  
  errorPhone: string = '';
  MsgList = MsgList;

  ngOnInit(): void {

    this.phoneControl.setValidators([Validators.required,Validators.pattern('[[0][0-9]{9}]*')]);
  }

  dialogClose() {
    this.dialogRef.close();
  }
  yes() {
    debugger
      if(this.phoneControl.valid){
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