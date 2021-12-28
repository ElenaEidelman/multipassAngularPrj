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
    this.activatedRoute.queryParams.subscribe(params => {
      debugger
      if (Object.keys(params).length > 0) {
        let orderid = params['orderid'];
        this.GetResume(orderid);
      }
      else {
        this.thankyouResponse = {
          B2C_ThoWho: 'טסט',
          B2C_Email: 'טסט@טסט',
          B2C_Mobile: '0500000000'
        }
      }
    });
  }

  GetResume(orderid) {

    let objToApi = {
      OrderIdEnc: orderid
    }
    this.dataService.GetResume(objToApi).subscribe(result => {
      this.thankyouResponse = result.obj[0]["OrderHeader"][0];
      console.log(result.obj[0]);
    })
  }

  resendGiftCard() {
    let companyInfo = localStorage.getItem('companyInfo');
    localStorage.removeItem('companyInfo');

    // let rout = this.router.url;
    // debugger
    // let test = this.activatedRoute.params.subscribe(result => {
    //   debugger
    // })

    // let test = document.location.host + '/login?companyid=' + companyInfo;

    // let k = "localhost:4200/login?companyid=bC1uVdEINfm7oJNltQd3PA2";
    // debugger

    window.location.href = companyInfo;
  }

}
