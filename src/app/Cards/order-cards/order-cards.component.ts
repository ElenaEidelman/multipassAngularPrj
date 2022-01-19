import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { debounceTime } from 'rxjs/operators';
import { CustomerData } from 'src/app/Classes/customerData';
import { DataServiceService } from 'src/app/data-service.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MsgList } from 'src/app/Classes/msgsList';
import { DialogWithTableDataComponent } from './Dialogs/dialog-with-table-data/dialog-with-table-data.component';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';
import { SharedService } from 'src/app/Services/SharedService/shared.service';

@Component({
  selector: 'app-order-cards',
  templateUrl: './order-cards.component.html',
  styleUrls: ['./order-cards.component.css'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('openClose', [
      state('true', style({
        overflow: 'hidden',
        height: '*'
      })),
      state('false', style({
        opacity: '0',
        overflow: 'hidden',
        height: '0px',
      })),
      transition('false <=> true', animate('600ms ease-in-out'))
    ])
  ]
})
export class OrderCardsComponent implements OnInit, OnDestroy {

  // @Input() selectedOrder;
  // @Input() customerId;

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('uploadDoc') uploadDoc: ElementRef;
  @ViewChild('customersSelectExcel') customersSelectExcel: any;
  @ViewChild('customersSelectManual') customersSelectManual: any;

  MsgList = MsgList;

  tabGroups = [
    { index: 0, tabName: 'excelCardCreatingForm' },
    { index: 1, tabName: 'manualCardgroup' },
    { index: 2, tabName: 'loadingCardGroup' },
  ];



  userDataUnsubscribe;
  customerIDSelected;

  userId;
  userToken;
  indexId;

  selectedCustomer;
  faFileExcel = faFileExcel;
  customers = [];

  cardsData = [];
  fileUploadButtonDisabled: boolean = true;

  fromCardCheckedOrderNumber: any;
  toCardCheckedOrderNumber: any;
  toCardError: string;
  fromCardError: string = '';
  showHiddenLoadingCardContent: boolean = false;
  loadingCardUserExist: boolean = false;
  filename;
  excelfileName;
  excelCustomerId;
  fileUploading: boolean = false;

  manualError: string = '';
  excelFileError: string = '';
  excelSendError: string = '';
  // excelCustomerError: string = '';

  fileUplodadeValid: boolean = false;

  excelCardCreatingForm = this.fb.group({
    customer: ['', Validators.required],
    // fileDesc: (''),
    orderDescription: ['', Validators.required],
    file: ['', Validators.required]
  });

  manualCardgroup = this.fb.group({
    customer: ['', Validators.required],
    orderDescription: ['', Validators.required]
  });

  loadingCardGroup = this.fb.group({
    customer: ['', Validators.required],
    userId: [{ value: '', disabled: true }, Validators.required],
    fromCardNumber: ['', { value: '' }, Validators.required],
    toCardNumber: ['', { value: '' }, Validators.required],
    sum: ['', { value: '' }, Validators.required]
  });

  excelCardGroup = this.fb.group({
    customer: ['', Validators.required],
    fileDesc: ['', Validators.required],
    file: ['', Validators.required],

    userId: [{ value: '', disabled: true }, Validators.required],
    fromCardNumber: ['', { value: '' }, Validators.required],
    toCardNumber: ['', { value: '' }, Validators.required],
    sum: ['', { value: '' }, Validators.required]
  });


  constructor(
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private dataService: DataServiceService,
    private router: Router,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private urlSharingService: UrlSharingService) {
    this.sharedService.newCustomerObservable.subscribe(customer => {
      if (customer != '') {
        let createdCustomer = JSON.parse(customer);
        this.userId = createdCustomer['createdCustomer']['id'];

        this.indexId = this.tabGroups.filter(tab => tab.tabName == createdCustomer['form'])[0]['index'];
        this.customersSelectExcel.close();
        this.customersSelectManual.close();
        this.getAllCustomers();
        this.sharedService.newCustomerData.next('');
      }
    })
  }


