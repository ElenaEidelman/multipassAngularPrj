import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {MatAccordion} from '@angular/material/expansion';

@Component({
  selector: 'app-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.css']
})
export class NewCustomerComponent implements OnInit {

  constructor( private fb: FormBuilder) { }

  @ViewChild(MatAccordion) accordion: MatAccordion;

  newCustomerForm = this.fb.group({
    customerData: this.fb.group({
      companyName: (''),
      email: (''),
      phoneNumber: (''),
      role: (''),
      addPhoneNumber: (''),
      userNumber: [{value: '', disabled: true}],
    }),
    address: this.fb.group({
      street: (''),
      city: (''),
      houseNumber: (''),
      appNumber: (''),

    }),
    comerData: this.fb.group({
      status: (''),
      customer: (''),
      customerId: (''),
      fixedDiscountPerc: (''),
      uploadDocument: ('')
    })


  });
  ngOnInit(): void {
    window.scroll(0,0);
  }


  saveForm(){
    let data = this.newCustomerForm.value;
    debugger
    console.log(data);
  }
}
