import { Route } from '@angular/compiler/src/core';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { tick } from '@angular/core/testing';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Data, RouterModule } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';
import { SharedService } from 'src/app/shared.service';
import { AlertMessage } from 'src/assets/alertMessage';
import { OrderData } from '../../Classes/OrderData';



@Component({
  selector: 'app-exec-order',
  templateUrl: './exec-order.component.html',
  styleUrls: ['./exec-order.component.css']
})


export class ExecOrderComponent implements OnInit, OnDestroy, OnChanges {
  

  

  // OrderData;

  constructor(private activeRoute: ActivatedRoute, private fb: FormBuilder, private dataService: DataServiceService, private sharedService: SharedService) { }
  
  //translate customer data value to hebrew
  CustomerLangObj = [
    {value: 'Fname', viewValue: 'שם'},
    {value: 'Lname', viewValue: 'שם משפחה'},
    {value: 'Id', viewValue: 'ח.פ'},
    {value: 'Email', viewValue: 'מייל'},
    {value: 'Phone', viewValue: 'טלפון'},
    {value: 'Phone1', viewValue: 'טלפון נוסף'}
  ];

  //order table 
  orderDetails = [
    {foundation:1, ticketCount: 2, chargeAmount: 500.00, validity: '31/01/2026', totalCharge : 1000.00},
    {foundation:2, ticketCount: 2, chargeAmount: 500.00, validity: '31/01/2026', totalCharge : 1000.00},
    {foundation:0, ticketCount: 0, chargeAmount: 0, validity: '', totalCharge : 0}
  ];
  displayedColumnsOrderDetails = ['foundation','ticketCount','chargeAmount','validity','totalCharge','additionalColumn'];
 
  //additional row on table for add order
  formTableForAddOrder = new MatTableDataSource([{foundation:0, ticketCount: 0, chargeAmount: 0, validity: '', totalCharge : 0}]);

  columnsHeb = {
    'foundation' : "מס''ד",
    'ticketCount' : 'כמות כרטיסים	',
    'chargeAmount' : 'סכום טעינה',
    'validity' : 'תוקף',
    'totalCharge' : "סה''כ סכום טעינה",
  }

  Orders: MatTableDataSource<any>;
  Customer;
  dataByPage;
  id;
  customerId;
  idUnsubscribe;

  alertMessage: string = '';
  orderTitle = '';

  sendSuccess: boolean = false; 
  viewAddToExecOrderForm: boolean = true;

  totalTicketCount: number = 0;
  totalOrderSum: number = 0;

  orderDetailsTable = new MatTableDataSource(this.orderDetails);

  //for additional empty row foraddToExecOrderForm