  ngOnInit(): void {

    window.scroll(0, 0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getAllCustomers();



    let urlParams = this.urlSharingService.messageSource.getValue();
    if (urlParams != '') {
      this.userId = JSON.parse(urlParams)['customerId'];
      this.indexId = JSON.parse(urlParams)['cardId'];
      this.urlSharingService.changeMessage('');
    }


    this.loadingCardGroupChange();
  }


  getAllCustomers() {
    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetAllCustomers(objToApi).subscribe(result => {
      debugger
      if (typeof result == 'string') {
        // this.errorMsg = result;
        setTimeout(() => {
          // this.errorMsg = '';
        }, 5000)
      }
      else if (result.Token == null) {
        // this.dialog.open(DialogComponent, {
        //   data: {message: MsgList.exitSystemAlert}
        // })
        this.sharedService.exitSystemEvent();
      }
      else {
        if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {
          this.customers = result['obj'].sort(function (a, b) {
            if (a.organizationName < b.organizationName) { return -1; }
            if (a.organizationName > b.organizationName) { return 1; }
            return 0;
          });

          this.customers = this.customers.filter(customer => customer.StatusId != 3);
          debugger
          if (this.userId != undefined && this.indexId != undefined) {


            this[this.tabGroups.filter(tab => tab.index == this.indexId)[0]['tabName']].get('customer').setValue(this.fillteringUserData(this.userId));

            // this.excelCardCreatingForm.controls['customer'].setValue(this.fillteringUserData(this.userId));
            // this.manualCardgroup.controls['customer'].setValue(this.fillteringUserData(this.userId));
            // this.loadingCardGroup.controls['customer'].setValue(this.fillteringUserData(this.userId));
          }
          else {
            this.indexId = 0;
          }
        }
        if (typeof result == 'object' && result['obj'] == null) {
          // this.errorMsg = 'No Data Found';
          setTimeout(() => {
            // this.errorMsg = '';
          }, 3000);
        }
      }
    });
  }

  fillteringUserData(userId) {

    return this.customers.filter(customer => customer.id == userId)[0];
  }

  //check manual order
  checkFormValidity() {
    // let customerSelectedId = this.manualCardgroup.get('customer').value.id;
    if (this.manualCardgroup.valid) {

      let Customer = {
        customerId: this.manualCardgroup.get('customer').value != undefined ? this.manualCardgroup.get('customer').value['id'] : '-1',
        orderDescription: this.manualCardgroup.get('orderDescription').value
      }

      this.urlSharingService.changeMessage(JSON.stringify(Customer));
      // let route = ['/public/newOrder', this.manualCardgroup.get('customer').value != undefined ? this.manualCardgroup.get('customer').value['id'] : '-1']
      this.router.navigate(['/public/newOrder']);
    }
    // else {
    //   this.manualError = MsgList.requiredField;
    //   setTimeout(() => {
    //     this.manualError = '';
    //   }, 2000)
    // }
  }


  fileOptionChange(event) {
    if (this.excelCardCreatingForm.get('customer').valid && this.excelCardCreatingForm.get('orderDescription').valid) {
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        if (!file.type.includes('excel') && !file.type.includes('sheet')) {
          this.fileUplodadeValid = false;
          this.dialog.open(DialogComponent, {
            data: {
              title: '',
              subTitle: '',
              message: 'נא להעלות רק קבצי אקסל'
            }
          });
          this.uploadDoc.nativeElement.value = '';
        }
        else {
          this.fileUploading = true;

          const formData = new FormData();
          formData.append('Token', this.userToken);
          formData.append('UserId', this.excelCardCreatingForm.get('customer').value.id);
          formData.append('OpCode', 'upload');
          formData.append('OrderName', this.excelCardCreatingForm.get('orderDescription').value);
          // formData.append('Description', this.excelCardCreatingForm.get('orderDescription').value);
          formData.append('ExcelFile', file);


          debugger
          this.dataService.InsertUpdateOrderByExcel(formData).subscribe(result => {
            debugger

            this.fileUploading = false;
            this.fileUplodadeValid = false;
            if (result['Token'] != undefined || result['Token'] != null) {

              //set new token
              let tempObjUser = JSON.parse(localStorage.getItem('user'));
              tempObjUser['Token'] = result['Token'];
              localStorage.setItem('user', JSON.stringify(tempObjUser));
              this.userToken = result['Token'];

              if (result.err != -1) {
                this.fileUplodadeValid = true;
                this.filename = result.obj[1][0].NewFileName;
                let objGetFile = {
                  excelName: this.filename,
                  customerId: this.excelCardCreatingForm.get('customer').value.id,
                  fileData: JSON.stringify(result),
                  // fileDescription: this.excelCardCreatingForm.get('orderDescription').value
                  OrderName: this.excelCardCreatingForm.get('orderDescription').value

                }
                localStorage.setItem('excelFileData', JSON.stringify(objGetFile));
                this.uploadDoc.nativeElement.value = '';

              }
              if (result.err == -1) {

                //if have missing data in file
                if (result.obj != null && result.obj.length > 0) {
                  let dataOBJ = {};
                  let data_Source = new MatTableDataSource([]);
                  let data = [];
                  let dataLabelsList = ['FirstName', 'LastName', 'Cellular', 'Amount'];

                  result.obj[0].forEach(element => {
                    dataLabelsList.forEach(labels => {
                      dataOBJ[labels] = element[labels]
                    })
                    data.push(dataOBJ);
                  });

                  data_Source.data = data;
                  this.dialog.open(DialogWithTableDataComponent, {
                    maxHeight: '200px',
                    data: {
                      title: result.errdesc,
                      data_Source: data,
                      dataLabelsList: dataLabelsList
                    }
                  });
                }
                else {
                  this.dialog.open(DialogComponent, {
                    data: {
                      title: '',
                      subTitle: '',
                      message: 'קובץ אינו תקין'
                    }
                  })
                }


                this.uploadDoc.nativeElement.value = '';
                this.filename = '';
              }
            }
            else if (typeof result == 'string') {

              this.dialog.open(DialogComponent, {
                data: {
                  title: '',
                  subTitle: '',
                  message: result
                }
              });
              // this.excelFileError = result;
            }
            else {
              this.sharedService.exitSystemEvent();
            }
          });
        }

      }
    }
    else {
      this.excelCardCreatingForm.get('file').setValue('');
      // this.excelCustomerError = 'נא לבחור לקוח';
      // this.uploadDoc.nativeElement.value = '';
      // setTimeout(()=>{
      //   this.excelCustomerError = '';
      // }, 2000);
    }
  }


