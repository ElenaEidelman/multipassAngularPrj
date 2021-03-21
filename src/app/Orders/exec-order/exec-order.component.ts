import { Route } from '@angular/compiler/src/core';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { tick } from '@angular/core/testing';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertMessage } from 'src/assets/alertMessage';
import { OrderData } from '../../Classes/OrderData';



@Component({
  selector: 'app-exec-order',
  templateUrl: './exec-order.component.html',
  styleUrls: ['./exec-order.component.css']
})


export class ExecOrderComponent implements OnInit, OnDestroy, OnChanges {

  Orders: MatTableDataSource<OrderData>;

  constructor(private activeRoute: ActivatedRoute, private fb: FormBuilder) { }
  
  Customer: any = {name: 'אלון מולטיפאס', id: '123456', kumkusNum:'abcdef', mail: '	alon@multipass.co.il', phone: '0521234567', addPhone: '052333333' }

  CustomerLangObj = [
    {value: 'name', viewValue: 'שם הלקוח'},
    {value: 'id', viewValue: 'ח.פ'},
    {value: 'kumkusNum', viewValue: 'מספר קומקס'},
    {value: 'mail', viewValue: 'מייל'},
    {value: 'phone', viewValue: 'טלפון'},
    {value: 'addPhone', viewValue: 'טלפון נוסף'}
  ];

  //order table 
  orderDetails = [
    {foundation:1, ticketCount: 2, chargeAmount: 500.00, validity: '31/01/2026', totalCharge : 1000.00},
    {foundation:2, ticketCount: 2, chargeAmount: 500.00, validity: '31/01/2026', totalCharge : 1000.00},
    {foundation:0, ticketCount: 0, chargeAmount: 0, validity: '', totalCharge : 0}
  ];
  displayedColumnsOrderDetails = ['foundation','ticketCount','chargeAmount','validity','totalCharge','additionalColumn'];
 
  columnsHeb = {
    'foundation' : "מס''ד",
    'ticketCount' : 'כמות כרטיסים	',
    'chargeAmount' : 'סכום טעינה',
    'validity' : 'תוקף',
    'totalCharge' : "סה''כ סכום טעינה",
  }

  dataByPage;
  id;
  idUnsubscribe;

  alertMessage: string = '';

  sendSuccess: boolean = false; 
  viewAddToExecOrderForm: boolean = true;

  totalTicketCount: number = 0;
  totalOrderSum: number = 0;

  orderDetailsTable = new MatTableDataSource(this.orderDetails);

  //for additional empty row foraddToExecOrderForm
  formTableForAddOrder = new MatTableDataSource([{foundation:0, ticketCount: 0, chargeAmount: 0, validity: '', totalCharge : 0}]);

  addToExecOrderForm = this.fb.group({
    ticketCount: ['', [Validators.required, Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    chargeAmount: ['', [Validators.required, Validators.min(1), Validators.max(1000), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    validity: [new Date(new Date().setDate(new Date().getDate() + 1)), Validators.required],
    totalCharge: [{value: '', disabled: true}]
  });

  CRMcontrol = new FormControl('');

  //disable all days before current data
  calendarFilter = (d: Date | null): boolean => {
    //  debugger
    const day = (d || new Date()).getDate() < 10 ? '0' + (d || new Date()).getDate() : (d || new Date()).getDate()  ;
    const month = ((d || new Date()).getMonth() + 1) < 10 ? '0' + ((d || new Date()).getMonth() + 1) : ((d || new Date()).getMonth() + 1);
    const year = (d || new Date()).getFullYear();


    return new Date() < new Date(month + '/' + day + '/' + year);
  }

  ngOnInit() {
    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
      this.createDataSourceForTable();
      this.id = param['id'];
      if(this.Orders != undefined){
        this.dataByPage = this.Orders.data.filter(el => el['orderId'] == this.id);
        //debugger
        this.CRMcontrol.setValue(this.dataByPage[0]['orderiDcrm']);
      }
    })

    this.totalData();
  }

  createDataSourceForTable(){
    this.Orders = new MatTableDataSource([
      new OrderData('1', 12345, 'multipass','11111', 1122, 1122, 5, '24/01/2021 13:23', '24/01/2021 13:23', '24/01/2021 13:23', '400.00', 'הזמנה סגורה' ,2),
      new OrderData('2',12345,'multipass','22222',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה פתוחה',0),
      new OrderData('3',12345,'multipass','33333',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה פתוחה',0),
      new OrderData('1',12345,'multipass','44444',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','נשלח לקומקס',1),
      new OrderData('1',12345,'multipass','55555',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','נשלח לקומקס',1),
      new OrderData('1',12345,'multipass','66666',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה פתוחה',0),
      new OrderData('1',12345,'multipass','77777',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','נשלח לקומקס',1),
      new OrderData('1',12345,'multipass','88888',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה פתוחה',0),
      new OrderData('1',12345,'multipass','99999',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass','12121',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass','13131',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass','14141',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass','15151',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass','16161',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass','17171',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),
      new OrderData('1',12345,'multipass','18181',1122,1122,5,'24/01/2021 13:23','24/01/2021 13:23','24/01/2021 13:23','400.00','הזמנה סגורה',2),

    ]);
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
      debugger
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
