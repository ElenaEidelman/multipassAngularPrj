import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { CustomerData } from 'src/app/Classes/customerData';

@Component({
  selector: 'app-order-cards',
  templateUrl: './order-cards.component.html',
  styleUrls: ['./order-cards.component.css']
})
export class OrderCardsComponent implements OnInit, OnDestroy {

  // @Input() selectedOrder;
  // @Input() customerId;

  userDataUnsubscribe;

  userId;
  indexId;

  selectedCustomer;
  faFileExcel = faFileExcel;
  customers;
  excelCardCreatingForm = this.fb.group({
    customer: (''),
    fileDesc: (''),
    file: ('')
  });



  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute) { }


  ngOnInit(): void {
    //debugger
    this.getCustomersData();
    this.userDataUnsubscribe = this.activeRoute.params.subscribe(param => {
      //debugger
      this.userId = param['userId'];
      this.indexId = param['indexId'];
      if(this.userId != undefined && this.indexId != undefined){
          

          this.excelCardCreatingForm.controls['customer'].setValue(this.fillteringUserData(this.userId));
          ///this.selectedCustomer = this.userId;
          //this.excelCardCreatingForm.get('customer').patchValue('multipass');
      }
      else{
        this.indexId = 0;
      }
    })

  }

  getCustomersData(){
    //debugger
    this.customers = [
      new CustomerData('multipass1','11111','26','פעיל'),
      new CustomerData('multipass2','22222','2','ליד'),
      new CustomerData('multipass3','33333','3','ממתין לאישור'),
      new CustomerData('multipass4','44444','4','מסורב'),
      new CustomerData('multipass5','55555','5','מושהה'),
      new CustomerData('multipass6','66666','6','מושהה'),
      new CustomerData('multipass7','77777','26','פעיל'),
      new CustomerData('multipass8','88888','2','ליד'),
      new CustomerData('multipass9','99999','3','ממתין לאישור'),
      new CustomerData('multipass12','12121','4','מסורב'),
      new CustomerData('multipass13','13131','4','מושהה'),
      new CustomerData('multipass14','14141','6','מושהה'),
      
    ]
  }

  fillteringUserData(userId){
    return this.customers.filter(customer => customer.customerId == userId)[0];
  }

  ngOnDestroy(){
    this.userDataUnsubscribe.unsubscribe();
  }

}
