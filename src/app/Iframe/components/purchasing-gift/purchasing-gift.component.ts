import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { DOCUMENT } from '@angular/common';
import { MatTabGroup } from '@angular/material/tabs';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';
import { IframeSeviceService } from 'src/app/Services/IframeService/iframe-sevice.service';
import { PopupDialogComponent } from '../../Dialogs/popupDialog/popup-dialog/popup-dialog.component';
import { IframeSharingServiceService } from 'src/app/Services/IframeService/iframe-sharing-service.service';
import { MsgList } from 'src/app/Classes/msgsList';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';


/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}



@Component({
  selector: 'app-purchasing-gift',
  templateUrl: './purchasing-gift.component.html',
  styleUrls: ['./purchasing-gift.component.css'],
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
      transition('false <=> true', animate('400ms ease-in-out'))
    ]),
    trigger('slideInOut', [
      state('true', style({ transform: 'translateY(-100%)', overflow: 'hidden' })),
      state('false', style({})),
      transition('true => false', animate('400ms ease-in', style({ transform: 'translateY(0%)' }))),
      transition('false => true', animate('400ms ease-in', style({ transform: 'translateY(-100%)' })))
    ])
  ]
})
export class PurchasingGiftComponent implements OnInit, OnDestroy, AfterViewInit {
  //4580458045804580
  @ViewChild("GiftToWhoTabs") GiftToWhoTabs: MatTabGroup;
  @ViewChild("uploadDoc") uploadDoc: ElementRef;

  // giftCardImgSpare = localStorage.getItem('GiftCardPic') == '' ? '../../../assets/img/simg.jpg' : localStorage.getItem('GiftCardPic');;
  // giftCardImg: string = localStorage.getItem('GiftCardPic') == '' ? '../../../assets/img/simg.jpg' : localStorage.getItem('GiftCardPic');
  giftCardImgSpare;
  giftCardImg;


  constructor(
    private activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private dataService: IframeSeviceService,
    private route: Router,
    private sharingIframeService: IframeSharingServiceService,
    private getDataService: DataServiceService,
    @Inject(DOCUMENT) private document: Document) { }


  ngAfterViewInit(): void {
    this.colorMatStepHorizontalLine(this.selectedIndex);
  }



  picSizeInMega;
  destroyActivateR;
  minDate = new Date();
  minAmount;

  spinner: boolean = false;
  isEditable = false;
  viewChangeSum: boolean = false;
  navigateToPayment: boolean = false;
  orderId;



  selectedSum = 0;

  blessingTextView: boolean = true;
  blessingList;
  blessingFilteredList;
  blessingTextCurrentStep: number = 1;
  formError: string = '';
  companyName: string = '';

  addVideoImgError: string = '';
  selectedIndex = 0;

  openCloseTimeDateSendGift: boolean = false;
  ifSendOptionNotChoosed: boolean = false;

  videosList;

  imgVideoAddedList = [];

  smsOption: boolean = false;
  emailOption: boolean = false;
  printOption: boolean = false;

  companyId;


  // presentSum;
  // firstForm = 'FirstFormGroup';
  // secondForm;
  // thirdForm;

  checkForms;
  saveSumError: string = '';
  companyInfo;


  FormSelected: string = 'FirstFormGroup';
  MsgList = MsgList;


  presentSumControl = new FormControl('');

  FormsArray = this.fb.group({
    FirstFormGroup: this.fb.group({
      name: ['', Validators.required],
      celebrating: ['', Validators.required],
      blessingText: ['', [Validators.required, Validators.max(10)]],
      imgVideo: [''],
      imgsSrc: [''],
      B2C_IsForFriend: ('1')
    }),
    noForm: (''),
    SecondFormGroup: this.fb.group({
      phoneNumber: (['', Validators.pattern('[[0][5][0-9]{8}]*')]),
      email: ['', Validators.email],
      printFieldHidden: (''),
      dateOptionOfSend: ('1'),
      PayFName: ['', Validators.required],
      phoneSender: ['', [Validators.required, Validators.pattern('[[0][5][0-9]{8}]*')]],
      mailSender: ['', [Validators.required, Validators.email]],
      dateTimeData: this.fb.group({
        date: [new Date(), Validators.required],
        time: [new Date().getHours() + ':' + new Date().getMinutes(), Validators.required]
      })
    })
  },
    { updateOn: "blur" });


