import { Route } from '@angular/compiler/src/core';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-exec-order',
  templateUrl: './exec-order.component.html',
  styleUrls: ['./exec-order.component.css']
})
export class ExecOrderComponent implements OnInit, OnDestroy {

  constructor(private activeRoute: ActivatedRoute) { }
  id;
  idUnsubscribe;

  Orders:any = [
    {orderId: 900000181, orderiDcrm: 12, companyName: 'מולטיפאס', comaxCustomerNumber: 12345, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-01-2021', dateActivation: '24/01/2021 13:44', orderValue: '400.00', orderStatus: 'הזמנה סגורה'},
    {orderId: 900000182, orderiDcrm: 13, companyName: 'test', comaxCustomerNumber: 123456, ticketCount: 4, dateCreation: '24/01/2021 13:24', dateIssue: '24-02-2021', dateActivation: '24/01/2021 13:45', orderValue: '401.00', orderStatus: 'הזמנה סגורה'},
    {orderId: 900000183, orderiDcrm: 14, companyName: 'test name', comaxCustomerNumber: 123458, ticketCount: 4, dateCreation: '24/01/2021 13:25', dateIssue: '24-03-2021', dateActivation: '24/01/2021 13:46', orderValue: '402.00', orderStatus: 'הזמנה סגורה'},
    {orderId: 900000184, orderiDcrm: 15, companyName: 'test company', comaxCustomerNumber: 123457, ticketCount: 4, dateCreation: '24/01/2021 13:26', dateIssue: '24-04-2021', dateActivation: '24/01/2021 13:47', orderValue: '403.00', orderStatus: 'הזמנה סגורה'},
    {orderId: 900000185, orderiDcrm: 16, companyName: 'title company', comaxCustomerNumber: 123459, ticketCount: 4, dateCreation: '24/01/2021 13:27', dateIssue: '24-05-2021', dateActivation: '24/01/2021 13:48', orderValue: '404.00', orderStatus: 'הזמנה סגורה'},
    {orderId: 900000186, orderiDcrm: 17, companyName: 'company name', comaxCustomerNumber: 123450, ticketCount: 4, dateCreation: '24/01/2021 13:28', dateIssue: '24-06-2021', dateActivation: '24/01/2021 13:49', orderValue: '405.00', orderStatus: 'הזמנה סגורה'},
    {orderId: 900000187, orderiDcrm: 18, companyName: 'test', comaxCustomerNumber: 12345, ticketCount: 4, dateCreation: '24/01/2021 13:23', dateIssue: '24-07-2021', dateActivation: '24/01/2021 13:50', orderValue: '406.00', orderStatus: 'הזמנה סגורה'}
  ];

  dataByPage;

  ngOnInit() {
    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
      this.id = param['id'];
      this.dataByPage = this.Orders.filter(el => el['orderId'] == this.id);
    })
  }

  ngOnDestroy(){
    this.idUnsubscribe.unsubscribe();
  }

}
