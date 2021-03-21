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


    customerDetails;
    customerAddress;
    customerSettings;

  constructor(private activeRoute: ActivatedRoute, private fb: FormBuilder) { }
  


  id;
  idUnsubscribe;


  ngOnInit() {
    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
      this.id = param['id'];

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

  ngOnDestroy(){
    this.idUnsubscribe.unsubscribe();
  }

}
