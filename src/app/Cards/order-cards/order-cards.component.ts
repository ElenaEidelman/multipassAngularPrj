import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import { faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { debounceTime } from 'rxjs/operators';
import { CustomerData } from 'src/app/Classes/customerData';
import { DataServiceService } from 'src/app/data-service.service';
import {CdkTextareaAutosize} from '@angular/cdk/text-field';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from 'src/app/shared.service';

@Component({
  selector: 'app-order-cards',
  templateUrl: './order-cards.component.html',
  styleUrls: ['./order-cards.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class OrderCardsComponent implements OnInit, OnDestroy {

  // @Input() selectedOrder;
  // @Input() customerId;

  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  @ViewChild('uploadDoc') uploadDoc: ElementRef;


  userDataUnsubscribe;
  customerIDSelected;

  userId;
  userToken;
  indexId;

  selectedCustomer;
  faFileExcel = faFileExcel;
  customers;

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

  manualError: string = '';
  excelFileError: string = '';
  excelSendError: string = '';
  excelCustomerError: string = '';

  fileUplodadeValid: boolean = false;

  excelCardCreatingForm = this.fb.group({
    customer: ['', Validators.required],
    fileDesc: (''),
    file: ('')
  });

  manualCardgroup = this.fb.group({
    selectedCustomerControl: ('')
  });

  loadingCardGroup = this.fb.group({
    selectedCustomerControl: ['', Validators.required],
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
    private sharedService: SharedService) { }


  ngOnInit(): void {

    window.scroll(0, 0);

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    //this.getCustomersData();
    this.getAllCustomers();
    this.userDataUnsubscribe = this.activeRoute.params.subscribe(param => {
      this.userId = param['userId'];
      this.indexId = param['indexId'];

    });

    this.loadingCardGroupChange();
  }

  getAllCustomers() {
    let token = JSON.parse(localStorage.getItem('user'))['Token'];
    let objToApi = {
      Token: token
    }
    this.dataService.GetAllCustomers(objToApi).subscribe(result => {

      if (typeof result == 'string') {
        // this.errorMsg = result;
        setTimeout(() => {
          // this.errorMsg = '';
        }, 5000)
      }
      else {
        if (typeof result == 'object' && result['obj'] != null && result['obj'].length > 0) {
          this.customers = result['obj'];
          if (this.userId != undefined && this.indexId != undefined) {
            this.excelCardCreatingForm.controls['customer'].setValue(this.fillteringUserData(this.userId));
            this.manualCardgroup.controls['selectedCustomerControl'].setValue(this.fillteringUserData(this.userId));
            this.loadingCardGroup.controls['selectedCustomerControl'].setValue(this.fillteringUserData(this.userId));
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

  checkFormValidity() {
    let customerSelectedId = this.manualCardgroup.get('selectedCustomerControl').value.id;
    if (customerSelectedId != undefined) {
      let route = ['/public/newOrder', this.manualCardgroup.get('selectedCustomerControl').value != undefined ? this.manualCardgroup.get('selectedCustomerControl').value['id'] : '-1']
      this.router.navigate(route);
    }
    else {
      this.manualError = 'נא לבחור את הלקוח';
      setTimeout(() => {
        this.manualError = '';
      }, 2000)
    }
  }

  optionChange() {

    this.fileUploadButtonDisabled = false
    // if (this.loadingCardGroup.get('selectedCustomerControl').value) {
    //   this.showHiddenLoadingCardContent = true;
    //   // this.getCardsData();
    //   // this.loadingCardGroup.get('userId').enable();
    // }
  }

  fileOptionChange(event) {
    if(this.excelCardCreatingForm.get('customer').value.id != undefined){
      if (event.target.files.length > 0) {
        const file = event.target.files[0];
        // this.filename = file.name;
  
        // this.excelFileError = 'excel file: ' + file.type.includes('excel');
        // setTimeout(() => {
        //   this.excelFileError = '';
        // }, 2000);
  
        if (!file.type.includes('excel')) {
          this.fileUplodadeValid = false;
        }
        else {
  
          const formData = new FormData();
          formData.append('Token', this.userToken);
          formData.append('UserId', this.excelCardCreatingForm.get('customer').value.id);
          formData.append('OpCode', 'upload');
          formData.append('Description', this.excelCardCreatingForm.get('fileDesc').value);
          formData.append('ExcelFile', file);
  
  
          this.dataService.InsertUpdateOrderByExcel(formData).subscribe(result => {
    
            this.fileUplodadeValid = false;
            if (result['Token'] != undefined || result['Token'] != null) {
            
              //set new token
              let tempObjUser = JSON.parse(localStorage.getItem('user'));
              tempObjUser['Token'] = result['Token'];
              localStorage.setItem('user', JSON.stringify(tempObjUser));
              this.userToken = result['Token'];

              if(result.obj != undefined && Object.keys(result.obj).length > 0){

                  this.fileUplodadeValid = true;
                  this.filename = result.obj[0].NewFileName;
                  let objGetFile = {
                    excelName: this.filename,
                    customerId: this.excelCardCreatingForm.get('customer').value.id,
                    fileData: JSON.stringify(result)
                  }
                  localStorage.setItem('excelFileData', JSON.stringify(objGetFile));
                
              }
              if(result.obj == null && result.errdesc != null && result.errdesc != ''){
                this.excelFileError = result.errdesc;

                setTimeout(() => {
                  this.excelFileError = '';
                }, 2000);
              }
              else if(typeof result == 'string'){
                this.excelFileError = result;
              }
            }
            else{
              this.dialog.open(DialogComponent,{
                data: {message: result.errdesc != undefined ? result.errdesc : result}
              })
              // this.sharedService.exitSystemEvent();
            }
          });
        }
  
      }
    }
    else{
      this.excelCustomerError = 'נא לבחור לקוח';
      setTimeout(()=>{
        this.excelCustomerError = '';
      }, 2000);
    }
  }
  getTemplateExcel(){
    // const blob = new Blob(['../src/assets/Files/Template.xls'], { type: 'text/xls' });
  
    // const url= window.URL.createObjectURL(blob);
    // let file = new File()
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

  getCardsData() {
    this.cardsData = [
      { customerName: 'multipass1', customerId: '11111', cardId: '15245814', dataIssues: '03/01/2021', orderId: '900000025', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass2', customerId: '22222', cardId: '15245815', dataIssues: '03/02/2021', orderId: '900000025', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass3', customerId: '33333', cardId: '15245816', dataIssues: '03/03/2021', orderId: '900000025', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass4', customerId: '44444', cardId: '15245817', dataIssues: '03/04/2021', orderId: '900000028', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass5', customerId: '55555', cardId: '15245818', dataIssues: '03/05/2021', orderId: '900000029', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass6', customerId: '66666', cardId: '15245819', dataIssues: '03/06/2021', orderId: '900000030', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass7', customerId: '77777', cardId: '152458110', dataIssues: '03/07/2021', orderId: '900000031', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass8', customerId: '88888', cardId: '152458111', dataIssues: '03/08/2021', orderId: '900000032', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass9', customerId: '99999', cardId: '152458112', dataIssues: '03/09/2021', orderId: '900000033', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass12', customerId: '12121', cardId: '152458113', dataIssues: '04/01/2021', orderId: '900000034', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass13', customerId: '13131', cardId: '152458114', dataIssues: '05/01/2021', orderId: '900000035', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass14', customerId: '14141', cardId: '15245815', dataIssues: '06/01/2021', orderId: '900000036', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
      { customerName: 'multipass15', customerId: '15151', cardId: '152458116', dataIssues: '07/01/2021', orderId: '900000037', phoneNumber: '0523335611', dataSend: '03/01/2021', balance: '150.00', cardStatus: 'חסום' },
    ];
  }
  loadCard() {
    this.showHiddenLoadingCardContent = false;
  }
  cancelLoadCard() {
    this.showHiddenLoadingCardContent = false;
    this.loadingCardGroup.get('userId').enable();
    this.loadingCardGroup.get('selectedCustomerControl').enable();
  }

  isNumber(val): boolean {
    return typeof val === 'number';
  }

  goToExcelView(){
    ///public/excelView
    if(this.excelCardCreatingForm.valid && this.fileUplodadeValid){
      this.router.navigate(['/public/excelView']);
    }
    else{
        this.excelSendError = 'לא הוזנו כל שדות חובה';
        setTimeout(() => {
          this.excelSendError = '';
        }, 2000)
    }
  }

  resetFileUploaded(){
    alert();
  }

  ngOnDestroy() {
    this.userDataUnsubscribe.unsubscribe();
    // localStorage.setItem('excelFileData', '')
  }
}
