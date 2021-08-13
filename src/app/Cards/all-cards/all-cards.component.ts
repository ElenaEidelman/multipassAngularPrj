import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { catchError } from 'rxjs/operators';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/shared.service';


@Component({
  selector: 'app-all-cards',
  templateUrl: './all-cards.component.html',
  styleUrls: ['./all-cards.component.css']
})
export class AllCardsComponent implements OnInit, AfterViewInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
    //filter table by card status
    statusList = [
      {value: 'all', viewValue: 'הכל'},
      {value: 'active', viewValue: 'פעיל'},
      {value: 'block', viewValue: 'חסום'}
    ];

    
    displayedColumns: string[] = [];

  viewTable: boolean = false;
  spinner: boolean = false;
  userToken;
  userId;
  cardsFilterFormView: boolean = true;
  statusListArr = [];


  constructor(private fb: FormBuilder, private dataService: DataServiceService, private dialog: MatDialog, private sharedService: SharedService) { }


  cardsForm = this.fb.group({
    CardId: (''),
    PhoneNo: (''),
    // Name: (''),
    // CompanyName: (''),
    // Status: (''),
    // OrderId: (''),
    // FromDate: (''),
    // ToDate: (''),
    // userid: (''),
    // tenantid: (''),

    FName: (''),
    LName: (''),
    // // status: (''),
    OrderId: (''),
    FromDate: (''),
    ToDate: (''),
    // CompanyName: (''),
    CustomerId: (''),
    // documentId: (''),
    // byDate: ('dateIssue')
  });

  cardsDataSource = new MatTableDataSource([]);
  public linksListById;

  formErrorMsg: string = '';

  cardsLabelForTable = [
    {value: 'CardId', viewValue: 'מספר שובר'},
    {value: 'CompanyName', viewValue: 'שם לקוח'},
    {value: 'PhoneNo', viewValue: 'מספר טלפון'},
    {value: 'balance', viewValue: 'יתרה'},// no data !!!!
    {value: 'OrderId', viewValue: 'מספר הזמנה'},
    {value: 'CreationDate', viewValue: 'תאריך הנפקה'},
    // {value: 'dataSend', viewValue: 'תאריך שליחה'},
    {value: 'CardStatusDesc', viewValue: 'סטטוס שובר'}
  ];
  ngOnInit(): void {
    window.scroll(0,0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getStatusList();

    this.userId = JSON.parse(localStorage.getItem('user')).obj.Id;
    // this.getCardsFilteredData();
    // this.getFilteredCards();
  }

  getFilteredCards(){
  
    // this.cardsDataSource = new MatTableDataSource([]);
    // this.cardsDataSource.data = [];
    this.viewTable = false;

    // let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let formSearchFiled = false;
    let objToApi = {
      Token: this.userToken
    }
    
    Object.keys(this.cardsForm.value).forEach(val => {
      if(this.cardsForm.get(val).value != '' ){
        formSearchFiled = true;
        objToApi[val] = this.cardsForm.get(val).value;
      }
    })

    if(formSearchFiled){
      this.spinner = true;
    
      debugger
      this.dataService.GetAllCards(objToApi).subscribe(result => {
        debugger
        this.spinner = false;

        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];
  
          if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
            this.createTableData(result['obj']);
          }
          else if(result.obj == null && result.errdesc.includes('No Data Found')){
            this.formErrorMsg = result.errdesc;
            setTimeout(()=>{
              this.formErrorMsg = '';
            },10000);
          }
        }
        else if(typeof result == 'string'){
          this.formErrorMsg = result;
          setTimeout(()=>{
            this.formErrorMsg = '';
          },10000);
        }
        else {
          this.dialog.open(DialogComponent, {
            data: {message: MsgList.exitSystemAlert}
          })
          this.sharedService.exitSystemEvent();
        }
      })
    }

    
    else{
      this.formErrorMsg = 'נא למלא לפחות אחד מהשדות';
      setTimeout(()=>{
        this.formErrorMsg = '';
      },3000);
    }
  }


  createTableData(obj){

    this.createDisplayedColumns(this.cardsLabelForTable);
    this.viewTable = true;
    this.cardsDataSource.data = obj;


  }

  resetForm(){
    this.viewTable = false;

    this.cardsForm.reset();
    this.cardsFilterFormView = false;

    setTimeout(()=> {
      this.cardsFilterFormView = true;
    },0);
  }

  returnHebTranslation(obj,value){
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.unshift(el.value);
    });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.cardsDataSource.filter = filterValue.trim().toLowerCase();

    if (this.cardsDataSource.paginator) {
      this.cardsDataSource.paginator.firstPage();
    }
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
          data: {message: MsgList.exitSystemAlert}
        })
        this.sharedService.exitSystemEvent();
      }
    });


  }

  ngAfterViewInit(): void {
    if (this.cardsDataSource != undefined) {
      this.cardsDataSource.paginator = this.paginator;
      this.cardsDataSource.sort = this.sort;
    }
  }
}