  ngOnInit() {

    window.scroll(0, 0);
    this.activateRoute.queryParams.subscribe(result => {

      if (Object.keys(result).indexOf('orderid') != -1) {
        this.orderId = result['orderid'];
        this.selectedIndex = 2;
        // this.colorMatStepHorizontalLine(this.selectedIndex);

      }
      else {

      }
    })


    this.picSizeInMega = localStorage.getItem('picSizeInMega');
    this.companyInfo = this.sharingIframeService.companyInfoService.value != '' ? JSON.parse(this.sharingIframeService.companyInfoService.value) : this.sharingIframeService.companyInfoService.value;
    this.companyId = this.sharingIframeService.companyId.getValue();
    this.getIframeCompanyInfo();

    this.destroyActivateR = this.activateRoute.params.subscribe(param => {

      this.dataService.getHost().subscribe(result => {

        this.minAmount = result['minAmount'];
        if (+param['sum'] >= +this.minAmount) {
          this.presentSumControl.setValue(+param['sum']);
          this.selectedSum = +param['sum'];
        }
        else {
          this.presentSumControl.setValue(this.minAmount);
          this.selectedSum = this.minAmount;
        }

        this.presentSumControl.setValidators([Validators.required, Validators.min(this.minAmount)])
      })
    });
    this.getBlessingList();

    this.getVideosList();


  }


  ngOnDestroy() {
    this.destroyActivateR.unsubscribe();
  }

  getIframeCompanyInfo() {
    let objToApi = {
      CompanyIdEnc: this.companyId
    }

    this.dataService.GetIFrameCompanyInfo(objToApi).subscribe(result => {
      if (result.obj != undefined && result.obj != null && result.err != -1) {
        // this.sharingIframeService.companyInfoService.next(JSON.stringify(result));
        this.giftCardImgSpare = result.obj[0]['GiftCardPic'];
        this.giftCardImg = result.obj[0]['GiftCardPic'];
        this.companyName = result.obj[0]['CompanyName'];
      }
    })
  }

  getBlessingList() {



    let objToApi = {
      TenantId: this.companyInfo['obj'][0]['CompanyId']
    }




    this.dataService.GetBlessings(objToApi).subscribe(result => {


      if (typeof result == 'object') {
        if (result.err != -1) {
          this.blessingList = result.obj;
        }
        else {
          this.dialog.open(PopupDialogComponent, {
            data: { title: '', text: result.errdesc }
          })
        }
      }
      else {
        this.dialog.open(PopupDialogComponent, {
          data: { title: '', text: result }
        })
      }
    });
    // this.FormGroup.get('celebrating').setValue(this.blessingList[0].title);
    // this.FormGroup.get('celebrating').setValue(this.blessingList[0].title);
  }

  getVideosList() {
    this.videosList = [
      {
        title: 'יום הולדת', videos: [
          'assets/videos/videoExmp.mp4',
          'assets/videos/videoExmp.mp4',
          'assets/videos/videoExmp.mp4',
          'assets/videos/videoExmp.mp4']
      },
      {
        title: 'לידה', videos: [
          'assets/videos/videoExmp.mp4',
          'assets/videos/videoExmp.mp4']
      },
      {
        title: 'תודה', videos: [
          'assets/videos/videoExmp.mp4',
          'assets/videos/videoExmp.mp4',
          'assets/videos/videoExmp.mp4']
      },
    ];
  }

  changeSum() {
    this.viewChangeSum = true;
  }
  saveChangedSum() {
    if (this.presentSumControl.valid) {
      this.presentSumControl.setValue(this.presentSumControl.value);
      this.selectedSum = this.presentSumControl.value;
      this.viewChangeSum = false;
    }
  }
  cancelChangedSum() {
    this.presentSumControl.setValue(this.selectedSum);
    this.viewChangeSum = false;

  }