  loadingCardGroupChange() {

    this.loadingCardGroup.valueChanges.pipe(
      debounceTime(1000)
    ).subscribe(val => {

      //check from card number
      if (val['fromCardNumber'] != '') {
        let card = this.cardsData.filter(el => el['cardId'] == val['fromCardNumber']);
        //this.fromCardCheckedOrderNumber = card.length > 0 ? +card[0]['orderId'] : 'מספר שובר לא תקין';

        if (card.length > 0) {
          this.fromCardCheckedOrderNumber = +card[0]['orderId'];
          this.fromCardError = '';
        }
        else {
          this.fromCardCheckedOrderNumber = '';
          this.fromCardError = 'מספר שובר לא תקין*';
        }

      }
      if (val['fromCardNumber'] == '') {
        this.fromCardCheckedOrderNumber = '';
        this.fromCardError = '';
      }

      //check to card number
      if (val['toCardNumber'] != '') {
        let card = this.cardsData.filter(el => el['cardId'] == val['toCardNumber']);
        //this.toCardCheckedOrderNumber = card.length > 0 ? +card[0]['orderId'] : 'מספר שובר לא תקין';

        if (card.length > 0) {
          this.toCardCheckedOrderNumber = +card[0]['orderId'];
          if (this.fromCardCheckedOrderNumber == '') {
            this.toCardError = '';
          }
          else {
            if (this.toCardCheckedOrderNumber == this.fromCardCheckedOrderNumber) {
              this.toCardError = '';
            }

            else {
              this.toCardError = 'הזמנות אינו זהות*';

            }
          }

        }
        else {
          this.toCardCheckedOrderNumber = '';
          this.toCardError = 'מספר שובר לא תקין*';
        }

      }
      if (val['toCardNumber'] == '') {
        this.toCardCheckedOrderNumber = '';
        this.toCardError = '';
      }
    });
  }


