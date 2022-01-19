import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, PatternValidator, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterOutlet, RouterState } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { IframeSeviceService } from 'src/app/Services/IframeService/iframe-sevice.service';
import { IframeSharingServiceService } from 'src/app/Services/IframeService/iframe-sharing-service.service';
import { SharedService } from 'src/app/Services/SharedService/shared.service';


@Component({
  selector: 'app-log-in-iframe',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
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
export class LogInIframeComponent implements OnInit {
  /**
   * 5326100350000992
   * 890108558
   * 03/22
   * 500
   */
  //login page: http://localhost:4200/giftCard/login?companyid=bC1uVdEINfm7oJNltQd3PA2
  //iframe page: http://localhost:4200/gift-card?companyid=bC1uVdEINfm7oJNltQd3PA2
  //thankyou page:  http://localhost:4200/gift-card?orderid=DkUs8NIluuQ5Mqd5Byh78w2


  companyid;

  constructor(
    private route: Router,
    private fb: FormBuilder,
    private dataServiceIframe: IframeSeviceService,
    private dataService: DataServiceService,
    private sharingIframeService: IframeSharingServiceService,
    private sharedService: SharedService,
    private domain: ActivatedRoute,
    private dialog: MatDialog) {

    // this.sharingService.GetCompanyEncryptedId().subscribe(() => {

    //   this.GetIFrameCompanyInfo();
    // })
  }


  infoData;
  msgAlert: string = 'נא להזין סכום המבוקש';
  minAmount;
  spareData;
  companyIdByParams: boolean = false;

  previewLongDescription: boolean = false;

  sumForm = this.fb.group({
    cardSumControl: ['']
  });

  ngOnInit() {


    if (localStorage.getItem('baseUrl') == '') {
      this.dataService.getHost().subscribe(result => {
        this.sharedService.pagesPermission.next(result['pagesPermission']);

        localStorage.setItem('baseUrl', result['baseUrl']);
      })
    }

    this.GetIFrameCompanyId();

    //get minimum price for iframe
    this.dataServiceIframe.minAmount.subscribe(minAmount => {
      this.minAmount = minAmount;
      this.sumForm.get('cardSumControl').setValidators([Validators.required, Validators.min(this.minAmount)])
    })

    //change iframe data for preview
    this.sharingIframeService.iframePreviewInfo.subscribe(result => {

      if (this.infoData != undefined) {
        Object.keys(result).forEach(key => {

          // if ((key == 'GiftCardPic' || key == 'Logo' || key == 'BackGround') && result[key] == '') {
          //   this.infoData[key] = this.spareData[key];
          // }
          // else {
          //   this.infoData[key] = result[key];
          // }
          // if (result[key] != '') {
          this.infoData[key] = result[key];
          // }
          // else {
          //   this.infoData[key] = this.spareData[key];
          // }

        })
      }
    })
  }

  GetIFrameCompanyId() {
    this.domain.queryParamMap.subscribe(param => {

      //if company id get by url parameters
      if (Object.keys(param['params']).length != 0) {
        this.companyid = param['params']['companyid'];
        this.sharingIframeService.companyId.next(param['params']['companyid']);
        this.companyIdByParams = true;
        this.sharingIframeService.iframeCalledFromMultitav.next(!this.companyIdByParams + '');
        // localStorage.setItem('companyId', param['params']['companyid']);
        // localStorage.setItem('companyInfo', document.location.href);

        this.getIframeCompanyInfo();
      }


      else {
        this.sharingIframeService.iframeCalledFromMultitav.next(!this.companyIdByParams + '');
        let objToApi = {
          Token: JSON.parse(localStorage.getItem('user'))['Token']
        }

        this.dataService.GetIFrameB2CLink(objToApi).subscribe(result => {

          if (typeof result == 'object') {
            if (result.err != -1) {
              this.companyid = result.obj.split('companyid=')[1];

              this.sharingIframeService.companyId.next(result.obj.split('companyid=')[1])


              this.getIframeCompanyInfo();
            }
            else {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              })
              this.sharedService.exitSystemEvent();
            }
          }
          else {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            })
          }
        });

        // this.companyid = this.companyId != undefined ? this.companyId : localStorage.getItem('companyId');
      }
    })
  }


  getIframeCompanyInfo() {
    let objToApi = {
      CompanyIdEnc: this.companyid
    }

    this.dataService.GetIFrameCompanyInfo(objToApi).subscribe(result => {
      if (result.obj != undefined && result.obj != null && Object.keys(result.obj).length > 0) {
        this.sharingIframeService.companyInfoService.next(JSON.stringify(result));
        this.infoData = result.obj[0];
        debugger
        this.spareData = JSON.parse(JSON.stringify(this.infoData))

      }
    })
  }


  previewLongDescriptionFunc() {
    this.previewLongDescription = !this.previewLongDescription;
  }
  returnContactData(data) {
    return this.infoData.contacts.filter(element => Object.keys(element) == data)[0][data];
  }

  onSubmit() {


    if (this.sumForm.get('cardSumControl').valid) {
      //if company id got by parameters from url, navigate to another link

      if (this.companyIdByParams) {
        this.route.navigate(['/gift-card/' + this.sumForm.get('cardSumControl').value], { skipLocationChange: true });
      }
      else {
        // this.route.navigate(['public/admin/iframe/iframeView/gift-card/' + this.sumForm.get('cardSumControl').value], { skipLocationChange: true });
        this.dialog.open(DialogComponent, {
          data: { message: 'כפתור אינו פעיל, דף זה רק לתצוגה' }
        })
      }
    }
    else {

    }
  }


  addHyphenToPhoneNumber(phoneNumber) {
    let phoneIncludeHyphen = '';
    if (phoneNumber.includes('-')) {
      return phoneNumber;
    }
    if (phoneNumber.length >= 10) {
      phoneIncludeHyphen = [...Array.from(phoneNumber).slice(0, 3), '-', ...Array.from(phoneNumber).slice(3)].join('');
    }
    else if (phoneNumber.length <= 9) {
      phoneIncludeHyphen = [...Array.from(phoneNumber).slice(0, 2), '-', ...Array.from(phoneNumber).slice(2)].join('');
    }
    return phoneIncludeHyphen;
  }
}
