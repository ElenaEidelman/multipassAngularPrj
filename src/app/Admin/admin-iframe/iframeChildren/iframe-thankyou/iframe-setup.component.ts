import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PreviewIMGComponent } from 'src/app/Admin/popup/preview-img/preview-img.component';
import { DataServiceService } from 'src/app/data-service.service';
import { IframeSharingServiceService } from 'src/app/Services/IframeService/iframe-sharing-service.service';
import { MsgList } from '../../../../Classes/msgsList';

@Component({
  selector: 'app-iframe-setup',
  templateUrl: './iframe-setup.component.html',
  styleUrls: ['./iframe-setup.component.css'],
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
export class IframeSetupComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dataService: DataServiceService,
    private sharingIframeService: IframeSharingServiceService) { }

  MsgList = MsgList;



  ngOnInit(): void {

  }

}
