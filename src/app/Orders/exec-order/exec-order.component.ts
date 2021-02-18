import { Route } from '@angular/compiler/src/core';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { tick } from '@angular/core/testing';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AlertMessage } from 'src/assets/alertMessage';
import { Order } from 'src/assets/orderObj';



@Component({
  selector: 'app-exec-order',
  templateUrl: './exec-order.component.html',
  styleUrls: ['./exec-order.component.css']
})


export class ExecOrderComponent implements OnInit, OnDestroy, OnChanges {

  constructor(private activeRoute: ActivatedRoute, private fb: FormBuilder) { }
  Orders:any = [
    {orderId: 900000181, orderiDcrm: 12, companyName: 'מולטיפאס', comaxCustomerNumber: 12345, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-01-2021', dateActivation: '24/01/2021 13:44', orderValue: '400.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000182, orderiDcrm: 13, companyName: 'test', comaxCustomerNumber: 123456, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:24', dateIssue: '24-02-2021', dateActivation: '24/01/2021 13:45', orderValue: '401.00', orderStatus: 'נשלח לקומקס', orderStatusId: 1},
    {orderId: 900000183, orderiDcrm: 14, companyName: 'test name', comaxCustomerNumber: 123458, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:25', dateIssue: '24-03-2021', dateActivation: '24/01/2021 13:46', orderValue: '402.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000184, orderiDcrm: 15, companyName: 'test company', comaxCustomerNumber: 123457, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:26', dateIssue: '24-04-2021', dateActivation: '24/01/2021 13:47', orderValue: '403.00', orderStatus: 'נשלח לקומקס', orderStatusId: 1},
    {orderId: 900000185, orderiDcrm: 16, companyName: 'title company', comaxCustomerNumber: 123459, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:27', dateIssue: '24-05-2021', dateActivation: '24/01/2021 13:48', orderValue: '404.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000186, orderiDcrm: 17, companyName: 'company name', comaxCustomerNumber: 123450, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:28', dateIssue: '24-06-2021', dateActivation: '24/01/2021 13:49', orderValue: '405.00', orderStatus: 'הזמנה פתוחה' ,orderStatusId: 0},
    {orderId: 900000187, orderiDcrm: 18, companyName: 'test', comaxCustomerNumber: 12345, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-07-2021', dateActivation: '24/01/2021 13:50', orderValue: '406.00', orderStatus: 'הזמנה פתוחה', orderStatusId: 0},
    {orderId: 900000188, orderiDcrm: 12, companyName: 'מולטיפאס', comaxCustomerNumber: 12345, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-01-2021', dateActivation: '24/01/2021 13:44', orderValue: '400.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000189, orderiDcrm: 13, companyName: 'test', comaxCustomerNumber: 123456, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:24', dateIssue: '24-02-2021', dateActivation: '24/01/2021 13:45', orderValue: '401.00', orderStatus: 'נשלח לקומקס', orderStatusId: 1},
    {orderId: 900000190, orderiDcrm: 14, companyName: 'test name', comaxCustomerNumber: 123458, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:25', dateIssue: '24-03-2021', dateActivation: '24/01/2021 13:46', orderValue: '402.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000191, orderiDcrm: 15, companyName: 'test company', comaxCustomerNumber: 123457, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:26', dateIssue: '24-04-2021', dateActivation: '24/01/2021 13:47', orderValue: '403.00', orderStatus: 'נשלח לקומקס', orderStatusId: 1},
    {orderId: 900000192, orderiDcrm: 16, companyName: 'title company', comaxCustomerNumber: 123459, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:27', dateIssue: '24-05-2021', dateActivation: '24/01/2021 13:48', orderValue: '404.00', orderStatus: 'הזמנה סגורה', orderStatusId: 2},
    {orderId: 900000193, orderiDcrm: 17, companyName: 'company name', comaxCustomerNumber: 123450, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:28', dateIssue: '24-06-2021', dateActivation: '24/01/2021 13:49', orderValue: '405.00', orderStatus: 'הזמנה פתוחה' ,orderStatusId: 0},
    {orderId: 900000194, orderiDcrm: 18, companyName: 'test', comaxCustomerNumber: 12345, comaxFileId : 0, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-07-2021', dateActivation: '24/01/2021 13:50', orderValue: '406.00', orderStatus: 'הזמנה פתוחה', orderStatusId: 0}
  ];
  Customer: any = {name: 'אלון מולטיפאס', id: '123456', kumkusNum:'abcdef', mail: '	alon@multipass.co.il', phone: '0521234567', addPhone: '052333333' }



  //order table 
  orderDetails = [
    {foundation:1, ticketCount: 2, chargeAmount: 500.00, validity: '31/01/2026', totalCharge : 1000.00},
    {foundation:2, ticketCount: 2, chargeAmount: 500.00, validity: '31/01/2026', totalCharge : 1000.00}
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
    validity: ['', Validators.required],
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
      this.id = param['id'];
      this.dataByPage = this.Orders.filter(el => el['orderId'] == this.id);
      //debugger
      this.CRMcontrol.setValue(this.dataByPage[0]['orderiDcrm']);
    })

    this.totalData();
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
  
  
      this.orderDetails.push({foundation: this.orderDetails.length + 1, ticketCount: ticketCount, chargeAmount: chargeAmount, validity: validityFormating, totalCharge : totalCharge});
      this.orderDetailsTable = new MatTableDataSource(this.orderDetails);

      //reset form
      this.viewAddToExecOrderForm = false;
      setTimeout(()=>{
        this.addToExecOrderForm.reset();
        this.viewAddToExecOrderForm = true;
      }, 0);
      //calculate new total data
      this.totalData();
    }
  }

  calculateTotalCharge(){
    let ticketCount = this.addToExecOrderForm.get('ticketCount').value;
    let chargeAmount = this.addToExecOrderForm.get('chargeAmount').value;

    this.addToExecOrderForm.get('totalCharge').setValue(ticketCount * chargeAmount);
    //debugger
  }

  
  ngOnChanges(changes: SimpleChanges){

  }

  ngOnDestroy(){
    this.idUnsubscribe.unsubscribe();
  }

}
