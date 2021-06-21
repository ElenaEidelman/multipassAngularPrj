import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-order-lines',
  templateUrl: './order-lines.component.html',
  styleUrls: ['./order-lines.component.css']
})
export class OrderLinesComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  faFileExcel = faFileExcel;

  urlParamDestroy;
  userToken :string;
  userId;
  orderId;

  tableSpinner: boolean = false;

  errorMsg: string = '';

  public dataTable = new MatTableDataSource([]);;

  public tabelLabels = [
    {value: 'ItemId', viewValue: "מס''ד"},
    {value: 'CardId', viewValue: 'קוד דיגיטלי'},
    {value: 'DSendName', viewValue: 'שם נמען'},
    {value: 'DSendPhone', viewValue: 'מספר נייד נמען	'},
    {value: 'LoadSum', viewValue: 'סכום טעינה ראשוני		'},
    {value: 'ValidationDate', viewValue: '	תוקף	'},
    {value: 'KindOfLoadSumDesc', viewValue: 'סוג שובר טעינה	'},
    {value: 'DSendLastSent', viewValue: 'נשלח לאחרונה'}
  ];
  tabelLabelsList = ['ItemId','CardId','DSendName','DSendPhone','LoadSum','ValidationDate','KindOfLoadSumDesc','DSendLastSent'];

  constructor(private activeRoute: ActivatedRoute, private dataService: DataServiceService) { }
  ngOnDestroy(): void {
    this.urlParamDestroy.unsubscribe();
  }

  ngOnInit(): void {
    window.scroll(0,0);
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.urlParamDestroy = this.activeRoute.params.subscribe(param => {
      this.userId = param['userId'];
      this.orderId = param['orderId'];

      this.GetCards(this.userId,  this.orderId);
    });
  }

  GetCards(userId, orderId){

    this.tableSpinner = true;

    let objToAPI = {
      Token: this.userToken,
      OrderId: this.orderId,
      userId: this.userId
    }

    // this.dataTable = new MatTableDataSource([
    //   {ItemId:'1',CardId: '2',DSendName: '3', DSendPhone: '4', LoadSum: '5', ValidationDate: '6', KindOfLoadSumDesc: '7', DSendLastSent: '8'}
    // ]);
    this.dataService.GetCardsByOrderId(objToAPI).subscribe(result => {
      this.tableSpinner = false;
      if(typeof result == 'object'){
        this.dataTable.data = result['obj'];

      }
      else{
        alert(result);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataTable.filter = filterValue.trim().toLowerCase();

    if (this.dataTable.paginator) {
      this.dataTable.paginator.firstPage();
    }
  }

  ngAfterViewInit() {
    if(this.dataTable){
      this.dataTable.paginator = this.paginator;
      this.dataTable.sort = this.sort;
    }
  }

  /**
   * "api/InsertUpdateOrder/GetCardsByOrderId"
   * 
   * {
    "Token":"Zbas0buEfdfVPxL-CPGXAHcs3eaxk1rsPqquLmw5GKs1",
    "OrderId":"6215",
    "UserID":"2680"
}
   */
}
