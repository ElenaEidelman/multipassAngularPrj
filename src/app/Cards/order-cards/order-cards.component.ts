import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { debounceTime } from 'rxjs/operators';
import { CustomerData } from 'src/app/Classes/customerData';
import { DataServiceService } from 'src/app/data-service.service';

@Component({
  selector: 'app-order-cards',
  templateUrl: './order-cards.component.html',
  styleUrls: ['./order-cards.component.css']
})
export class OrderCardsComponent implements OnInit, OnDestroy {

  // @Input() selectedOrder;
  // @Input() customerId;

  userDataUnsubscribe;
  customerIDSelected;

  userId;
  indexId;

  selectedCustomer;
  faFileExcel = faFileExcel;
  customers;

  cardsData = [];

  fromCardCheckedOrderNumber: any;
  toCardCheckedOrderNumber: any;

  toCardError: string;
  fromCardError: string = '';

  showHiddenLoadingCardContent: boolean = false;
  loadingCardUserExist: boolean = false;
  filename;
 
  excelfileName;
  excelCustomerId;
  // selectedCustomerControl = new FormControl('');


  excelCardCreatingForm = this.fb.group({
    customer: (''),
    fileDesc: (''),
    file: ('')
  });

  manualCardgroup = this.fb.group({
    selectedCustomerControl: ('')
  });

  loadingCardGroup = this.fb.group({
    selectedCustomerControl: ['',Validators.required],
    userId: [{value: '', disabled: true}, Validators.required],
    fromCardNumber: ['',{value: ''},Validators.required],
    toCardNumber: ['',{value: ''},Validators.required],
    sum: ['',{value: ''},Validators.required]
  });

  excelCardGroup = this.fb.group({
    customer: ['',Validators.required],
    fileDesc: ['',Validators.required],
    file: ['',Validators.required],

    userId: [{value: '', disabled: true}, Validators.required],
    fromCardNumber: ['',{value: ''},Validators.required],
    toCardNumber: ['',{value: ''},Validators.required],
    sum: ['',{value: ''},Validators.required]
  });


  constructor(private fb: FormBuilder, private activeRoute: ActivatedRoute, private dataService: DataServiceService) { }


  ngOnInit(): void {
    //debugger
    window.scroll(0,0);
    //this.getCustomersData();
    this.getAllCustomers();
    this.userDataUnsubscribe = this.activeRoute.params.subscribe(param => {
      this.userId = param['userId'];
      this.indexId = param['indexId'];
      
    });

    this.loadingCardGroupChange();
  }

  getAllCustomers(){
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let objToApi = {
      Token: token
    }
    this.dataService.GetAllCustomers(objToApi).subscribe(result => {

      if(typeof result == 'string'){
        // this.errorMsg = result;
        setTimeout(()=>{
          // this.errorMsg = '';
        },5000)
      }
      else{
        if(typeof result == 'object' &&  result['obj'] != null && result['obj'].length > 0){
          debugger
          this.customers = result['obj'];
            if(this.userId != undefined && this.indexId != undefined){
              debugger
              this.excelCardCreatingForm.controls['customer'].setValue(this.fillteringUserData(this.userId));
              this.manualCardgroup.controls['selectedCustomerControl'].setValue(this.fillteringUserData(this.userId));
              this.loadingCardGroup.controls['selectedCustomerControl'].setValue(this.fillteringUserData(this.userId));
            }
            else{
              this.indexId = 0;
            }
        }
        if(typeof result == 'object' &&  result['obj'] == null){
          // this.errorMsg = 'No Data Found';
          setTimeout(()=>{
            // this.errorMsg = '';
          },3000);
        }
      }
    });
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
    debugger
    return this.customers.filter(customer => customer.id == userId)[0];
  }

  test(){
    this.manualCardgroup.get('selectedCustomerControl').value;
    debugger
  }
 
  optionChange(){
      if(this.loadingCardGroup.get('selectedCustomerControl').value){
        this.showHiddenLoadingCardContent = true;
        this.getCardsData();
        // this.loadingCardGroup.get('userId').enable();
      }
  }

