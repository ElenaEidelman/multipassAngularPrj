import { Route } from '@angular/compiler/src/core';
import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { tick } from '@angular/core/testing';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { throwMatDialogContentAlreadyAttachedError } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';
import { AlertMessage } from 'src/assets/alertMessage';
import { OrderData } from '../../Classes/OrderData';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { DataServiceService } from 'src/app/data-service.service';



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
    customerData;


    customerDetails;
    customerAddress;
    customerSettings;

  constructor(private activeRoute: ActivatedRoute, private fb: FormBuilder, private dataService: DataServiceService) { }
  
  CustomerForm = this.fb.group({
    OrganizationName: ['', Validators.required],//v
    Email: ['', Validators.required], //v
    Phone: (''), //v
    Permission: ['', Validators.required],//v
    Phone1: (''), //v
    userNumber: [{value: '', disabled: true}], //v
    Streetno: (''),//v
    CityName: (''),//v
    Entrance: (''),//v
    ApartmentNo: (''),//v
    StatusId: ('1'),
    MultipassIclientID: (''),
    Tz: ['', Validators.required],//v
    DealerDiscountPercent: (''), //v
    BusinessFile: ('/test.txt') //must to be required Validators.required
});


  id;
  idUnsubscribe;


  ngOnInit() {
    window.scroll(0,0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
      this.id = param['id'];

      let objToApi={
        Token: this.userToken,
        CustomerId: param['id']
      }
      

      this.dataService.GetCustomersByFilter(objToApi).subscribe(result => {
        debugger
        if(typeof result == 'object' && result.obj != null){

          this.customerData = result.obj[0];
          Object.keys(result.obj[0]).forEach(el => {
            if(this.CustomerForm.get(el) != null){
              this.CustomerForm.get(el).setValue(result.obj[0][el]);
            }
          });
        }
      });




      this.customerDetails = {customerId: this.id, companyName: 'multipass', email: 'test@gmail.com', phone: '0504454325', addPhoneNum: '', role: 'עובד', userNum: '1481'};
      this.customerAddress = {city: '', street: '', houseNum: '', appNumber: '', entranceNum: '', floor: '', zCode: ''};
      this.customerSettings = {status: '', idNum: '', comaxCode: '', discount: '', custValDate: ''};

      this.getChartData();
    })

  }


  
  ngOnChanges(changes: SimpleChanges){

  }

  getChartData(){
    this.recOrdersChartData = [
      { data: [1500,2000,1750,9000,500, 250], label: 'ערך הזמנה' }
    ];
    this.recOrdersChartLabels = ['16:12:23 16/03/2021','15:12:23 14/03/2021','13:12:23 13/03/2021','12:12:23 11/03/2021','16:12:23 9/03/2021','16:12:23 6/03/2021'];
  }

  saveForm(){

  }

  ngOnDestroy(){
    this.idUnsubscribe.unsubscribe();
  }

}
