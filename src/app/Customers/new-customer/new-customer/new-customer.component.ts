import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {MatAccordion} from '@angular/material/expansion';
import { Router } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';

@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.css']
})
export class NewCustomerComponent implements OnInit {

  constructor( private fb: FormBuilder, private dataService: DataServiceService, private router: Router) { }

  @ViewChild(MatAccordion) accordion: MatAccordion;

  userToken: string;
  errorActionButtons: string = '';

  newCustomerForm = this.fb.group({
      OrganizationName: ['', Validators.required], //Validators.required
      FName: (''),
      LName: (''),
      Email: ['',  [Validators.email, Validators.required]], //Validators.required,
      Phone: (''),
      Permission: ['', Validators.required], // Validators.required
      Phone1: (''),
      userNumber: [{value: '', disabled: true}], //?
      CityName: (''),//v
      Streetno: (''),//v
      HouseNumber: (''), //-------------------------
      Entrance: (''),//v
      floor: (''), // -------------------------
      ApartmentNo: (''),//v
      ZIP: (''), // -----------------------
      StatusId: [{value: '1', disabled: true}],
      MultipassIclientID: (''),
      Tz: ['', Validators.required], //, Validators.required
      DealerDiscountPercent: (''),
      ValidateDate: (''), // --------------------
      BusinessFile: ('/test.txt') //must to be required Validators.required
  });

  
  ngOnInit(): void {
    window.scroll(0,0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
  }


  saveForm(){
    if(this.newCustomerForm.valid){
      let data = this.newCustomerForm.value;

  
      let objToApi = {
        Token: this.userToken, //req
      }
  
      Object.keys(data).forEach(key => {
        if(data[key] != ''){
          objToApi[key] = data[key]
        }
      })
  
      debugger
      this.dataService.InsertUpdateUser(objToApi).subscribe(result => {
        debugger
        if(typeof result == 'object' && result.obj != null){
          this.errorActionButtons = 'לקוח חדש נשמר בהצלחה';

          setTimeout(() => {
            this.errorActionButtons = '';
            this.router.navigate(['/public/customer/', result.obj[0].id]);
          }, 2000);
        }
        if(typeof result == 'string'){
          this.errorActionButtons = result;

          setTimeout(() => {
            this.errorActionButtons = '';
          }, 3000);
        }
        else{
          alert(JSON.stringify(result));
        }
      });
    }
    else{
      this.errorActionButtons = 'אנא מלא שדות חובה';

      setTimeout(() => {
        this.errorActionButtons = '';
      }, 3000);
    }
  }
}
