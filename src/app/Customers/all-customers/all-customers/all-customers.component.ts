import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-all-customers',
  templateUrl: './all-customers.component.html',
  styleUrls: ['./all-customers.component.css']
})
export class AllCustomersComponent implements OnInit {

  constructor(private fb: FormBuilder) { }

  filterCustomerForm = this.fb.group({
    customerId: (''),
    customerEmail: ['', Validators.email],
    orderStatus: ('')
  });

  statusList = [
    {value: 'nextTo', viewValue: 'ליד'},
    {value: 'pending', viewValue: 'ממתין לאישור'},
    {value: 'active', viewValue: 'פעיל'},
    {value: 'delayed', viewValue: 'מושהה'},
    {value: 'refused', viewValue: 'מסורב'}
  ];
  ngOnInit(): void {
  }

}
