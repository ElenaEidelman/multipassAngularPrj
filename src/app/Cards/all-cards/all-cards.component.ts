import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-all-cards',
  templateUrl: './all-cards.component.html',
  styleUrls: ['./all-cards.component.css']
})
export class AllCardsComponent implements OnInit {
    //filter table by card status
    statusList = [
      {value: 'all', viewValue: 'הכל'},
      {value: 'active', viewValue: 'פעיל'},
      {value: 'block', viewValue: 'חסום'}
    ];

    viewTable: boolean = false;
  constructor(private fb: FormBuilder) { }

  cardsForm = this.fb.group({
    cardNumber: (''),
    fName: (''),
    lName: (''),
    phoneNumber: (''),
    status: (''),
    orderId: (''),
    fromDate: (new Date()),
    untilDate: (new Date()),
    companyName: (''),
    customerId: (''),
    documentId: (''),
    byDate: ('dateIssue')
  });

  public cardsLabelForTable;
  public cardsDataSource: MatTableDataSource<any>;

  ngOnInit(): void {
    this.getCardsFilteredData();
  }

  getCardsFilteredData(){
    this.cardsLabelForTable = [
      {value: 'customerName', viewValue: 'שם לקוח'},
      {value: 'cardId', viewValue: 'מספר שובר'},
      {value: 'dataIssues', viewValue: 'תאריך הנפקה'},
      {value: 'orderId', viewValue: 'מספר הזמנה'},
      {value: 'phoneNumber', viewValue: 'מספר טלפון'},
      {value: 'initialChargeAmount', viewValue: 'סכום טעינה ראשוני'},
      {value: 'balance', viewValue: 'יתרה'},
      {value: 'cardStatus', viewValue: 'סטטוס שובר'}
    ];
  
    this.cardsDataSource = new MatTableDataSource([
      {customerName:'customerName1', cardId: 'card id 1', dataIssues: '03/01/2021', orderId: '900000025', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName2', cardId: 'card id 2', dataIssues: '03/02/2021', orderId: '900000026', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName3', cardId: 'card id 3', dataIssues: '03/03/2021', orderId: '900000027', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName4', cardId: 'card id 4', dataIssues: '03/04/2021', orderId: '900000028', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName5', cardId: 'card id 5', dataIssues: '03/05/2021', orderId: '900000029', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName6', cardId: 'card id 6', dataIssues: '03/06/2021', orderId: '900000030', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName7', cardId: 'card id 7', dataIssues: '03/07/2021', orderId: '900000031', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName8', cardId: 'card id 8', dataIssues: '03/08/2021', orderId: '900000032', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName9', cardId: 'card id 9', dataIssues: '03/09/2021', orderId: '900000033', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName10', cardId: 'card id 10', dataIssues: '04/01/2021', orderId: '900000034', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName11', cardId: 'card id 11', dataIssues: '05/01/2021', orderId: '900000035', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName12', cardId: 'card id 12', dataIssues: '06/01/2021', orderId: '900000036', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'customerName13', cardId: 'card id 13', dataIssues: '07/01/2021', orderId: '900000037', phoneNumber: '0523335611', initialChargeAmount: '150.00', balance: '150.00', cardStatus: 'חסום'},
    ]);

  }
  resetForm(){
    this.viewTable = false;
  }
  filterTable(){
    this.viewTable = true;
  }

}
