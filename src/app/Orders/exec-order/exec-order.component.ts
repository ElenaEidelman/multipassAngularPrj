import { Route } from '@angular/compiler/src/core';
import { typeWithParameters } from '@angular/compiler/src/render3/util';
import { Component, Inject, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChildren, ViewEncapsulation } from '@angular/core';
import { tick } from '@angular/core/testing';
import { ControlContainer, FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Data, Router, RouterModule } from '@angular/router';
import * as moment from 'moment';
import { resourceUsage } from 'process';
import { element } from 'protractor';
import { elementAt } from 'rxjs/operators';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent } from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent, DialogData } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/shared.service';
import { AlertMessage } from 'src/assets/alertMessage';

@Component({
  selector: 'app-exec-order',
  templateUrl: './exec-order.component.html',
  styleUrls: ['./exec-order.component.css'],
  encapsulation: ViewEncapsulation.None
})


export class ExecOrderComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChildren('orderLinesChildren') orderLinesChildren;


  // OrderData;

  constructor(
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private router: Router,
    private dialog: MatDialog) { }

  insertOrderLineSpinner: boolean = false;
  createCardsSpinner: boolean = false;
  deleteCardsSpinner: boolean = false;


  errorMsg: string = '';
  orderMsg: string = '';
  orderMsgDelete: string = '';
  errorMsgDelete: string = '';
  addOrderLineErrMsg: string = '';
  orderRefMsg: string = '';
  errorRefMsg: string = '';

  chagesToServer = [];


  minDate: any;
  maxDate: any;


  orderIdToPreview;

  orderStatus = {
    id: '',
    description: ''
  }

  newOrder: boolean = false;
  saveChangesSpinner: boolean = false;
  //translate customer data value to hebrew
  CustomerLangObj = [
    { value: 'FName', viewValue: 'שם' },
    { value: 'LName', viewValue: 'שם משפחה' },
    { value: 'Tz', viewValue: 'ח.פ' },
    { value: 'Email', viewValue: 'מייל' },
    { value: 'Phone', viewValue: 'טלפון' },
    { value: 'Phone1', viewValue: 'טלפון נוסף' }
  ];

  statusListArr;
  Customer;

  //orderDetail must contain one row with empty data
  orderDetails = [
    { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
  ];

  displayedColumnsOrderDetails = ['id', 'QTY', 'LoadSum', 'ValidationDate', 'TotalForItem', 'additionalColumn'];

  orderDetailsUpdateForm = this.fb.group({});

  columnsHeb = {
    'id': "מס''ד",
    'QTY': 'כמות כרטיסים	',
    'LoadSum': 'סכום טעינה',
    'ValidationDate': 'תוקף',
    'TotalForItem': "סה''כ סכום טעינה",
  }

  Orders: MatTableDataSource<any>;

  dataByPage;

  orderId;
  customerId;
  idUnsubscribe;

  alertMessage: string = '';

  sendSuccess: boolean = false;
  noInfoView: boolean;
  viewAddToExecOrderForm: boolean = true;

  totalTicketCount: number = 0;
  totalOrderSum: number = 0;

  userToken: string;
  orderDetailsTable;

  date: any;


  //for additional empty row foraddToExecOrderForm
  addToExecOrderForm = this.fb.group({
    ticketCount: ['', [Validators.required, Validators.min(1), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    chargeAmount: ['', [Validators.required, Validators.min(1), Validators.max(1000), Validators.pattern(/^-?(0|[1-9]\d*)?$/)]],
    validity: [this.getLastDateOfCurrentMonthAnd5Years(), Validators.required],
    TotalForItem: [{ value: '', disabled: true }]
  });

  //מספר אסמכתה
  RefControl = new FormControl('');

  ngOnInit() {
    window.scroll(0, 0);
    let url = this.router.url;

    // this.getCalendarFilter();

    this.idUnsubscribe = this.activeRoute.params.subscribe(param => {
      this.userToken = JSON.parse(localStorage.getItem('user')).Token;

      //manual order
      if (url.includes('order')) {
        this.orderId = param['id'];
        this.customerId = param['customerId'];
        this.newOrder = false;

        let objToApi = {
          Token: this.userToken,
          CoreOrderID: this.orderId
        }
        this.dataService.GetOrderDetails(objToApi).subscribe(result => {
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (typeof result == 'object' && result.obj != null) {
              this.orderIdToPreview = result.obj[0].idex;
              let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].StatusId);
              this.orderStatus.id = statusData[0].StatusId;
              this.orderStatus.description = statusData[0].Description;

              this.dataByPage = result['obj'][0];
              this.RefControl.setValue(this.dataByPage.CrmOrderId);//Reference

              //get customer data
              this.Customer = result['obj'][0];

              this.Orders = new MatTableDataSource(result['obj'][0]['Lines']);

              this.Orders.data.forEach((element, index) => {
                this.orderDetails.unshift(element);
              });

              this.orderDetailsTable = new MatTableDataSource(this.orderDetails);
              this.totalData();
            }
            if (result.Token == null && result.errdesc != null && result.errdesc != '') {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
            }

          }
          else {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            });
            // this.sharedService.exitSystemEvent();
          }

        })
      }

      //new order
      if (url.includes('newOrder')) {
        this.customerId = param['customerId'];
        this.newOrder = true;

        let objToApi = {
          Token: this.userToken,
          CustomerId: param['customerId']
        }
        this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (typeof result == 'object' && result.obj != null) {

              //set status data
              // let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].StatusId);
              // this.orderStatus.id = statusData[0].StatusId;
              // this.orderStatus.description = statusData[0].Description;
              this.orderStatus.description = 'הזמנה חדשה';


              this.Customer = result.obj[0];
              this.dataByPage = result.obj[0];
            }
            if (result.Token == null && result.errdesc != null && result.errdesc != '') {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
            }
          }
          else {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            });
            // this.sharedService.exitSystemEvent();
          }
        });

        let orderDetails = [{ id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }];
        this.orderDetailsTable = new MatTableDataSource(orderDetails);
      }

      if (url.includes('excelOrder')) {
        this.customerId = param['customerId'];
        this.newOrder = false;

        let forNewOrderData = JSON.parse(localStorage.getItem('createOrderByExcel'));
        //get customer data
        let objToApiForCustomerData = {
          Token: this.userToken,
          CustomerId: param['customerId']
        }
        this.dataService.GetCustomersByFilter(objToApiForCustomerData).subscribe(result => {
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];
            

            if (typeof result == 'object' && result.obj != null) {
              this.orderStatus.description = 'הזמנה חדשה';
              this.Customer = result.obj[0];
              this.dataByPage = result.obj[0];
              this.RefControl.setValue(this.dataByPage.CrmOrderId);//Reference
            }
            if (result.Token == null && result.errdesc != null && result.errdesc != '') {
              // alert(result.errdesc);
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc != undefined ? result.errdesc : result }
              })
            }
          }
          else {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc != undefined ? result.errdesc : result }
            })
            // this.sharedService.exitSystemEvent();
          }
        });


        //object for insert orderLines
        let formDataForOrdersLine = new FormData();
        formDataForOrdersLine.append('Token', this.userToken)
        formDataForOrdersLine.append('UserID', param['customerId'])
        formDataForOrdersLine.append('Description', forNewOrderData.FileName)
        formDataForOrdersLine.append('OpCode', 'create')

        this.dataService.InsertUpdateOrderByExcel(formDataForOrdersLine).subscribe(result => {
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];


            if (result['obj'][0] != undefined) {
              this.orderDetails = [
                { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
              ];
              this.orderDetails.unshift(...result['obj'][0]['Lines']);
              debugger
              this.orderDetailsTable = new MatTableDataSource(this.orderDetails);

              //set status data
              let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].OrderStatus);
              this.orderStatus.id = statusData[0].StatusId;
              this.orderStatus.description = statusData[0].Description;
              this.orderId = result.obj[0].orderid;

              //calculate new total dat
              this.totalData();
            }

          }
          else {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc != undefined ? result.errdesc : result }
            })
          }
        });


        let orderDetails = [{ id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }];
        this.orderDetailsTable = new MatTableDataSource(orderDetails);
      }
    })

    this.getStatusList();
    // this.RefControl.setValue(this.orderId);
    this.totalData();
  }

  // getCalendarFilter() {
  //   let lastDateOfMonth = this.addToExecOrderForm.get('validity').value;//last day of current month
  //   let fiveYFromCurrDate = new Date(lastDateOfMonth.getFullYear() + 5, lastDateOfMonth.getMonth(), lastDateOfMonth.getDate());
  //   // const currentYear = new Date().getFullYear();

  //   const day = lastDateOfMonth.getDate();
  //   const month = lastDateOfMonth.getMonth();
  //   const year = lastDateOfMonth.getFullYear();



  //   const Fday = fiveYFromCurrDate.getDate();
  //   const Fmonth = fiveYFromCurrDate.getMonth();
  //   const Fyear = fiveYFromCurrDate.getFullYear();

  //   this.minDate = new Date(year, month, day);
  //   this.maxDate = new Date(Fyear, +Fmonth, +Fday);
  // }

  getLastDateOfCurrentMonthAnd5Years() {
    let date = new Date();
    let lastDay = new Date(date.getFullYear() + 5, date.getMonth() + 1, 0, 23, 59, 59);
    return lastDay;
  }

  getStatusList() {
    //api/Orders/GetOrdersStatus
    //Token

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetOrdersStatus(objToApi).subscribe(result => {

      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];


        if (typeof result == 'object' && result.obj != null) {
          this.statusListArr = [...result.obj];
        }
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        });
        // this.sharedService.exitSystemEvent();
      }
    });


  }


  totalData() {
    this.totalTicketCount = 0;
    this.totalOrderSum = 0;
    //debugger

    this.orderDetails.forEach(el => {
      this.totalTicketCount += el.QTY;
      this.totalOrderSum += el.TotalForItem;
    }
    )
  }

  sendMessageToCustomer() {
    this.alertMessage = AlertMessage.sendSuccessfully;
    this.sendSuccess = true;
    setTimeout(() => {
      this.alertMessage = '';
      this.sendSuccess = false;
    }, 3000);
  }

  deleteRow(element, row) {

    let date = element.ValidationDate.split('/');
    let dateForApi = date[1] + '-' + date[0] + '-' + date[2];
    //format date for api by mm/dd/yy

    let objToApi = {
      Token: this.userToken,
      OrderId: this.orderId.toString(),
      UserID: this.customerId,
      ChargeAmount: element.LoadSum,
      Validity: dateForApi,
      OpCode: "delete"
    }


    //show spinner of order line by id
    this.orderLinesChildren._results.forEach(el => {
      let spinner = (el.nativeElement.children['spinnerDelete' + element.id] as HTMLBodyElement);
      if (spinner != undefined) {
        (el.nativeElement.children['spinnerDelete' + element.id] as HTMLBodyElement).classList.remove('disableSpinner');
        (el.nativeElement.children['spinnerDelete' + element.id] as HTMLBodyElement).classList.add('enableSpinner');
      }
    })

    this.dataService.InsertUpdateLines(objToApi).subscribe(result => {
      if (result['Token'] != undefined || result['Token'] != null) {

        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        this.orderDetails = [
          { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
        ];
        if (result['obj'][0]['Lines'].length > 0) {
          this.orderDetails.unshift(...result['obj'][0]['Lines']);
        }

        // let filteringObj = this.orderDetails.filter((el, indexRow) => {
        //    return indexRow != row;
        // });
        this.orderDetailsTable.data = this.orderDetails;
        this.totalData();
        // this.orderDetails = filteringObj;
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        // this.sharedService.exitSystemEvent();
      }
    });

  }
  addOrderLine() {
    if (this.newOrder) {
      if (this.addToExecOrderForm.valid) {
        this.insertOrderLineSpinner = true;
        let ticketCount = +this.addToExecOrderForm.get('ticketCount').value;
        let chargeAmount = +this.addToExecOrderForm.get('chargeAmount').value;
        let validity = new Date(this.addToExecOrderForm.get('validity').value);
        validity.setHours(23,59,59)
        // let validityFormating = (new Date(validity).getDate() < 10 ? '0' + new Date(validity).getDate() : new Date(validity).getDate()) + '/' + ((new Date(validity).getMonth() + 1) < 10 ? '0' + (new Date(validity).getMonth() + 1) : new Date(validity).getMonth() + 1) + '/' + new Date(validity).getFullYear();
        this.addToExecOrderForm.get('TotalForItem').setValue(ticketCount * chargeAmount);
        // let TotalForItem = +this.addToExecOrderForm.get('TotalForItem').value;

        let objToApi = {
          Token: this.userToken,
          UserId: this.customerId,
          ChargeAmount: chargeAmount,
          TicketCount: ticketCount,
          Validity: validity,
          OpCode: "insert"
        }
        //query for insert update order lines, but not for the first line
        if (this.orderDetailsTable.data.length > 1) {

          objToApi['OrderId'] = this.orderId;
          debugger
          this.dataService.InsertUpdateLines(objToApi).subscribe(result => {
            debugger
            this.insertOrderLineSpinner = false;
            this.addToExecOrderForm.get('validity').setValue(this.getLastDateOfCurrentMonthAnd5Years());
            debugger
            if (result['Token'] != undefined || result['Token'] != null) {

              //set new token
              let tempObjUser = JSON.parse(localStorage.getItem('user'));
              tempObjUser['Token'] = result['Token'];
              localStorage.setItem('user', JSON.stringify(tempObjUser));
              this.userToken = result['Token'];

              if (result['obj'] != undefined) {

                this.orderDetails = [
                  { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
                ];

                this.orderDetails.unshift(...result['obj'][0]['Lines']);
                this.orderDetailsTable = new MatTableDataSource(this.orderDetails);
                //calculate new total dat
                this.totalData();


                //set status data
                let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].OrderStatus);
                this.orderStatus.id = statusData[0].OrderStatus != undefined ? statusData[0].OrderStatus : statusData[0].StatusId;
                debugger
                this.orderStatus.description = statusData[0].Description;
              }
            }
            else {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
              // this.sharedService.exitSystemEvent();
            }
          });
        }

        //insert first line, create new order
        else {
          this.dataService.InsertUpdateOrder(objToApi).subscribe(result => {
            this.addToExecOrderForm.get('validity').setValue(this.getLastDateOfCurrentMonthAnd5Years());
            if (result['Token'] != undefined || result['Token'] != null) {
              this.insertOrderLineSpinner = false;

              if (result['obj'][0]['Lines'].length > 0) {
                this.orderDetails = [
                  { id: 0, QTY: 0, LoadSum: 0, ValidationDate: '', TotalForItem: 0 }
                ];

                this.orderDetails.unshift(result['obj'][0]['Lines'][0]);
                debugger
                this.orderDetailsTable = new MatTableDataSource(this.orderDetails);

                //after created new order, set order id
                this.orderId = result['obj'][0]['orderid'];

                //calculate new total dat
                this.totalData();

                //set status data
                let statusData = this.statusListArr.filter(status => status.StatusId == result.obj[0].OrderStatus);
                this.orderStatus.id = statusData[0].StatusId;
                this.orderStatus.description = statusData[0].Description;
              }
            }
            else {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
              // this.sharedService.exitSystemEvent();
            }
          });
        }

        //reset form
        this.viewAddToExecOrderForm = false;
        setTimeout(() => {
          this.addToExecOrderForm.reset();
          this.addToExecOrderForm.get('validity').setValue(new Date(new Date().setDate(new Date().getDate() + 1)));
          this.viewAddToExecOrderForm = true;
        }, 0);

      }
      else {
        this.addOrderLineErrMsg = 'נא למלא את כל השדות';

        setTimeout(() => {
          this.addOrderLineErrMsg = '';
        }, 3000);
      }
    }

    //not new order
    else {
      this.dialog.open(DialogComponent, {
        data: { message: 'not new order' }
      })
    }
  }

  ApproveOrder() {
    if (this.orderDetails.length > 1) {
      this.createCardsSpinner = true;
      let objToApi = {
        Token: this.userToken,
        OrderId: this.orderId.toString(),
        UserID: this.customerId
      }
      this.dataService.ApproveOrder(objToApi).subscribe(result => {
        debugger
        this.createCardsSpinner = false;

        if (result['Token'] != undefined || result['Token'] != null) {



          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
            localStorage.setItem('createOrderByExcel', '');
            this.orderMsg = 'הזמנה נקלטה בהצלחה';
            setTimeout(() => {
              this.orderMsg = '';
            }, 3000);

            setTimeout(() => {
              this.router.navigate(['/public/order/', result.obj[0]['orderid'], this.customerId]);
            }, 2000);

          }
          // if (result.obj == null) {
          //   alert('order already created => orderId: ' + this.orderId);
          // }
          if (result.errdesc != null && result.errdesc != '') {
            this.errorMsg = result.errdesc;

            setTimeout(() => {
              this.errorMsg = '';
            }, 3000)
          }
        }
        else {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          })
          // this.sharedService.exitSystemEvent();
        }
      })
    }
    else {
      this.errorMsg = 'נא ליצור לפחות הזמנה אחת';

      setTimeout(() => {
        this.errorMsg = '';
      }, 3000)
    }
  }
  deleteOrder() {

    this.dialog.open(DialogConfirmComponent, {
      data: { message: 'האם למחוק הזמנה מספר: ' + ' ' + this.orderIdToPreview }
    }).afterClosed().subscribe(response => {
      if (response.result == 'yes') {

        let objToApi = {
          Token: this.userToken,
          OrderId: this.orderId,
          UserID: this.customerId,
          OpCode: "delete"
        }

        this.deleteCardsSpinner = true;
        this.dataService.DeleteVoidOrder(objToApi).subscribe(result => {
          this.deleteCardsSpinner = false;

          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (typeof result == 'object' && result.obj != null && Object.values(result.obj[0]).includes('Order is deleted Successfully')) {
              this.orderMsgDelete = 'ההזמנה נמחקה בהצלחה';
              setTimeout(() => {
                this.orderMsgDelete = '';
                this.router.navigate(['/public/allOrders']);
              }, 2000);
            }
            if (typeof result == 'object' && result.obj != null && Object.values(result.obj[0]).includes('Order is Voided Successfully')) {
              this.orderMsgDelete = 'בוטל בהצלחה';
              setTimeout(() => {
                this.orderMsgDelete = '';
                this.router.navigate(['/public/allOrders']);
              }, 2000);
            }
            if (result.obj == null && result.errdesc != '') {
              this.dialog.open(DialogComponent, {
                data: { message: result.errdesc }
              });
            }
            if (typeof result == 'string') {
              this.errorMsgDelete = result;
              setTimeout(() => {
                this.errorMsgDelete = '';
              }, 3000);
            }
          }
          else {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            });
            // this.sharedService.exitSystemEvent();
          }
        });
      }
    })

  }

  calculateTotalCharge() {
    let ticketCount = this.addToExecOrderForm.get('ticketCount').value;
    let chargeAmount = this.addToExecOrderForm.get('chargeAmount').value;

    this.addToExecOrderForm.get('TotalForItem').setValue(ticketCount * chargeAmount);
    //debugger
  }

  returnHebTranslation(value) {
    return this.CustomerLangObj.filter(el => el.value == value)[0].viewValue;
  }

  saveChanges(){
    if(this.RefControl.value != ''){
      this.saveChangesSpinner = true;
      let objToApi = {
        Token: this.userToken,
        UserID:this.customerId,
        OrderID:this.orderId,
        Reference:this.RefControl.value
      }

      this.chagesToServer = [];

      /**
       * data for order date change
       * ValidationDate : ''
       * orderId: ''
       * 
       */
      debugger

      this.dataService.InsertUpdateOrder(objToApi).subscribe(result => {
        debugger
        this.saveChangesSpinner = false;
        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];
  
          if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
            this.orderRefMsg = 'שינויים נשמרו בהצלחה';

            setTimeout(()=>{
              this.orderRefMsg = '';
            }, 2000);
          }
        }
        else {
          this.dialog.open(DialogComponent, {
            data: {message: result.errdesc}
          })
          this.sharedService.exitSystemEvent();
        }
      });
    }
    else{
      this.errorRefMsg = 'נא להזין מספר אסמכתא';

      setTimeout(()=> {
        this.errorMsg = '';
      }, 2000);
    }
  }

  changeDateOfRow(element, controlName){
    this.dialog.open(DatePickerDialog, {
      data: {
        date: this.addToExecOrderForm.get('validity').value,
        element: element,
        control: controlName
      }
    }).afterClosed().subscribe(dialogResult => {
      let det = this.orderDetails;
      let el = element;
      let test = det.filter(detail => detail.id == el.id)

      debugger
      // this.addToExecOrderForm.get('validation').setValue(this.getLastDateOfCurrentMonthAnd5Years());
      debugger
      this.orderDetails.forEach(order => {
        if(order.id == element.id){
          debugger
          let newDate = new Date(dialogResult.result.date);

          let day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate();
          let month = newDate.getMonth() < 10 ? '0' + newDate.getMonth() : newDate.getMonth();
          let year = newDate.getFullYear();
          // new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());

          order.ValidationDate = day + '/' + month + '/' + year;
        }
      });
      //this.orderDetails.filter(order => order.id == result.id)['ValidationDate'] = new Date(result);
    });
  }

  ngOnChanges(changes: SimpleChanges) {

  }

  ngOnDestroy() {
    this.idUnsubscribe.unsubscribe();
  }
}

