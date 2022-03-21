import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { MockData } from 'src/app/Classes/mockData';
import { MsgList } from 'src/app/Classes/msgsList';
import { SharedService } from 'src/app/Services/SharedService/shared.service';

@Component({
  selector: 'app-admin-iframe',
  templateUrl: './admin-iframe.component.html',
  styleUrls: ['./admin-iframe.component.css']
})
export class AdminIframeComponent implements OnInit {

  companyId;
  MockData = MockData;
  MsgList = MsgList;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  // showFiller = false;

  constructor(private router: Router, private sharedService: SharedService) { }
  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }

  ngOnInit(): void {

    //!!!!! no need clear this.sharedService.pagesAccessLevel.value
    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));

    this.router.navigate(['/public/IFrame/iframeView/giftCard'])
  }

}
