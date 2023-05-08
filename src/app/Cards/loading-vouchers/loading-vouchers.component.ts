import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { debounceTime } from 'rxjs/operators';
import { DataServiceService } from 'src/app/data-service.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MsgList } from 'src/app/Classes/msgsList';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UrlSharingService } from 'src/app/Services/UrlSharingService/url-sharing.service';
import { SharedService } from 'src/app/Services/SharedService/shared.service';
import { MockData } from 'src/app/Classes/mockData';
import { DialogWithTableDataComponent } from '../order-cards/Dialogs/dialog-with-table-data/dialog-with-table-data.component';
import { AddCustomerDialogComponent } from '../order-cards/order-cards.component';
import { OrderType } from 'src/app/Classes/OrderTypes';
import { TableDialogComponent } from 'src/app/PopUps/GlobalTableDialog/table-dialog/table-dialog.component';

@Component({
  selector: 'app-loading-vouchers',
  templateUrl: './loading-vouchers.component.html',
  styleUrls: ['./loading-vouchers.component.css'],
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
export class LoadingVouchersComponent implements OnInit {

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('uploadDoc') uploadDoc: ElementRef;
  @ViewChild('customersSelectExcel') customersSelectExcel: any;
  @ViewChild('customersSelectManual') customersSelectManual: any;

  MsgList = MsgList;
  OrderType = OrderType;
  MockData = MockData;

  tabGroups = [
    { index: 0, tabName: 'excelCardCreatingForm' },
    { index: 1, tabName: 'manualCardgroup' },
    { index: 2, tabName: 'loadingCardGroup' },
  ];


  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }

  userDataUnsubscribe;
  customerIDSelected;

  userId;
  userToken;
  indexId;

  selectedCustomer;
  faFileExcel = faFileExcel;
  customers = [];
  customersSpare = [];

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
  policyList;
  // excelCustomerError: string = '';

  fileUplodadeValid: boolean = false;

  excelCardCreatingForm = this.fb.group({
    customer: ['', Validators.required],
    // fileDesc: (''),
    orderDescription: ['', [Validators.required, this.noWhitespaceValidator]],
    file: ['', Validators.required],
    searchCustomer: [''],
    // policySelectExcel: ['']
  });

  manualCardgroup = this.fb.group({
    customer: ['', Validators.required],
    orderDescription: ['', [Validators.required, this.noWhitespaceValidator]],
    searchCustomer: [''],
    // policySelectManual: ['']
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
    ////debugger
    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));
    this.sharedService.pagesAccessLevel.next('');
    if (this.pagePermissionAccessLevel.AccessLevel == this.MockData.accessLevelReadOnly) {
      this.manualCardgroup.disable();
      this.excelCardCreatingForm.disable();
    }


    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.getAllCustomers();
    this.GetPoliciesByCompanyId();



    let urlParams = this.urlSharingService.messageSource.getValue();
    if (urlParams != '') {
      this.userId = JSON.parse(urlParams)['customerId'];
      this.indexId = JSON.parse(urlParams)['cardId'];
      this.urlSharingService.changeMessage('');
    }


    this.loadingCardGroupChange();
  }

  GetPoliciesByCompanyId() {

    let objToApi = {
      Token: this.userToken
    }

    //debugger
    this.dataService.GetPoliciesByCompanyId(objToApi).subscribe(result => {
      //debugger
      if (typeof result == 'string') {
        // this.sharedService.exitSystemEvent(result);
        return false;
      }
      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      if (result['obj'] != null) {
        this.policyList = result['obj'];
        if (this.policyList.length > 0) {
          // this.manualCardgroup.get('policySelectManual').setValidators(Validators.required);
          // this.excelCardCreatingForm.get('policySelectExcel').setValidators(Validators.required);
        }

      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
      }

    })
  }


  getAllCustomers() {
    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetAllCustomers(objToApi).subscribe(result => {
      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        this.sharedService.exitSystemEvent(result);
        return false;
      }

      // if (typeof result == 'string') {
      //   // this.errorMsg = result;
      //   setTimeout(() => {
      //     // this.errorMsg = '';
      //   }, 5000)
      // }
      // else if (result.Token == null) {
      //   // this.dialog.open(DialogComponent, {
      //   //   data: {message: MsgList.exitSystemAlert}
      //   // })
      //   this.sharedService.exitSystemEvent();
      // }
      // else {
      // if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {
      this.customers = result['obj'].sort(function (a, b) {
        if (a.organizationName < b.organizationName) { return -1; }
        if (a.organizationName > b.organizationName) { return 1; }
        return 0;
      });

      this.customers = this.customers.filter(customer => customer.StatusId != 3);
      this.customersSpare = this.customers.filter(customer => customer.StatusId != 3);


      if (this.userId != undefined && this.indexId != undefined) {
        this[this.tabGroups.filter(tab => tab.index == this.indexId)[0]['tabName']].get('customer').setValue(this.fillteringUserData(this.userId));
      }
      else {
        this.indexId = 0;
      }
      // }
      // if (typeof result == 'object' && result['obj'] == null) {
      //   // this.errorMsg = 'No Data Found';
      //   setTimeout(() => {
      //     // this.errorMsg = '';
      //   }, 3000);
      // }
      // }
    });
  }

  fillteringUserData(userId) {

    return this.customers.filter(customer => customer.id == userId)[0];
  }

  //check manual order
  checkFormValidity() {
    if (this.manualCardgroup.valid) {

      let Customer = {
        customerId: this.manualCardgroup.get('customer').value != undefined ? this.manualCardgroup.get('customer').value['id'] : '-1',
        orderDescription: this.manualCardgroup.get('orderDescription').value,
        // policy: this.manualCardgroup.get('policySelectManual').value
      }
      //debugger
      this.urlSharingService.changeMessage(JSON.stringify(Customer));
      this.urlSharingService.changeOrderType(this.OrderType.LoadingVouchersManually);
      // let route = ['/public/newOrder', this.manualCardgroup.get('customer').value != undefined ? this.manualCardgroup.get('customer').value['id'] : '-1']
      this.router.navigate(['/public/newOrder']);
    }
  }


  fileOptionChange(event) {
    //&& this.excelCardCreatingForm.get('policySelectExcel').valid
    // //debugger

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
        ////debugger
        this.fileUploading = true;

        const formData = new FormData();
        formData.append('Token', this.userToken);
        formData.append('UserId', this.excelCardCreatingForm.get('customer').value.id);
        formData.append('OpCode', 'upload');
        formData.append('OrderName', this.excelCardCreatingForm.get('orderDescription').value);//?
        // formData.append('Description', this.excelCardCreatingForm.get('orderDescription').value);
        formData.append('ExcelFile', file);
        // formData.append('Policy', this.excelCardCreatingForm.get('policySelectExcel').value);

        //this.dataService.LoadVouchersByExcelFile
        this.dataService.InsertUpdateBatchOrder(formData).subscribe(result => {
          debugger
          this.fileUploading = false;
          if (typeof result == 'string') {
            this.sharedService.exitSystemEvent(result);
            return false;
          }

          if (result.err < 0 && result.obj == null) {
            this.dialog.open(DialogComponent, {
              data: { message: result.errdesc }
            })
            return false;
          }


          this.fileUplodadeValid = false;
          if (result['Token'] != undefined || result['Token'] != null) {

            //set new token
            let tempObjUser = JSON.parse(localStorage.getItem('user'));
            tempObjUser['Token'] = result['Token'];
            localStorage.setItem('user', JSON.stringify(tempObjUser));
            this.userToken = result['Token'];

            if (result.err >= 0) {
              this.fileUplodadeValid = true;
              //debugger
              this.filename = result.obj[1][0].NewFileName;

              let objGetFile = {
                excelName: this.filename,
                customerId: this.excelCardCreatingForm.get('customer').value.id,
                fileData: JSON.stringify(result),
                // fileDescription: this.excelCardCreatingForm.get('orderDescription').value
                OrderName: this.excelCardCreatingForm.get('orderDescription').value,
                // Policy: this.excelCardCreatingForm.get('policySelectExcel').value
              }

              localStorage.setItem('OrderType', OrderType.LoadingVoucherByExcel);
              localStorage.setItem('excelFileData', JSON.stringify(objGetFile));
              this.uploadDoc.nativeElement.value = '';

            }
            else {

              //if have missing data in file


              if (result.obj != null && result.obj.length > 0) {
                let dataOBJ = {};
                let data_Source = new MatTableDataSource([]);
                let data = [];
                let dataLabelsList = ['מספר תו', 'שם פרטי', 'שם משפחה', 'סכום', 'טלפון סלולרי', 'הערה'];

                //debugger
                result.obj.forEach(element => {
                  //debugger
                  dataLabelsList.forEach(labels => {
                    //debugger
                    if (labels == 'הערה') {
                      //let errMsg = temMsg.includes("+") ? ([...new Set(((temMsg).split('+')).filter(n => n != ' ').map(n => n.trim()))]).join('\r\n') : temMsg;
                      // debugger
                      dataOBJ[labels] = element['ErrorMsg'].replaceAll('+', '').replaceAll('OK', '').trim();
                    }
                    else {
                      dataOBJ[labels] = element[labels]
                    }

                  })
                  data.push(dataOBJ);
                  dataOBJ = {};
                });

                // debugger
                data_Source.data = data;
                debugger
                this.dialog.open(TableDialogComponent, {
                  maxHeight: '200px',
                  data: {
                    title: result.errdesc,
                    data_Source: data,
                    dataLabelsList: dataLabelsList
                  }
                });
              }
              // else {
              //   let err = ([...new Set(((result.errdesc).split('+')).filter(n => n != ' ').map(n => n.trim()))]).join('\r\n');
              //   //debugger
              //   this.dialog.open(DialogComponent, {
              //     data: {
              //       title: '',
              //       subTitle: err,
              //       message: 'קובץ אינו תקין'
              //     }
              //   })
              // }


              this.uploadDoc.nativeElement.value = '';
              this.filename = '';
            }
          }
          else if (typeof result == 'string') {

            // this.excelFileError = result;
          }
          else {
            this.sharedService.exitSystemEvent();
          }
        });
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
        //this.fromCardCheckedOrderNumber = card.length > 0 ? +card[0]['orderId'] : 'מספר תו לא תקין';

        if (card.length > 0) {
          this.fromCardCheckedOrderNumber = +card[0]['orderId'];
          this.fromCardError = '';
        }
        else {
          this.fromCardCheckedOrderNumber = '';
          this.fromCardError = 'מספר תו לא תקין*';
        }

      }
      if (val['fromCardNumber'] == '') {
        this.fromCardCheckedOrderNumber = '';
        this.fromCardError = '';
      }

      //check to card number
      if (val['toCardNumber'] != '') {
        let card = this.cardsData.filter(el => el['cardId'] == val['toCardNumber']);
        //this.toCardCheckedOrderNumber = card.length > 0 ? +card[0]['orderId'] : 'מספר תו לא תקין';

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
          this.toCardError = 'מספר תו לא תקין*';
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

    if (this.excelCardCreatingForm.valid) {

      this.router.navigate(['/public/excelView']);
    }
    else {
      this.excelSendError = 'נא לבחור את הקובץ';
      setTimeout(() => {
        this.excelSendError = '';
      }, 2000)
    }
  }

  openAddCustomerDialog(formName, controllerName) {
    this.dialog.open(AddCustomerDialogComponent, {
      data: { data: 'test', form: formName, controller: controllerName }
    }).afterClosed().subscribe(result => {
      this.getAllCustomers();
    });
  }

  ngOnDestroy() {
    // this.userDataUnsubscribe.unsubscribe();
    // localStorage.setItem('excelFileData', '')
  }

  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }


  searchChange(event) {
    this.customersSpare = JSON.parse(JSON.stringify(this.customers));

    this.customersSpare = this.customers.filter(customer => {
      if (customer.organizationName.toLowerCase().includes(event.toLowerCase())) {
        return customer;
      }
    });
  }


  selectedTabChange(event) {
    if (event.tab.position == 0) {
      this.excelCardCreatingForm.get('searchCustomer').setValue('');
    }
    else if (event.tab.position == 1) {
      this.manualCardgroup.get('searchCustomer').setValue('');
    }

    this.customersSpare = JSON.parse(JSON.stringify(this.customers));
  }
}
