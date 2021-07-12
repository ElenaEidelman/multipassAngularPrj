import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterLinkActive } from '@angular/router';
import { CustomerData } from 'src/app/Classes/customerData';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-card-info',
  templateUrl: './card-info.component.html',
  styleUrls: ['./card-info.component.css']
})
export class CardInfoComponent implements OnInit {

  constructor(
              private activateRoute: ActivatedRoute,
              private dataService: DataServiceService,
              private dialog: MatDialog,
              private sharedService: SharedService,
              private fb: FormBuilder) { }

    // data table
    public newOrderLabelForTable;
    public newOrderDataSource: MatTableDataSource<any>;  

    userId;
    userToken;
    cardId;

    CardInfo;
    OrderDetails;
    History;

    saveUserDataSpinner: boolean = false;

    userDetailsForm = this.fb.group({
      FullName: (''),
      PhoneNumber: ('')
    });

    Note = this.fb.control({value: '', disabled: true});


  unsubscribeId;
  ngOnInit(): void {
    window.scroll(0,0);
    this.unsubscribeId = this.activateRoute.params.subscribe(param => {
      this.cardId = param['id'];
      this.userId = param['userId'];
      this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
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


    /**
     * /api/AllCards/GetCardInfoById


    {
    "Token":"dqzbWm7xipd8zBjLOMMTlRx_QKR9ZQWGYnxKpuXtKuw1",
    "CardId":15377519,
    "UserId":2700
 
}
     */

   let objToApi = {
     Token: this.userToken,
     CardId: this.cardId,
     UserId: this.userId
   }

   debugger
   this.dataService.GetCardInfoById(objToApi).subscribe(result => {
     if (result['Token'] != undefined || result['Token'] != null) {
debugger
          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

      if (typeof result == 'object' && result.obj != null) {
        this.CardInfo = result.obj[1][0];
        this.OrderDetails = result.obj[3];
 
        this.userDetailsForm.get('FullName').setValue(result.obj[5].Fname + ' ' + result.obj[5].Lname);
        this.userDetailsForm.get('PhoneNumber').setValue(result.obj[5].Phone);
        this.Note.setValue(result.obj[1][0]['RemarkNotes']);

        this.History = result.obj[7][0];
        //implement data
      }
    }
    else {
      this.dialog.open(DialogComponent, {
        data: {message: result.errdesc}
      });
      this.sharedService.exitSystemEvent();
    }
   });
  }

  saveUserDetails(){
    this.saveUserDataSpinner = true;

    setTimeout(()=>{
      this.saveUserDataSpinner = false;
    }, 2000);
  }
  activeDisActiveCard(cardStatus){
    this.CardInfo.IsActive = !this.CardInfo.IsActive;
  }

}