export interface DatePickerDialogData {
  date: '',
  element: '',
  control: ''
}

@Component({
  selector: 'dialog-datePicker',
  templateUrl: './datePickerDialog.html',
  styleUrls: ['./datePickerStyle.css'],
})
export class DatePickerDialog implements OnInit {

  

  constructor(
    public dialog: MatDialog,
              public dialogRef: MatDialogRef<DatePickerDialog>, 
              @Inject(MAT_DIALOG_DATA) public data: DatePickerDialogData, 
              private route: Router
  ) { 
    // this.setCalendarFilter();
  }
  ngOnInit(): void {
    this.validity.setValue(this.data.date);//new Date
    debugger
  }


  validity = new FormControl()
  // minDate: any;
  // maxDate: any;



  // setCalendarFilter() {
  //   let date = new Date();

  //   let lastDateOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);//last day of current month
  //   let fiveYFromCurrDate = new Date(lastDateOfMonth.getFullYear() + 5, lastDateOfMonth.getMonth(), lastDateOfMonth.getDate());
  //   // const currentYear = new Date().getFullYear();

  //   const day = lastDateOfMonth.getDate();
  //   const month = lastDateOfMonth.getMonth();
  //   const year = lastDateOfMonth.getFullYear();



  //   const Fday = fiveYFromCurrDate.getDate();
  //   const Fmonth = fiveYFromCurrDate.getMonth();
  //   const Fyear = fiveYFromCurrDate.getFullYear();

  //   // this.minDate = new Date(year, month, day);
  //   // this.maxDate = new Date(Fyear, +Fmonth, +Fday);
  // }

  // getLastDateOfCurrentMonth() {
  //   let date = new Date();
  //   let lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
  //   return lastDay;
  // }
  
  dialogClose(){
    this.dialogRef.close();
  }
  select(){
    this.dialogRef.close({
      result: {
        date: this.validity.value,
        element: this.data.element,
        control: this.data.control
      },
    }); 
  }
}
