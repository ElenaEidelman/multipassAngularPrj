import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { IframeSharingServiceService } from 'src/app/Services/IframeService/iframe-sharing-service.service';

@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html',
  styleUrls: ['./iframe.component.css']
})
export class IframeComponent implements OnInit, OnChanges {

  //iframe values
  @ViewChild('infoTitle') infoTitle: ElementRef;
  companyId;

  // IframeSrc;
  iframeChange: boolean = true;
  iframeObj;
  MsgList = MsgList;
  setupSpinner: boolean = false;


  constructor(
    private dataService: DataServiceService,
    private fb: FormBuilder,
    private iframeSharingServiceService: IframeSharingServiceService,
    private dialog: MatDialog,
    private router: Router) { }

  previewForm = this.fb.group({
    ExternalLink: [''],
    GiftCardPic: [''],
    BackGround: [''],
    Logo: [''],
    Phone: ['', Validators.pattern('[0]{1}[0-9]{2,3}[0-9]{7}')],
    Mail: ['', Validators.email],
    Website: [''],
    BranchLinks: [''], // temporary using Website !!!!!!
    ShortDescription: [''],
    LongDescription: [''],
    Marketing: [''],
    Instructions: [''],
  });
  iframeDataSpare;

  iframePicsFormData;

  GiftCardPicSrc: string = '';
  BackGroundSrc: string = '';
  LogoSrc: string = '';
  ngOnInit(): void {
    this.iframePicsFormData = new FormData();


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
    this.dataService.GetIFrameCompanyInfo(objToApi).subscribe(result => {
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
            debugger
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

  saveDataForIframe() {
    if (this.previewForm.valid) {
      this.setupSpinner = true;
      this.iframePicsFormData.append('CompanyIdEnc', this.companyId)
      this.iframePicsFormData.append('ExternalLink', this.previewForm.get('ExternalLink').value)
      this.iframePicsFormData.append('Phone', this.previewForm.get('Phone').value)
      this.iframePicsFormData.append('Mail', this.previewForm.get('Mail').value)
      this.iframePicsFormData.append('Website', this.previewForm.get('Website').value)
      this.iframePicsFormData.append('ShortDescription', this.previewForm.get('ShortDescription').value)
      this.iframePicsFormData.append('LongDescription', this.previewForm.get('LongDescription').value)
      this.iframePicsFormData.append('Marketing', this.previewForm.get('Marketing').value)
      this.iframePicsFormData.append('Instructions', this.previewForm.get('Instructions').value)

      let t = this.iframePicsFormData.getAll('CompanyIdEnc');
      debugger
      this.dataService.InsertUpdateIFrame(this.iframePicsFormData).subscribe(result => {
        this.setupSpinner = false;
        if (typeof result == 'object') {
          if (result.errdesc != -1) {
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
