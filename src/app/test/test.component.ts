import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { DataServiceService } from '../data-service.service';
import { IframeSeviceService } from '../Services/IframeService/iframe-sevice.service';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css']
})
export class TestComponent implements OnInit {
  IframeSrc;
  iframeChange: boolean = true;
  iframeSRC;
  console;

  constructor(private domSanitizer: DomSanitizer, private dataService: DataServiceService, private dataServiceIframe: IframeSeviceService) { }

  ngOnInit(): void {
    // this.IframeSrc = this.sanitizer.bypassSecurityTrustHtml('/iframeGiftCard')
    // this.IframeSrc = '/iframeGiftCard'
    this.iframeSRC = this.domSanitizer.bypassSecurityTrustResourceUrl('');
  }

  LoginByCompanyId() {
    // this.iframeChange = !this.iframeChange;
    var objToApi = {
      CompanyIdEnc: "aQwPrFXnUMnNYm6Tr4Pp3g2",
      HostingURL: "https://tempdomain-test-7.mltp.co.il"
    };
    //debugger
    this.dataService.testApiToTest7(objToApi, 'LoginByCompanyId').subscribe(result => {
      debugger
      this.console = 'result is: ' + result;
    })
  }


  OpenIframe() {
    this.iframeSRC = this.domSanitizer.bypassSecurityTrustResourceUrl('https://tempdomain-test-7.mltp.co.il/gift-card?orderid=DkUs8NIluuQ5Mqd5Byh78w2');
  }

  GetIFrameCompanyInfo() {
    var objToApi = {
      CompanyIdEnc: 'bC1uVdEINfm7oJNltQd3PA2'
    };
    debugger
    this.dataService.testApiToTest7(objToApi, 'GetIFrameCompanyInfo').subscribe(result => {
      debugger
      this.console = 'result is: ' + result;
    })
  }


  GetIFrameCompanyInfoTem3() {
    var objToApi = {
      CompanyIdEnc: 'bC1uVdEINfm7oJNltQd3PA2'
    };
    debugger
    this.dataServiceIframe.GetIFrameCompanyInfo(objToApi).subscribe(result => {
      debugger
      this.console = result;
    })
  }
}