  loadCard() {

    this.showHiddenLoadingCardContent = false;
  }
  cancelLoadCard() {
    this.showHiddenLoadingCardContent = false;
    this.loadingCardGroup.get('userId').enable();
    this.loadingCardGroup.get('customer').enable();
  }

  isNumber(val): boolean {
    return typeof val === 'number';
  }

  goToExcelView() {
    ///public/excelView
    debugger
    if (this.excelCardCreatingForm.valid) {
      debugger
      this.router.navigate(['/public/excelView']);
    }
    else {
      this.excelSendError = 'נא לבחור את הקובץ';
      setTimeout(() => {
        this.excelSendError = '';
      }, 2000)
    }
  }

  // resetFileUploaded() {
  //   alert();
  // }

  openAddCustomerDialog(formName, controllerName) {
    // let customer = JSON.parse('{"id":4000,"FName":"eeee","LName":"eeeeee","Email":"ee989899@ddde.com","organizationName":"tet444te","Password":null,"Phone":"0523385694","Phone1":null,"role":"מנהל באק אופיס","fileName":"/test.txt","businessValidDate":"1753-01-01T00:00:00","Address":"","Streetno":null,"ApartmentNo":null,"entrance":null,"floor":null,"CityId":0,"CityName":null,"AreaId":0,"ZIP":null,"Address2":null,"CityId2":0,"CityName2":null,"ZIP2":null,"AreaId2":0,"UserType":6,"Tz":"332232","contactof":0,"NameInSite":null,"Fax":null,"StatusId":2,"ClubType":0,"AcceptNewsLetter":0,"ExternalId":0,"Logo":null,"image":null,"DealerItemPriceListId":0,"DealerCredit":0,"DealerContactInYbitanb2b":0,"DealerPaymentCondition":"0","DealerDiscountPercent":0,"Website":null,"Latitude":0,"Longitude":0,"Priority":0,"ShowInSite":0,"SEO_H1Title":null,"SEO_KeyWords":null,"SEO_Description":null,"PosNo":0,"LastPassUpdated":"2020-12-22T14:54:57.62","CreationDate":"2021-12-22T14:54:57.62","Tenant":1006,"MltpId":0,"OrdersCount":null,"LastOrderDate":null,"LastOrderTotal":null,"LastOrderId":null,"StatusDescription":"פעיל"}')
    // 
    // this.customers.push(customer);
    // // this[formName].get(controllerName).setValue(customer);

    // setTimeout(() => {
    //   this.excelCardCreatingForm.controls['customer'].setValue(customer);


    //   this.excelCardCreatingForm.updateValueAndValidity();
    //   this.customersSelectExcel.close();
    // }, 0);

    this.dialog.open(AddCustomerDialogComponent, {
      data: { data: 'test', form: formName, controller: controllerName }
    }).afterClosed().subscribe(result => {
      // 
      // this.ngOnInit();
      this.getAllCustomers();
    });
  }

  ngOnDestroy() {
    // this.userDataUnsubscribe.unsubscribe();
    // localStorage.setItem('excelFileData', '')
  }
}






// add new customer dialog
@Component({
  selector: 'dialog-addNewCust',
  templateUrl: './addNewCustomerDialog.html',
  styleUrls: ['./addNewCustomerStyle.css'],
})
export class AddCustomerDialogComponent implements OnInit {

  IfComponentDialog: boolean = true;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<AddCustomerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private route: Router
  ) {
  }



  ngOnInit(): void {

  }


  dialogClose() {
    this.dialogRef.close();
  }
}