  excelOptionChange(){
  
    if(this.excelCardCreatingForm.get('customer').value){
      this.excelCustomerId = this.excelCardCreatingForm.get('customer').value.id;
      this.showHiddenLoadingCardContent = true;
    }
}

fileOptionChange(event){
  if(event.target.files.length > 0) 
  {
    this.filename = event.target.files[0].name;
    localStorage.setItem('excelFilename', this.filename);
  }
}

  loadingCardGroupChange(){
    this.loadingCardGroup.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(val => {
      //check from card number
      if(val['fromCardNumber'] != ''){
        let card = this.cardsData.filter(el => el['cardId'] == val['fromCardNumber']);
        //this.fromCardCheckedOrderNumber = card.length > 0 ? +card[0]['orderId'] : 'מספר שובר לא תקין';

        if(card.length > 0){
          this.fromCardCheckedOrderNumber = +card[0]['orderId'];
          this.fromCardError = '';
        }
        else{
          this.fromCardCheckedOrderNumber = '';
          this.fromCardError = 'מספר שובר לא תקין*';
        }
        
      }
      if(val['fromCardNumber'] == ''){
        this.fromCardCheckedOrderNumber = '';
        this.fromCardError = '';
      }

      //check to card number
      if(val['toCardNumber'] != ''){
        let card = this.cardsData.filter(el => el['cardId'] == val['toCardNumber']);
        //this.toCardCheckedOrderNumber = card.length > 0 ? +card[0]['orderId'] : 'מספר שובר לא תקין';

        if(card.length > 0){
          debugger
          this.toCardCheckedOrderNumber = +card[0]['orderId'];
          if(this.fromCardCheckedOrderNumber == ''){
            this.toCardError = '';
          }
          else{
            if(this.toCardCheckedOrderNumber == this.fromCardCheckedOrderNumber){
              this.toCardError = '';
            }
  
            else{
              this.toCardError = 'הזמנות אינו זהות*';
  
            }
          }

        }
        else{
          this.toCardCheckedOrderNumber = '';
          this.toCardError = 'מספר שובר לא תקין*';
        }
        
      }
      if(val['toCardNumber'] == ''){
        this.toCardCheckedOrderNumber = '';
        this.toCardError = '';
      }
    });
  }

  getCardsData(){
    this.cardsData = [
      {customerName:'multipass1', customerId: '11111', cardId: '15245814', dataIssues: '03/01/2021', orderId: '900000025', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass2', customerId: '22222', cardId: '15245815', dataIssues: '03/02/2021', orderId: '900000025', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass3', customerId: '33333', cardId: '15245816', dataIssues: '03/03/2021', orderId: '900000025', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass4', customerId: '44444', cardId: '15245817', dataIssues: '03/04/2021', orderId: '900000028', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass5', customerId: '55555', cardId: '15245818', dataIssues: '03/05/2021', orderId: '900000029', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass6', customerId: '66666', cardId: '15245819', dataIssues: '03/06/2021', orderId: '900000030', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass7', customerId: '77777', cardId: '152458110', dataIssues: '03/07/2021', orderId: '900000031', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass8', customerId: '88888', cardId: '152458111', dataIssues: '03/08/2021', orderId: '900000032', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass9', customerId: '99999', cardId: '152458112', dataIssues: '03/09/2021', orderId: '900000033', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass12', customerId: '12121', cardId: '152458113', dataIssues: '04/01/2021', orderId: '900000034', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass13', customerId: '13131', cardId: '152458114', dataIssues: '05/01/2021', orderId: '900000035', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass14', customerId: '14141', cardId: '15245815', dataIssues: '06/01/2021', orderId: '900000036', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
      {customerName:'multipass15', customerId: '15151', cardId: '152458116', dataIssues: '07/01/2021', orderId: '900000037', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום'},
    ];
  }
  loadCard(){
    this.showHiddenLoadingCardContent = false;
  }
  cancelLoadCard(){
    this.showHiddenLoadingCardContent = false;
    this.loadingCardGroup.get('userId').enable();
    this.loadingCardGroup.get('selectedCustomerControl').enable();
  }

  isNumber(val): boolean { 
    debugger
    return typeof val === 'number'; 
  }
  
  ngOnDestroy(){
    this.userDataUnsubscribe.unsubscribe();
  }
}
