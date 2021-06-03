import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterLinkActive } from '@angular/router';
import { CustomerData } from 'src/app/Classes/customerData';

@Component({
  selector: 'app-card-info',
  templateUrl: './card-info.component.html',
  styleUrls: ['./card-info.component.css']
})
export class CardInfoComponent implements OnInit {

  constructor(private activateRoute: ActivatedRoute) { }

    // data table
    public newOrderLabelForTable;
    public newOrderDataSource: MatTableDataSource<any>;  

    cardStatus: boolean = false;

  unsubscribeId;
  ngOnInit(): void {
    window.scroll(0,0);
    this.unsubscribeId = this.activateRoute.params.subscribe(el => {
      this.getTablesData();
    });
  }

  getTablesData(){
    this.newOrderLabelForTable = [
      {value: 'cNumber', viewValue: "מס''ד"},
      {value: 'digitalCode', viewValue: 'קוד דיגיטלי'},
      {value: 'recipName', viewValue: 'שם נמען'},
      {value: 'recipPhomeNumber', viewValue: 'מספר נייד נמען'},
      {value: 'firstChargeAmount', viewValue: '	סכום טעינה ראשוני'},
      {value: 'validity', viewValue: '	תוקף'},
      {value: 'chargVaucherType', viewValue: '	סוג שובר טעינה'},
      {value: 'sendRecently', viewValue: '	נשלח לאחרונה'}
    ];
  
    this.newOrderDataSource = new MatTableDataSource([
      {cNumber: '1', digitalCode: '15280433', recipName: '', recipPhomeNumber: '', firstChargeAmount: '100.00', validity: '31/03/2026',  chargVaucherType: 'דיגיטלים', sendRecently: ''}, 
      {cNumber: '2', digitalCode: '15280433', recipName: '', recipPhomeNumber: '', firstChargeAmount: '100.00', validity: '31/03/2026',  chargVaucherType: 'דיגיטלים', sendRecently: ''}, 
      {cNumber: '3', digitalCode: '15280433', recipName: '', recipPhomeNumber: '', firstChargeAmount: '100.00', validity: '31/03/2026',  chargVaucherType: 'דיגיטלים', sendRecently: ''}, 
      {cNumber: '4', digitalCode: '15280433', recipName: '', recipPhomeNumber: '', firstChargeAmount: '100.00', validity: '31/03/2026',  chargVaucherType: 'דיגיטלים', sendRecently: ''}, 
      {cNumber: '5', digitalCode: '15280433', recipName: '', recipPhomeNumber: '', firstChargeAmount: '100.00', validity: '31/03/2026',  chargVaucherType: 'דיגיטלים', sendRecently: ''}, 
      {cNumber: '6', digitalCode: '15280433', recipName: '', recipPhomeNumber: '', firstChargeAmount: '100.00', validity: '31/03/2026',  chargVaucherType: 'דיגיטלים', sendRecently: ''}, 
      {cNumber: '7', digitalCode: '15280433', recipName: '', recipPhomeNumber: '', firstChargeAmount: '100.00', validity: '31/03/2026',  chargVaucherType: 'דיגיטלים', sendRecently: ''}, 
      {cNumber: '8', digitalCode: '15280433', recipName: '', recipPhomeNumber: '', firstChargeAmount: '100.00', validity: '31/03/2026',  chargVaucherType: 'דיגיטלים', sendRecently: ''}
    ]);

  }

}
