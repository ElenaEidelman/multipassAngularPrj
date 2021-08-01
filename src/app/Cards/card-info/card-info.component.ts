import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterLinkActive } from '@angular/router';
import { CustomerData } from 'src/app/Classes/customerData';
import { DataServiceService } from 'src/app/data-service.service';
import { DatePickerDialog } from 'src/app/Orders/exec-order/exec-order.component';
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

  spinnerActiveVoidCard: boolean = false;

  saveUserDataSpinner: boolean = false;

  saveUserDetailsMSG: string = '';
  saveUserDetailsError: string = '';

  userDetailsForm = this.fb.group({
    FullName: ['', Validators.required],
    PhoneNumber: ['', Validators.required],
  });

  Note = this.fb.control({ value: '', disabled: true });


  unsubscribeId;
  ngOnInit(): void {
    window.scroll(0, 0);
    this.unsubscribeId = this.activateRoute.params.subscribe(param => {
      this.cardId = param['id'];
      this.userId = param['userId'];
      this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
      this.getTablesData();
    });
  }

  getTablesData() {
    this.newOrderLabelForTable = [
      { value: 'cNumber', viewValue: "מס''ד" },
      { value: 'digitalCode', viewValue: 'קוד דיגיטלי' },
      { value: 'recipName', viewValue: 'שם נמען' },
      { value: 'recipPhomeNumber', viewValue: 'מספר נייד נמען' },
      { value: 'firstChargeAmount', viewValue: '	סכום טעינה ראשוני' },
      { value: 'validity', viewValue: '	תוקף' },
      { value: 'chargVaucherType', viewValue: '	סוג שובר טעינה' },
      { value: 'sendRecently', viewValue: '	נשלח לאחרונה' }
    ];

    this.newOrderDataSource = new MatTableDataSource([]);

    let objToApi = {
      Token: this.userToken,
      CardId: this.cardId,
      UserId: this.userId
    }

    this.dataService.GetCardInfoById(objToApi).subscribe(result => {
      if (result['Token'] != undefined || result['Token'] != null) {
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if (typeof result == 'object' && result.obj != null) {
          this.CardInfo = result.obj[1][0];
          this.OrderDetails = result.obj[3];
          this.userDetailsForm.get('FullName').setValue(this.CardInfo.FullName);
          this.userDetailsForm.get('PhoneNumber').setValue(this.CardInfo.PhoneNumber);
          this.Note.setValue(result.obj[1][0]['RemarkNotes']);

          this.History = result.obj[7][0];
          //implement data
        }
      }
      else if(typeof result == 'string'){
        this.dialog.open(DialogComponent, {
          data: { message: result }
        });
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        });
        // this.sharedService.exitSystemEvent();
      }
    });
  }

  saveUserDetails() {

    this.saveUserDataSpinner = true;

    if(this.userDetailsForm.valid){
      
    let objToApi = {
      Token: this.userToken,
      CardId: this.cardId,
      FullName: this.userDetailsForm.get('FullName').value,
      Phoneno: this.userDetailsForm.get('PhoneNumber').value,
      UserID: this.userId,
      OrderId: this.OrderDetails.IdForDisplay
    }

    this.dataService.UpdateCards(objToApi).subscribe(result => {
      this.saveUserDataSpinner = false;
      if (result['Token'] != undefined || result['Token'] != null) {
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if(result.obj != undefined && result.obj != null && Object.keys(result.obj).length > 0){
          this.userDetailsForm.get('FullName').setValue(result.obj.DSendName);
          this.userDetailsForm.get('PhoneNumber').setValue(result.obj.DSendPhone);

          this.saveUserDetailsMSG = 'נשמר בהצלחה';
          setTimeout(()=>{
            this.saveUserDetailsMSG = '';
          }, 2000);

          //saveUserDetailsError
        }

      }
      else{
        this.dialog.open(DialogComponent, {
          data: {message: result.errdesc}
        })
      }
      
    });
    }
    else{
      alert('form not valid');
    }

    setTimeout(() => {
      this.saveUserDataSpinner = false;
    }, 2000);
  }
  activeVoidCard(cardStatus) {

    this.spinnerActiveVoidCard = true;
    //card is active
    if (cardStatus) {

      let objToApi = {
        Token: this.userToken,
        OrderId: this.OrderDetails.IdForDisplay,
        UserId: this.userId,
        CardLst: [this.CardInfo.CardId]
      }

      this.dataService.VoidCards(objToApi).subscribe(result => {
        this.spinnerActiveVoidCard = false;
        if (result['Token'] != undefined || result['Token'] != null) {
          
          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (result.errdesc == 'OK') {
            this.CardInfo.IsActive = !this.CardInfo.IsActive;
          }
          else {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            });
          }
        }
        else {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          });
          // this.sharedService.exitSystemEvent();
        }
      })
    }

    //card is void
    else {
      let objToApi = {
        Token: this.userToken,
        OrderId: this.OrderDetails.IdForDisplay,
        UserId: this.userId,
        CardId: this.CardInfo.CardId
      }

      this.dataService.ActivateCards(objToApi).subscribe(result => {
        this.spinnerActiveVoidCard = false;
        if (result['Token'] != undefined || result['Token'] != null) {
          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (result.errdesc == 'OK') {
            this.CardInfo.IsActive = !this.CardInfo.IsActive;
          }
          else{
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            })
          }
        }

        else {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          });
          // this.sharedService.exitSystemEvent();
        }
      })
    }

  }

  changeDate(dateForChange){
      // debugger
      let date = new Date(dateForChange);
      let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
      let year = date.getFullYear();
      this.dialog.open(DatePickerDialog, {
        data: {
          date: day +'/' + month + '/' + year
        }
      }).afterClosed().subscribe(dialogResult => {
 
        debugger
        let validityDate = new Date(dialogResult.result.date);
        validityDate.setHours(23, 59, 59);

        let dateForApi = new Date(validityDate);
        let day = dateForApi.getDate() < 10 ? '0' + dateForApi.getDate() : dateForApi.getDate();
        let month = (dateForApi.getMonth() + 1) < 10 ? '0' + (dateForApi.getMonth() + 1) : (dateForApi.getMonth() + 1);
        let year = dateForApi.getFullYear();

        let objToApi = {
          Token: this.userToken,
          CardLst:[this.CardInfo.CardId + ''],
          OrderId:this.OrderDetails.Id,
          UserId: +this.userId,
          ValidationDate: day + '/' + month + '/' + year
        }

        debugger
        this.dataService.UpdateExpirationDateOfCards(objToApi).subscribe(result => {
          debugger
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];
    
            if (typeof result == 'object' && result.obj != null) {
              debugger
              let respDate = new Date(result.obj.ValidationDate);

              this.CardInfo.ExpirationDate = new Date(respDate.getFullYear(), respDate.getMonth(), respDate.getDate());
            }
            else if(result.obj == null){
              this.dialog.open(DialogComponent, {
                data: {message: result.errdesc}
              });
            }
          }

          else if(typeof result == 'string'){
            this.dialog.open(DialogComponent, {
              data: {message: result}
            })
          }
          else {
            this.dialog.open(DialogComponent, {
              data: {message: result.errdesc}
            })
            // this.sharedService.exitSystemEvent();
          }
        });


      });

  }
}
