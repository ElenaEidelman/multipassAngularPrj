import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IframeSeviceService } from 'src/app/Services/IframeService/iframe-sevice.service';
import { IframeSharingServiceService } from 'src/app/Services/IframeService/iframe-sharing-service.service';

@Component({
  selector: 'app-thanks-page',
  templateUrl: './thanks-page.component.html',
  styleUrls: ['./thanks-page.component.css']
})
export class ThanksPageComponent implements OnInit {

  constructor(private dataService: IframeSeviceService,
    private activatedRoute: ActivatedRoute,
    private sharingService: IframeSharingServiceService,
    private router: Router) {
  }


  thankyouResponse;
  @Input() orderId = '';
  ngOnInit() {
    debugger
    localStorage.removeItem('picSizeInMega');

    this.activatedRoute.queryParams.subscribe(params => {
      debugger
      if (Object.keys(params).length > 0) {
        let orderid = params['orderid'];
        this.GetResume(orderid);
      }
      else {
        this.thankyouResponse = {
          B2C_ThoWho: 'ישראל',
          B2C_Email: 'MyFriend@test.com',
          B2C_Mobile: '050-0000000'
        }
      }
    });
  }

  GetResume(orderid) {

    let objToApi = {
      OrderIdEnc: orderid
    }
    this.dataService.GetResume(objToApi).subscribe(result => {
      debugger
      this.thankyouResponse = result.obj[0]["OrderHeader"][0];
      console.log(result.obj[0]);
    })
  }

  resendGiftCard() {
    let companyInfo = localStorage.getItem('companyInfo');
    debugger


    window.location.href = localStorage.getItem('companyInfo');
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
