import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { encode } from 'querystring';
import { MockData } from 'src/app/Classes/mockData';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { IframeSeviceService } from 'src/app/Services/IframeService/iframe-sevice.service';
import { IframeSharingServiceService } from 'src/app/Services/IframeService/iframe-sharing-service.service';
import { SharedService } from 'src/app/Services/SharedService/shared.service';

@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./iframe.component.css'],

})
export class IframeComponent implements OnInit, OnChanges {

  //iframe values
  @ViewChild('infoTitle') infoTitle: ElementRef;
  // @ViewChild('Logo') Logo: ElementRef;

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }
  companyId;

  // IframeSrc;
  iframeChange: boolean = true;
  iframeObj;
  MsgList = MsgList;
  MockData = MockData;
  setupSpinner: boolean = false;


  constructor(
    private dataServiceIframe: IframeSeviceService,
    private dataService: DataServiceService,
    private fb: FormBuilder,
    private iframeSharingServiceService: IframeSharingServiceService,
    private dialog: MatDialog,
    private router: Router,
    private sharedService: SharedService,
    protected sanitizer: DomSanitizer) { }

  previewForm = this.fb.group({
    ExternalLink: [''],
    CompanyName: [''],
    GiftCardPic: [''],
    BackGround: [''],
    Logo: [''],
    Phone: [''],//, Validators.pattern('[0]{1}[0-9]{1,2}[0-9]{7}|[*]{1}[0-9]{3,5}')
    Mail: [''],//, Validators.email
    // Website: [''],
    LinktoBranches: [''],
    ShortDescription: [''],
    LongDescription: [''],
    Marketing: [''],
    Instructions: [''],
  });
  iframeDataSpare;

  iframePicsFormData;

  GiftCardPicSrc: string = '';
  BackGroundSrc: string = '';
  // LogoSrc: string = '';
  ngOnInit(): void {

    this.iframePicsFormData = new FormData();

    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));
    this.sharedService.pagesAccessLevel.next('');

    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.previewForm.disable();
    }

    //formData contain images
    this.iframePicsFormData.append('BackGround', '');
    this.iframePicsFormData.append('GiftCardPic', '');
    this.iframePicsFormData.append('Logo', '');

    this.iframeSharingServiceService.companyId.subscribe(result => {
      if (result != '') {
        this.companyId = result;
        this.getIframeSetup();
      }
    })
    this.formChanges();

  }


  getIframeSetup() {

    this.setupSpinner = true;
    // let companyId = localStorage.getItem('companyId');
    let objToApi = {
      CompanyIdEnc: this.companyId
    }

    this.dataServiceIframe.GetIFrameCompanyInfo(objToApi).subscribe(result => {

      this.setupSpinner = false;
      if (typeof result == 'object') {
        if (result.err != -1) {
          let IframeSetupObj = result.obj[0];

          this.iframeDataSpare = JSON.parse(JSON.stringify(result.obj[0]));

          Object.keys(this.previewForm.controls).forEach(control => {
            if (this.iframePicsFormData.has(control)) {
              this.iframePicsFormData.set(control, IframeSetupObj[control])
            }
            this.previewForm.get(control).setValue(IframeSetupObj[control]);
          })
        }
        else {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          })
          // alert(result.errdesc);
        }
      }
      else if (typeof result == 'string') {
        alert(result);
      }
    })
  }

  // changeIframe() {
  //   this.iframeChange = !this.iframeChange;
  // }

  formChanges() {
    this.previewForm.valueChanges.subscribe(result => {

      // var regExpForFontFamily = /font-family:([^";]+)/g;
      // for (const element in result) {
      //   result[element] = result[element].replace(regExpForFontFamily, "font-family: Assistant !important;")
      // }

      this.iframeSharingServiceService.setPreviwIframeInfo(result);
    })
  }

  fileOptionChange(event, controlName) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (file.type.includes('image')) {
        if (file.size > 2500000) {
          this.dialog.open(DialogComponent, {
            data: { message: 'קובץ כבד מדי' }
          })

        }
        else {
          this.iframePicsFormData.set(controlName, file);

          //preview img
          const reader = new FileReader();
          let imageSrc = '';
          reader.readAsDataURL(file);
          reader.onload = () => {

            imageSrc = reader.result as string;
            this[controlName + 'Src'] = imageSrc;
            this.previewForm.get(controlName).setValue(imageSrc);

          };
        }
      }
      else {
        this[controlName].nativeElement.value = '';
        this.dialog.open(DialogComponent, {
          data: { message: 'קובץ אינו תקין' }
        })
      }
    }
  }

  cleareAttachedFile(controlName) {
    this.previewForm.get(controlName).setValue('');
    this[controlName + 'Src'] = '';
    this[controlName].nativeElement.value = '';
  }

  //remove double back slash //
  checkPath(path) {
    if (path.includes('data:')) {
      return path;
    }
    let checkedPath = '';
    let getHttpValue = Object.values(path.split('//')).splice(0, 1);
    let getPathWithoutHttp = Object.values(path.split('//')).splice(1).join('/');

    checkedPath = getHttpValue + '//' + getPathWithoutHttp;
    return checkedPath;
  }

  saveDataForIframe() {
    if (this.previewForm.valid) {
      this.setupSpinner = true;

      //var regExpForFontFamily = /font-family:([^";]+)/g;
      //str.replace(regExpForFontFamily, "font-family: Assistant !important;")

      this.iframePicsFormData.append('CompanyIdEnc', this.companyId)
      this.iframePicsFormData.append('CompanyName', encodeURIComponent(this.previewForm.get('CompanyName').value.toString()))
      this.iframePicsFormData.append('ExternalLink', this.previewForm.get('ExternalLink').value.toString())//
      this.iframePicsFormData.append('Phone', encodeURIComponent(this.previewForm.get('Phone').value.toString()))
      this.iframePicsFormData.append('Mail', encodeURIComponent(this.previewForm.get('Mail').value.toString()))
      this.iframePicsFormData.append('LinktoBranches', this.previewForm.get('LinktoBranches').value)
      this.iframePicsFormData.append('ShortDescription', encodeURIComponent(this.previewForm.get('ShortDescription').value.toString()))
      this.iframePicsFormData.append('LongDescription', encodeURIComponent(this.previewForm.get('LongDescription').value.toString()))
      this.iframePicsFormData.append('Marketing', this.previewForm.get('Marketing').value)
      this.iframePicsFormData.append('Instructions', encodeURIComponent(this.previewForm.get('Instructions').value.toString()))

      let t = this.iframePicsFormData.getAll('ShortDescription');
      let t2 = this.iframePicsFormData.getAll('LongDescription');
      let t3 = this.iframePicsFormData.getAll('CompanyIdEnc');
      let t4 = this.iframePicsFormData.getAll('CompanyName');


      debugger
      this.dataServiceIframe.InsertUpdateIFrame(this.iframePicsFormData).subscribe(result => {
        debugger

        this.iframePicsFormData = new FormData();
        this.setupSpinner = false;
        if (typeof result == 'object') {
          if (result.err >= 0) {
            this.dialog.open(DialogComponent, {
              data: { message: this.MsgList.savedSuccessfully }
            })
            this.ngOnInit();
          }
          else {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            })
          }
        }
        else {
          this.dialog.open(DialogComponent, {
            data: { message: result }
          })
        }
      })
    }
    else {
      this.dialog.open(DialogComponent, {
        data: { message: 'נא למלא את כל שדות חובה' }
      })
    }
  }



  returnDataToIframe(control) {

    this.previewForm.get(control).setValue(this.iframeDataSpare[control]);
    this.iframePicsFormData.set(control, this.iframeDataSpare[control])
    this.iframeSharingServiceService.setPreviwIframeInfo(this.previewForm.value)
  }

  ngOnChanges(changes: SimpleChanges) {
    // this.previewForm.valueChanges.subscribe(result => {
    // })
    // You can also use yourInput.previousValue and 
  }
}
