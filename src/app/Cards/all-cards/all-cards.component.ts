import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { catchError } from 'rxjs/operators';
import { DataServiceService } from 'src/app/data-service.service';


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
  spinner: boolean = false;
  constructor(private fb: FormBuilder, private dataService: DataServiceService) { }

  cardsForm = this.fb.group({
    CardId: (''),
    PhoneNo: (''),
    // Name: (''),
    // CompanyName: (''),
    // Status: (''),
    // OrderId: (''),
    // FromDate: (''),
    // ToDate: (''),
    // userid: (''),
    // tenantid: (''),

    FName: (''),
    LName: (''),
    // // status: (''),
    OrderId: (''),
    FromDate: (''),
    ToDate: (''),
    // CompanyName: (''),
    CustomerId: (''),
    // documentId: (''),
    // byDate: ('dateIssue')
  });

  public cardsLabelForTable;
  public cardsDataSource: MatTableDataSource<any>;
  public linksListById;

  formErrorMsg: string = '';
  ngOnInit(): void {
    window.scroll(0,0);
    // this.getCardsFilteredData();
    // this.getFilteredCards();
  }

  getFilteredCards(){
  
    this.cardsDataSource = new MatTableDataSource([]);
    this.cardsDataSource.data = [];
    this.viewTable = false;

    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let formSearchFiled = false;
    let objToApi = {
      Token: token
    }
    
    Object.keys(this.cardsForm.value).forEach(val => {
      if(this.cardsForm.get(val).value != '' ){
        formSearchFiled = true;
        objToApi[val] = this.cardsForm.get(val).value;
      }
    })

    if(formSearchFiled){
      this.spinner = true;
    
      this.dataService.GetAllCards(objToApi).subscribe(result => {
        this.spinner = false;
        if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
          this.createTableData(result['obj']);
        }
        if(typeof result == 'string'){
          this.formErrorMsg = result;
          setTimeout(()=>{
            this.formErrorMsg = '';
          },10000);
        }
        if(typeof result == 'object' &&  result['obj'] == null){
          this.formErrorMsg = 'No Data Found';
          setTimeout(()=>{
            this.formErrorMsg = '';
          },3000);
        }
      })
    }

    
    else{
      this.formErrorMsg = 'נא למלא לפחות אחד מהשדות';
      setTimeout(()=>{
        this.formErrorMsg = '';
      },3000);
    }
  }


  createTableData(obj){

    //if table have links, need to fill this parameter
    this.linksListById = [
      {linkName: 'CardId', linkSrc: '/cardInfo',linkIdName:'CardId'},
      {linkName: 'CompanyName', linkSrc: '/customer', linkIdName:'CustomerId'},
      {linkName: 'OrderId', linkSrc: '/order', linkIdName:'OrderId'}
    ];

    
    this.cardsLabelForTable = [
      {value: 'CardId', viewValue: 'מספר שובר'},
      {value: 'CompanyName', viewValue: 'שם לקוח'},
      {value: 'PhoneNo', viewValue: 'מספר טלפון'},
      {value: 'balance', viewValue: 'יתרה'},// no data !!!!
      {value: 'OrderId', viewValue: 'מספר הזמנה'},
      {value: 'CreationDate', viewValue: 'תאריך הנפקה'},
      // {value: 'dataSend', viewValue: 'תאריך שליחה'},
      {value: 'Status', viewValue: 'סטטוס שובר'}
    ];

    this.cardsDataSource = new MatTableDataSource(obj);
    this.viewTable = true;
  }



  // getCardsFilteredData(){
  //   this.linksListById = [
  //     {linkName: 'cardId', linkSrc: '/cardInfo',linkIdName:'cardId'},
  //     {linkName: 'CompanyName', linkSrc: '/customer', linkIdName:'customerId'},
  //     {linkName: 'OrderId', linkSrc: '/order', linkIdName:'OrderId'}
  //   ];
  //   this.cardsLabelForTable = [
  //     {value: 'CardId', viewValue: 'מספר שובר'},
  //     {value: 'CompanyName', viewValue: 'שם לקוח'},
  //     {value: 'PhoneNo', viewValue: 'מספר טלפון'},
  //     {value: 'balance', viewValue: 'יתרה'},// no data !!!!
  //     {value: 'OrderId', viewValue: 'מספר הזמנה'},
  //     {value: 'CreationDate', viewValue: 'תאריך הנפקה'},
  //     // {value: 'dataSend', viewValue: 'תאריך שליחה'},
  //     {value: 'Status', viewValue: 'סטטוס שובר'}
  //   ];
  
  //   this.cardsDataSource = new MatTableDataSource([
  //     {customerName:'multipass1', customerId: '11111', cardId: '15245814', dataIssues: '03/01/2021', OrderId: '900000025', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass2', customerId: '22222', cardId: '15245815', dataIssues: '03/02/2021', OrderId: '900000026', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass3', customerId: '33333', cardId: '15245816', dataIssues: '03/03/2021', OrderId: '900000027', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass4', customerId: '44444', cardId: '15245817', dataIssues: '03/04/2021', OrderId: '900000028', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass5', customerId: '55555', cardId: '15245818', dataIssues: '03/05/2021', OrderId: '900000029', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass6', customerId: '66666', cardId: '15245819', dataIssues: '03/06/2021', OrderId: '900000030', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass7', customerId: '77777', cardId: '152458110', dataIssues: '03/07/2021', OrderId: '900000031', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass8', customerId: '88888', cardId: '152458111', dataIssues: '03/08/2021', OrderId: '900000032', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass9', customerId: '99999', cardId: '152458112', dataIssues: '03/09/2021', OrderId: '900000033', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass12', customerId: '12121', cardId: '152458113', dataIssues: '04/01/2021', OrderId: '900000034', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass13', customerId: '13131', cardId: '152458114', dataIssues: '05/01/2021', OrderId: '900000035', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass14', customerId: '14141', cardId: '15245815', dataIssues: '06/01/2021', OrderId: '900000036', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //     {customerName:'multipass15', customerId: '15151', cardId: '152458116', dataIssues: '07/01/2021', OrderId: '900000037', PhoneNo: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
  //   ]);

  // }
  resetForm(){
    this.viewTable = false;
  }
  // filterTable(){
  //   this.viewTable = true;
  // }

}
