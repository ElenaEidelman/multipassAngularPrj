import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { Router } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.css']
})
export class NewCustomerComponent implements OnInit {

  constructor(
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private router: Router,
    private sharedService: SharedService) { }

  @ViewChild(MatAccordion) accordion: MatAccordion;

  userToken: string;
  errorActionButtons: string = '';
  msgActionButtons: string = '';

  newCustomerForm = this.fb.group({
    OrganizationName: ['', Validators.required], //Validators.required
    FName: (''),
    LName: (''),
    Email: ['', [Validators.email, Validators.required]], //Validators.required,
    Phone: (''),
    Permission: ['', Validators.required], // Validators.required
    Phone1: (''),
    userNumber: [{ value: '', disabled: true }], //?
    CityName: (''),//v
    Streetno: (''),//v
    HouseNumber: (''), //-------------------------
    Entrance: (''),//v
    floor: (''), // -------------------------
    ApartmentNo: (''),//v
    ZIP: (''), // -----------------------
    StatusId: [{ value: '1', disabled: true }],
    MultipassIclientID: (''),
    Tz: ['', Validators.required], //, Validators.required
    DealerDiscountPercent: (''),
    ValidateDate: (''), // --------------------
    BusinessFile: ('/test.txt') //must to be required Validators.required
  });


  ngOnInit(): void {
    window.scroll(0, 0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
  }


  saveForm() {
    if (true) {//this.newCustomerForm.valid
      let data = this.newCustomerForm.value;

      let objToApi = {
        Token: this.userToken, //req
      }

      Object.keys(data).forEach(key => {
        if (data[key] != '') {
          objToApi[key] = data[key]
        }
      })

      this.dataService.InsertUpdateUser(objToApi).subscribe(result => {
        debugger
        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (typeof result == 'string') {
            this.errorActionButtons = result;

            setTimeout(() => {
              this.errorActionButtons = '';
            }, 3000);
          }
          if (typeof result == 'object' && result.obj != null) {
            this.msgActionButtons = 'לקוח חדש נשמר בהצלחה';

            setTimeout(() => {
              this.msgActionButtons = '';
            }, 2000);
            this.router.navigate(['/public/customer/', result.obj[0].id]);
          }
        }
        else {
          alert(result.errdesc);
          this.sharedService.exitSystemEvent();
        }
      });
    }
    else {
      this.errorActionButtons = 'אנא מלא שדות חובה';

      setTimeout(() => {
        this.errorActionButtons = '';
      }, 3000);
    }
  }
}
