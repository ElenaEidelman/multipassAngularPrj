import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, AfterViewInit {

  elementTitle: string = 'דוחות';

  Report1Form = this.fb.group({
      canceledCheckB: ('true'),
      sendImmedCheckB: ('')
  });

  constructor(private fb: FormBuilder) { }

  changeElementTitle(obj){

    // this.elementTitle = obj.path[0].innerHTML;
    // obj.path.find(el => {
    
    // })
    //debugger
  }
  ngOnInit(): void {
    window.scroll(0,0);
  }

  ngAfterViewInit(){
    document.querySelectorAll('.mat-tab-label').forEach(el => {
      el.addEventListener('click', this.changeElementTitle);
    });
  }
}