  celebratingChanged(event) {
    this.blessingTextCurrentStep = 1;

    let objToApi = {
      TenantId: this.companyInfo['obj'][0]['CompanyId'],
      SubjectId: event.value
    }
    this.dataService.GetBlessings(objToApi).subscribe(result => {
      if (typeof result == 'object') {
        if (result.err != -1) {
          // this.blessingList = result.obj;

          this.blessingFilteredList = result.obj;
          this.FormsArray.get('FirstFormGroup').get('blessingText').setValue(this.blessingFilteredList[0].Blessing);
        }
        else {
          this.dialog.open(PopupDialogComponent, {
            data: { title: '', text: result.errdesc }
          })
        }
      }
      else {
        this.dialog.open(PopupDialogComponent, {
          data: { title: '', text: result }
        })
      }
      // this.blessingList = result['obj'];
    });
  }

  //steps of textarea
  stepBefore() {
    this.blessingTextView = !this.blessingTextView;
    if (this.blessingTextCurrentStep == 1) {
      this.blessingTextCurrentStep = this.blessingFilteredList.length;

    }
    else {
      this.blessingTextCurrentStep--;
    }
    this.FormsArray.get('FirstFormGroup').get('blessingText').setValue(this.blessingFilteredList[this.blessingTextCurrentStep - 1].Blessing);

  }

  stepNext() {
    this.blessingTextView = !this.blessingTextView;
    if (this.blessingTextCurrentStep == this.blessingFilteredList.length) {
      this.blessingTextCurrentStep = 1;
    }
    else {
      this.blessingTextCurrentStep++;
    }
    this.FormsArray.get('FirstFormGroup').get('blessingText').setValue(this.blessingFilteredList[this.blessingTextCurrentStep - 1].Blessing);
  }

  //end steps of textare

  clearBlessingTA() {
    this.FormsArray.get('FirstFormGroup').get('blessingText').setValue('');
  }