  addToExecOrderForm = this.fb.group({
    ticketCount: ['', [Validators.required, Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    chargeAmount: ['', [Validators.required, Validators.min(1), Validators.max(1000), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    validity: [new Date(new Date().setDate(new Date().getDate() + 1)), Validators.required],
    totalCharge: [{value: '', disabled: true}]
  });

  RefControl = new FormControl('');

  //disable all days before current data
  calendarFilter = (d: Date | null): boolean => {
    //  debugger
    const day = (d || new Date()).getDate() < 10 ? '0' + (d || new Date()).getDate() : (d || new Date()).getDate()  ;
    const month = ((d || new Date()).getMonth() + 1) < 10 ? '0' + ((d || new Date()).getMonth() + 1) : ((d || new Date()).getMonth() + 1);
    const year = (d || new Date()).getFullYear();


    return new Date() < new Date(month + '/' + day + '/' + year);
  }

  ngOnInit() {
    window.scroll(0,0);
    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
      //debugger
      this.id = param['id'];
      this.customerId = param['customerId'];
      let userToken = JSON.parse(localStorage.getItem('user')).Token;
      this.dataService.GetOrderDetails({Token: userToken, Id: this.id}).subscribe(result => {
        //debugger
        if(result['Token'] != undefined){

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user',JSON.stringify(tempObjUser));

          this.dataByPage = result['obj'];;
              
          //get customer data
          this.Customer = this.dataByPage['PrimaryUser'];

          this.Orders = new MatTableDataSource(result['obj']);
          this.fillDataSourceToTable();
        }
        else{
          this.sharedService.exitSystemEvent();
        }
      })
       
    })
    

    this.totalData();
  }

  // createDataSourceForTable(){
  //   // this.Orders = new MatTableDataSource([
  //   //   // new OrderData('900000025', 12345, 'multipass','11111',1122, 5, '24/01/2021', '24/01/2021', '400.00', 'הזמנה סגורה' ,2),
  //   //   // new OrderData('900000026',12345,'multipass2','22222',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה פתוחה',0),
  //   //   // new OrderData('900000027',12345,'multipass3','33333',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה פתוחה',0),
  //   //   // new OrderData('900000028',12345,'multipass4','44444',1122,5,'24/01/2021','24/01/2021','400.00','מבוטלת',1),
  //   //   // new OrderData('900000029',12345,'multipass5','55555',1122,5,'24/01/2021','24/01/2021','400.00','מבוטלת',1),
  //   //   // new OrderData('900000030',12345,'multipass6','66666',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה פתוחה',0),
  //   //   // new OrderData('900000031',12345,'multipass7','77777',1122,5,'24/01/2021','24/01/2021','400.00','מבוטלת',1),
  //   //   // new OrderData('900000032',12345,'multipass8','88888',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה פתוחה',0),
  //   //   // new OrderData('900000033',12345,'multipass9','99999',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //   //   // new OrderData('900000034',12345,'multipass12','12121',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //   //   // new OrderData('900000035',12345,'multipass13','13131',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //   //   // new OrderData('900000036',12345,'multipass14','14141',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //   //   // new OrderData('900000037',12345,'multipass15','15151',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2),
  //   //   // new OrderData('900000038',12345,'multipass15','15151',1122,5,'24/01/2021','24/01/2021','400.00','הזמנה סגורה',2)

  //   // ]);
  // }

  fillDataSourceToTable(){
    if(this.Orders != undefined){
      //debugger
      if(this.id != undefined){
        //debugger
        this.orderTitle = 'פרוט הזמנה';
        //this.dataByPage = this.Orders.data.filter(el => el['orderid'] == this.id);
      }
      if(this.customerId != undefined){
        this.orderTitle = 'הזמנה חדשה';
        //this.dataByPage = this.Orders.data.filter(el => el['userId'] == this.customerId);

        this.orderDetails = [{foundation:0, ticketCount: 0, chargeAmount: 0, validity: '', totalCharge : 0}];
        this.orderDetailsTable = new MatTableDataSource(this.orderDetails);
      }
      this.RefControl.setValue(this.id);
    }
    else{
      alert('this.Orders == ' + this.Orders);
    }
  }

  totalData(){
    this.totalTicketCount = 0;
    this.totalOrderSum = 0;
    //debugger
    
    this.orderDetails.forEach(el => {
        //debugger
          this.totalTicketCount += el.ticketCount;
          this.totalOrderSum += el.totalCharge;
        }
    )}
  
  sendMessageToCustomer(){
    this.alertMessage = AlertMessage.sendSuccessfully;
    this.sendSuccess = true;
    setTimeout(() => {
      this.alertMessage = '';
      this.sendSuccess = false;
    }, 3000);
  }

  deleteRow(row){
     let filteringObj = this.orderDetails.filter((el, indexRow) => {
        return indexRow != row;
     });
     this.orderDetailsTable = new MatTableDataSource(filteringObj);
     this.orderDetails = filteringObj;

  }
  addRow(){
    if(this.addToExecOrderForm.valid){
      let ticketCount = +this.addToExecOrderForm.get('ticketCount').value;
      let chargeAmount = +this.addToExecOrderForm.get('chargeAmount').value;
      let validity = this.addToExecOrderForm.get('validity').value;
      let validityFormating = (new Date(validity).getDate() < 10 ? '0' + new Date(validity).getDate() : new Date(validity).getDate() )  + '/' + ((new Date(validity).getMonth() + 1) < 10 ? '0' + (new Date(validity).getMonth() + 1) : new Date(validity).getMonth() + 1) + '/' + new Date(validity).getFullYear();
      this.addToExecOrderForm.get('totalCharge').setValue(ticketCount * chargeAmount);
      let totalCharge = +this.addToExecOrderForm.get('totalCharge').value;
  
  
      this.orderDetails.splice(this.orderDetails.length-1,0,{foundation: this.orderDetails.length, ticketCount: ticketCount, chargeAmount: chargeAmount, validity: validityFormating, totalCharge : totalCharge});
      
      this.orderDetailsTable = new MatTableDataSource(this.orderDetails);

      //reset form
      this.viewAddToExecOrderForm = false;
      setTimeout(()=>{
        this.addToExecOrderForm.reset();
        this.addToExecOrderForm.get('validity').setValue(new Date(new Date().setDate(new Date().getDate() + 1)));
        this.viewAddToExecOrderForm = true;
      }, 0);
      //calculate new total data
      this.totalData();
    }
    else{
      
    }
  }

  calculateTotalCharge(){
    let ticketCount = this.addToExecOrderForm.get('ticketCount').value;
    let chargeAmount = this.addToExecOrderForm.get('chargeAmount').value;

    this.addToExecOrderForm.get('totalCharge').setValue(ticketCount * chargeAmount);
    //debugger
  }

  returnHebTranslation(value){
    return this.CustomerLangObj.filter(el => el.value == value)[0].viewValue;
  }

  
  ngOnChanges(changes: SimpleChanges){

  }

  ngOnDestroy(){
    this.idUnsubscribe.unsubscribe();
  }

}
