import { Route } from '@angular/compiler/src/core';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { tick } from '@angular/core/testing';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatDialog, throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { AlertMessage } from 'src/assets/alertMessage';
import { OrderData } from '../../Classes/OrderData';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogConfirmComponent} from 'src/app/PopUps/dialog-confirm/dialog-confirm.component';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';



@Component({
  selector: 'app-exist-customer',
  templateUrl: './exist-customer.component.html',
  styleUrls: ['./exist-customer.component.css']
})
export class ExistCustomerComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;
   faFileExcel = faFileExcel;

    // data chart
    public recOrdersChartData: ChartDataSets[];
    public recOrdersChartLabels:Label[];

    userToken: string;
    userId;
    errorActionButtons: string = '';
    msgActionButtons: string = '';
    customerData;
    customerOrders;

    saveFormSpinner: boolean = false;


    customerDetails;
    customerAddress;
    customerSettings;

  constructor(
              private activeRoute: ActivatedRoute, 
              private router: Router, 
              private fb: FormBuilder, 
              private dataService: DataServiceService,
              public dialog: MatDialog) { }
  
  CustomerForm = this.fb.group({
    OrganizationName: ['', Validators.required],//v
    FName: (''),
    LName: (''),
    Email: ['', [Validators.required, Validators.email]], //v
    Phone: (''), //v
    Permission: ['', Validators.required],//v
    Phone1: (''), //v
    userNumber: [{value: '', disabled: true}], //v
    CityName: (''),//v
    Streetno: (''),//v
    HouseNumber: (''), //new
    Entrance: (''),//v
    floor: (''), // new
    ApartmentNo: (''),//v
    ZIP: (''), // ------------
    StatusId: [{value: '', disabled: true}],
    MultipassIclientID: (''),
    Tz: ['', Validators.required],//v
    DealerDiscountPercent: (''), //v
    ValidateDate: (''), //new
    BusinessFile: ('/test.txt') //must to be required Validators.required
});

  idUnsubscribe;


  ngOnInit() {
    window.scroll(0,0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
      this.userId = param['id'];

      let objToApi={
        Token: this.userToken,
        CustomerId: param['id']
      }
      

      this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {
        if(typeof result == 'object' && result.obj != null){
          this.customerData = result.obj[0];

          Object.keys(result.obj[0]).forEach(el => {
            if(this.CustomerForm.get(el) != null){
              this.CustomerForm.get(el).setValue(result.obj[0][el]);
            }
          });
      this.getChartData();
        }
      });




      // this.customerDetails = {customerId: this.id, companyName: 'multipass', email: 'test@gmail.com', phone: '0504454325', addPhoneNum: '', role: 'עובד', userNum: '1481'};
      // this.customerAddress = {city: '', street: '', houseNum: '', appNumber: '', entranceNum: '', floor: '', zCode: ''};
      // this.customerSettings = {status: '', idNum: '', comaxCode: '', discount: '', custValDate: ''};

    })

  }

  
  ngOnChanges(changes: SimpleChanges){

  }

  getChartData(){
    // this.recOrdersChartData = [
    //   { data: [1500,2000,1750,9000,500, 250], label: 'ערך הזמנה' }
    // ];

    
    // this.recOrdersChartLabels = ['16:12:23 16/03/2021','15:12:23 14/03/2021','13:12:23 13/03/2021','12:12:23 11/03/2021','16:12:23 9/03/2021','16:12:23 6/03/2021'];
  

    let objToApi = {
      Token: this.userToken,
      UserID: this.userId
    }
    this.dataService.GetOrdersByFilter(objToApi).subscribe(result => {
      if(typeof result == 'object' && result['obj'] != undefined && result['obj'].length > 0){
        this.customerOrders = result.obj;
        let totalOrder = 0;
        let totalByOrder = [];
        let createDateByOrder = [];

        result['obj'].forEach(element => {
          totalOrder += element.Total;
          totalByOrder.push(element.Total);
          createDateByOrder.push(element.MDate);
        });

        this.recOrdersChartData = [
          { data: totalByOrder, label: 'הזמנות אחרונות' }
          // { data: totalByOrder, label: 'הזמנות אחרונות' }
        ];


        this.recOrdersChartLabels = createDateByOrder;
      }
    });
  
  }

  saveForm(){
    if(this.CustomerForm.valid){
      this.saveFormSpinner = true;

      let date = new Date(this.CustomerForm.get('ValidateDate').value);
      let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
      let year = date.getFullYear();
      let formattingDate = month + '-' + day + '-' + year;
      // this.CustomerForm.get('ValidateDate').setValue(formattingDate);

      let data = this.CustomerForm.value;

      let objToApi = {
        Token: this.userToken, //req
        Id: this.customerData.id
      }
  
      Object.keys(data).forEach(key => {
        if(data[key] != ''){
          objToApi[key] = data[key]
        }
      })

      //change to numeric
      objToApi['Tz']= +objToApi['Tz'];
      objToApi['ValidateDate'] = formattingDate;

      this.dataService.InsertUpdateUser(objToApi).subscribe(result => {
        this.saveFormSpinner = false;
        if(typeof result == 'object' && result.obj != null){

          this.msgActionButtons = 'נשמר בהצלחה';
          setTimeout(()=>{
            this.msgActionButtons = '';
          }, 3000);
          
          this.customerData = result.obj[0];
          this.customerData.ValidateDate = result.obj[0]['businessValidDate'];
          
          Object.keys(result.obj[0]).forEach(el => {
            if(this.CustomerForm.get(el) != null){
              this.CustomerForm.get(el).setValue(result.obj[0][el]);
            }
          });

        }
        if(typeof result == 'string'){
          this.errorActionButtons = result;

          setTimeout(() => {
            this.errorActionButtons = '';
          }, 3000);
        }
        // else{
        //   alert(JSON.stringify(result));
        // }
      });
    }
    else{
      alert('form validation error');
    }
  }

  deleteCustomer(){

    const dialogRef = this.dialog.open(DialogConfirmComponent,{
      data: {message: 'האם למחוק ' + this.customerData.OrganizationName + '?'}
    }).afterClosed().subscribe(response => {
      if(response.result == 'yes'){

        let objToApi = {
          Token: this.userToken,
          UserId: this.userId
        }
  
        this.dataService.DeleteSuspendUsers(objToApi).subscribe(result => {
          if(result != undefined){
            if(result.obj != null){
              this.dialog.open(DialogComponent,{
                data: {message: 'נמחק בהצלחה'}
              });
            }
            if(result.errdesc != ''){
              this.dialog.open(DialogComponent,{
                data: {message: '--' + result.errdesc + '--'}
              });
            }
          }
        });
      }
    });

    // dialogRef.afterClosed().subscribe(result => {
    //   debugger
    //   console.log(`Dialog result: ${result}`);
    // });

  }


  openDialog(){

  }
  ngOnDestroy(){
    this.idUnsubscribe.unsubscribe();
  }

}