  fileUploadFunc(event) {
    //באפשרותך לעלות רק קבצים מסוג: mp4, mov, qt, jpg ,jpeg, png


    //get image
    ///assets/images/B2COrderImage/newnamefromdhwani

    const file = event.target.files[0];
    const imgSizeFrobMbToByte = this.picSizeInMega * Math.pow(1024, 2);

    if (file.size <= imgSizeFrobMbToByte) {//<= imgSizeFrobMbToByte
      let format: string;
      let imageSrc: string;


      if (file.type.indexOf('image') > -1) {
        this.spinner = true;
        if (this.sharingIframeService.iframeCalledFromMultitav.value == 'false') {
          format = 'image';

          let objToApi = new FormData();
          objToApi.append('uploadedFile', file);



          this.dataService.SavePicForGreeting(objToApi).subscribe(result => {

            this.spinner = false;
            if (typeof result.obj == 'string' && result.obj.length > 0) {

              this.FormsArray.get('FirstFormGroup').get('imgsSrc').setValue(result.obj);

              //preview img
              const reader = new FileReader();
              reader.readAsDataURL(file);
              reader.onload = () => {
                imageSrc = reader.result as string;
                // this.giftCardImg = imageSrc;
                // this.imgVideoAddedList.push({ format: format, src: imageSrc });

                this.imgVideoAddedList[0] = { format: format, src: imageSrc };
              };
            }
            else if (typeof result == 'string') {
              this.dialog.open(PopupDialogComponent, {
                width: '330px',
                // height: '400px',
                data: { title: '', text: result }
              })
            }
            else {
              this.dialog.open(PopupDialogComponent, {
                width: '330px',
                // height: '400px',
                data: { title: '', text: result.errdesc }
              })


              //alert(result.errdesc);
            }
          })
        }
        else {
          format = 'image';
          this.spinner = false;
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            imageSrc = reader.result as string;
            // this.giftCardImg = imageSrc;
            // this.imgVideoAddedList.push({ format: format, src: imageSrc });

            this.imgVideoAddedList[0] = { format: format, src: imageSrc };
          };
        }

      }
      else if (file.type.indexOf('video') > -1) {
        this.spinner = true;
        format = 'video';
      }
      else {
        this.dialog.open(PopupDialogComponent, {
          data: { title: '', text: ' באפשרותך לעלות רק קבצים מסוג: jpg ,jpeg, png ' }
        })
      }

      this.uploadDoc.nativeElement.value = '';

      // if (format == 'video' && this.imgVideoAddedList.filter(el => el.format == 'video').length > 0) {
      //   this.addVideoImgError = 'ניתן לבחור סרטון אחד';
      //   setTimeout(() => {
      //     this.addVideoImgError = '';
      //   }, 2000);
      // }
      // else {
      //   reader.onload = (event) => {
      //     //preview
      //     imageSrc = reader.result as string;
      //     this.imgVideoAddedList.push({ format: format, src: imageSrc });
      //   }
      // }
    }
    else {
      this.dialog.open(PopupDialogComponent, {
        data: { title: '', text: ' ניתן להעלות תמונה עד ' + this.picSizeInMega + ' MB' }
      })
    }
  }

  deleteAddedItems(items, index) {
    this.giftCardImg = this.giftCardImgSpare;
    this.FormsArray.get('FirstFormGroup').get('imgsSrc').setValue('')
    let newArr = this.imgVideoAddedList.filter((el, i) => i != index);
    this.imgVideoAddedList = newArr;

  }

  openVideoDialog() {
    if (this.imgVideoAddedList.filter(el => el.format == 'video').length > 0) {
      this.addVideoImgError = 'ניתן לבחור סרטון אחד';

      setTimeout(() => {
        this.addVideoImgError = '';
      }, 2000);
    }
    else {
      this.dialog.open(VideosDialogComponent, {
        width: "700px",
        data: { videosDataObj: this.videosList }
      }).afterClosed().subscribe(result => {
        // this.imgVideoAddedList.push({ format: 'video', src: result.result.video });
      });
    }

  }

  tabChanged(event, stepper) {

    this.FormsArray.get('FirstFormGroup').get('B2C_IsForFriend').setValue(event.index == 0 ? 1 : 0);
    if (event.index + 1 == 2) {
      stepper.next();
    }

    let tab = [{ index: 0, textLabel: 'FirstFormGroup' }, { index: 1, textLabel: 'noForm' }];
    this.FormSelected = tab.filter(el => el.index == event.index)[0]['textLabel'];


  }

  stepChanged(event, stepper) {
    stepper.selected.interacted = false;
  }

  largePreview(src, format) {
    this.dialog.open(VideoImageDialogComponent, {
      data: { format: format, src: src }
    }).afterClosed().subscribe(result => {
      if (result.result.video == 'changeVideo') {
        let newImgVideoAddedList = this.imgVideoAddedList.filter(el => el.format != 'video');
        this.imgVideoAddedList = newImgVideoAddedList;
        this.dialog.open(VideosDialogComponent, {
          width: "700px",
          data: { videosDataObj: this.videosList }
        }).afterClosed().subscribe(result => {
          // this.imgVideoAddedList.push({ format: 'video', src: result.result.video });
        });
      }
    });
  }

  openSendingOption(option) {
    if (option == 'emailOption') {
      this.FormsArray.get('SecondFormGroup').get('email').setValue('');
    }
    else if (option == 'smsOption') {
      this.FormsArray.get('SecondFormGroup').get('phoneNumber').setValue('');
    }

    this[option] = !this[option];
  }


  //next step of creating blessing
  nextStep(stepper: MatStepper) {

    // stepper.selectedIndex = 2;
    // 
    if (!this.viewChangeSum) {
      this.selectedIndex = stepper.selectedIndex;

      this.colorMatStepHorizontalLine(stepper.selectedIndex + 1);

      //to who send gift card stepper
      if (this.selectedIndex == 0) {
        if (this.FormsArray.get(this.FormSelected).valid) {
          stepper.next();
        }
        else {
          this.formError = 'נא למלא שדות חובה';
          setTimeout(() => {
            this.formError = '';
          }, 2000);
        }
      }

      //how to send, stepper and navigate to payment
      if (this.selectedIndex == 1) {
        //check second form

        //check if phone number or email of addressee
        let phoneN = this.FormsArray.get('SecondFormGroup').get('phoneNumber').value;
        let email = this.FormsArray.get('SecondFormGroup').get('email').value;
        debugger

        if (phoneN == '' && email == '') {
          this.ifSendOptionNotChoosed = true;
          this.formError = 'נא לבחור דרך אחת לפחות לשליחת מתנה';

          setTimeout(() => {
            this.formError = '';
          }, 2000)
        }
        else if (!this.FormsArray.get('SecondFormGroup').valid) {
          this.formError = 'נא למלא את כל שדות חובה';

          setTimeout(() => {
            this.formError = '';
          }, 2000)
        }

        else {
          if (this.sharingIframeService.iframeCalledFromMultitav.value == 'false') {
            this.InsertUpdateB2COrder();
          }
          else {
            this.dialog.open(DialogComponent, {
              data: { message: 'לא ניתן לעבור לדף תשלום, דף זה רק לתצוגה' }
            })
          }
        }
      }

    }
    else {
      this.saveSumError = 'נא לשמור את הסכום*';

      setTimeout(() => {
        this.saveSumError = '';
      }, 3000);
    }
  }

  prevStep(stepper: MatStepper) {
    if (!this.viewChangeSum) {

      //set active to first tab
      const tabGroup = this.GiftToWhoTabs;
      if (!tabGroup || !(tabGroup instanceof MatTabGroup)) return;
      const tabCount = tabGroup._tabs.length;
      tabGroup.selectedIndex = (tabGroup.selectedIndex + 1) % tabCount;

      stepper.previous();
    }
    else {
      this.saveSumError = 'נא לשמור את הסכום*';

      setTimeout(() => {
        this.saveSumError = '';
      }, 3000);
    }
  }


  InsertUpdateB2COrder() {
    this.spinner = true;
    this.navigateToPayment = true;
    this.document.getElementById('goToPaymentButton')['disabled'] = true;

    let dateToSendGift = new Date(this.FormsArray.get('SecondFormGroup').get('dateTimeData').get('date').value);
    dateToSendGift.setHours(this.FormsArray.get('SecondFormGroup').get('dateTimeData').get('time').value.split(':')[0])
    dateToSendGift.setMinutes(this.FormsArray.get('SecondFormGroup').get('dateTimeData').get('time').value.split(':')[1])

    //convert date to mm/dd/yyyy
    let newDate = new Date(dateToSendGift);
    let day = newDate.getDate() < 10 ? '0' + newDate.getDate() : newDate.getDate();
    let month = (newDate.getMonth() + 1) < 10 ? '0' + (newDate.getMonth() + 1) : (newDate.getMonth() + 1);
    let year = newDate.getFullYear();
    let hour = newDate.getHours();
    let minute = newDate.getMinutes();


    //this.FormsArray.get('FirstFormGroup').get('name').value
    let objToApi = {
      B2CThoWho: this.FormsArray.get('FirstFormGroup').get('name').value,
      PayFName: this.FormsArray.get('SecondFormGroup').get('PayFName').value,
      PayLName: "",
      companyidenc: this.companyId,
      // Email: this.FormsArray.get('SecondFormGroup').get('email').value,
      // CompanyId: "1006",
      B2C_Email: this.FormsArray.get('SecondFormGroup').get('email').value,
      B2C_Mobile: this.FormsArray.get('SecondFormGroup').get('phoneNumber').value,
      B2C_IsForFriend: +this.FormsArray.get('FirstFormGroup').get('B2C_IsForFriend').value,
      LoadAmount: this.presentSumControl.value,
      NotesInOrder: this.FormsArray.get('FirstFormGroup').get('blessingText').value,
      Phone: this.FormsArray.get('SecondFormGroup').get('phoneSender').value,
      B2C_DateTimeToSend: month + '/' + day + '/' + year + ' ' + hour + ':' + minute,
      Media: this.FormsArray.get('FirstFormGroup').get('imgsSrc').value != '' ? '/assets/images/B2COrderImage/' + this.FormsArray.get('FirstFormGroup').get('imgsSrc').value : '',
      Email: this.FormsArray.get('SecondFormGroup').get('mailSender').value
    }



    debugger
    this.dataService.InsertUpdateB2COrder(objToApi).subscribe(result => {
      if (result.obj != undefined && result.obj != null) {
        this.GetPaymentToken(result.obj[0]['orderid']);
      }
      else {
        alert(result);
      }
    })

  }
  GetPaymentToken(orderId) {
    let objToApi = {
      OrderId: orderId,
      CompanyIdEnc: this.companyId
    }

    debugger
    this.dataService.GetPaymentToken(objToApi).subscribe(result => {
      debugger
      /**
       *       
      if (this.companyIdByParams) {
        this.route.navigate(['/gift-card/' + this.sumForm.get('cardSumControl').value], { skipLocationChange: true });
      }
      else {
        this.route.navigate(['public/admin/iframe/iframeView/gift-card/' + this.sumForm.get('cardSumControl').value], { skipLocationChange: true });

      }
       */




      if (result.obj != undefined && Object.keys(result.obj).length > 0) {

        let t = `${localStorage.getItem('baseUrlIframe').replace('/api', '')}/clearance/PaymetCC?param=` + result.obj[0]['PaymentToken'];

        this.document.location.href = `${localStorage.getItem('baseUrlIframe').replace('/api', '')}/clearance/PaymetCC?param=` + result.obj[0]['PaymentToken'];

        /**
         * this.document.location.href == 
         * http://localhost:4200/public/admin/iframe/iframeView/giftCard
         * 
         * 'https://tempdomain-test-3.mltp.co.il/clearance/PaymetCC?param=RpEhZJa4wiWs9BU3LbIdxKR8WhDk-dbYbkU6rHHSVh7OdWkg2Y4IeqJwhtp_w-xKLzxyMsjFay7z-B7cEhBICg2'
         */

      }
    })

  }

  sendDateChange(event) {
    if (event.value == 1) {
      this.FormsArray.get('SecondFormGroup').get('dateTimeData').get('time').setValue(new Date().getHours() + ':' + new Date().getMinutes())
    }
    //if must select another date to send gift
    if (event.value == 2) {
      this.openCloseTimeDateSendGift = true;


      //first open select date and time block


    }
    else {
      this.openCloseTimeDateSendGift = false;
    }
  }



  timePickerClicked() {
    setTimeout(() => {
      document.querySelectorAll('.timepicker-button > span').forEach(button => {
        if (button.innerHTML == 'Cancel') {
          button.innerHTML = 'סגור';
        }
        else if (button.innerHTML == 'Ok') {
          button.innerHTML = 'בחר';
        }
      })
    }, 0)

  }
  getMinTime() {
    let time = '';
    let currentDate = new Date();
    let dateChoosed = new Date(this.FormsArray.get('SecondFormGroup').get('dateTimeData').get('date').value);
    if (dateChoosed.getDate() == currentDate.getDate() && dateChoosed.getMonth() == currentDate.getMonth()) {
      return time = new Date().getHours() + ':' + new Date().getMinutes();
    }
    else {
      return '00:00';
    }
  }


  colorMatStepHorizontalLine(toStepper) {

    if (toStepper != 0) {
      let selectedInd = toStepper;
      let auxiliaryArr = [];
      for (let i = 0; i < selectedInd; i++) {
        auxiliaryArr.push(i);
      }
      this.document.querySelectorAll('.mat-stepper-horizontal-line').forEach((result, index) => {
        if (auxiliaryArr[index] == index) {

          (result as HTMLBodyElement).style.borderTopWidth = '4px';
        }
        //  
        // (result as HTMLBodyElement).style.borderTopWidth = '4px';
      })
    }

  }


}



