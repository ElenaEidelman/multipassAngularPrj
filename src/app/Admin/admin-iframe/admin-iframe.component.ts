import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-iframe',
  templateUrl: './admin-iframe.component.html',
  styleUrls: ['./admin-iframe.component.css']
})
export class AdminIframeComponent implements OnInit {

  companyId;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  // showFiller = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // this.companyId = localStorage.getItem('companyId');
    this.router.navigate(['/public/IFrame/iframeView/giftCard'])
  }

}
