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
      OrganizationName: [''], //Validators.required
      Email: ['',  Validators.email], //Validators.required,
      Phone: (''),
      Permission: [''], // Validators.required
      Phone1: (''),
      userNumber: [{value: '', disabled: true}], //?
      Streetno: (''),
      CityName: (''),
      Entrance: (''),
      ApartmentNo: (''),
      StatusId: ('1'),
      MultipassIclientID: (''),
      Tz: [''], //, Validators.required
      DealerDiscountPercent: (''),
      BusinessFile: ('/test.txt') //must to be required Validators.required
  });

  
  ngOnInit(): void {
    window.scroll(0,0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
  }


  saveForm(){
    debugger
    if(this.newCustomerForm.valid){
      let data = this.newCustomerForm.value;
      debugger
  
      let objToApi = {
        Token: this.userToken, //req
      }
  
      Object.keys(data).forEach(key => {
        if(data[key] != ''){
          objToApi[key] = data[key]
        }
      })
  
      this.dataService.InsertUpdateUser(objToApi).subscribe(result => {
        if(typeof result == 'object' && result.obj != null){
          alert('done');
          this.router.navigate(['/public/customer/', result.obj[0].id]);
        }
        if(typeof result == 'string'){
          this.errorActionButtons = result;

          setTimeout(() => {
            this.errorActionButtons = '';
          }, 3000);
        }
        else{
          alert(result);
        }
      });
    }
    else{
      alert('form error');
    }
  }
}