//videos dialog

export interface VideoDialogData {
  videosDataObj: ''
  video: ''
}

@Component({
  selector: 'dialog-videosList',
  templateUrl: './videosDialog.html',
  styleUrls: ['./purchasing-gift.component.css'],
})
export class VideosDialogComponent implements OnInit {

  videosList;
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<VideosDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VideoDialogData,
    private route: Router
  ) {
  }



  ngOnInit(): void {
    this.videosList = this.data.videosDataObj;
  }


  dialogClose() {
    this.dialogRef.close();
  }

  select(video, videoElement) {
    this.dialogRef.close({
      result: {
        video: video,
        videoElement: videoElement
      },
    });
  }


}


//large preview added image video dialog
//videos dialog

export interface VideoDialogData {
  format: 'video' | 'image',
  src: ''
}

@Component({
  selector: 'dialog-videosList',
  templateUrl: './videoImageDialog.html',
  styleUrls: ['./purchasing-gift.component.css'],
})
export class VideoImageDialogComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<VideoImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VideoDialogData,
    private route: Router
  ) {
  }



  ngOnInit(): void {
    // this.videosList = this.data.videosDataObj;
  }


  dialogClose() {
    this.dialogRef.close();
  }


  changeVideo() {
    this.dialogRef.close({
      result: {
        video: 'changeVideo'
      },
    });
  }


}
