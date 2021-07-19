import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import {DataServiceService} from '../data-service.service';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {
  loginForm = this.fb.group({
    PhoneNumber: ['', Validators.required],
    CompanyId: ['', Validators.required],
    OtpKey: ['']
  });

  msgAlert: string = '';
  validateOtpErrorAlert: string = '';
  validKind: string = 'SendOtp';

  loginSpinner: boolean = false;

  constructor( private dataService: DataServiceService, private fb: FormBuilder, private route: Router) { }

  ngOnInit(): void {
    window.scroll(0,0);
  }

  // logIn(){
  //   // this.validKind = 'checkUser'
  //   // this.validKind = validKind;
  //   // if(validKind == 'SendOtp'){
  //     //debugger
  //     if(this.loginForm.valid){
  //       this.loginSpinner = true;
  //       // let mail = this.loginForm.get('mail').value;
  //       // let password = this.loginForm.get('password').value;

  //       let objToApi = {
  //         Mail: this.loginForm.get('phone').value,
  //         Password: this.loginForm.get('companyId').value
  //       }
  //       debugger
  //       this.dataService.checkUser(objToApi).subscribe(result => {

  //             this.loginSpinner = false;
  //             if(result['obj'] != null){
  //               this.validKind = 'ValidateOtp';
  //               localStorage.setItem('user', JSON.stringify(result));
  //               //debugger
  //               this.route.navigate(['/public/home']);
  //             }
  //             else{
  //               //debugger
  //               this.msgAlert = ' * משתמש לא קיים';
  //               setTimeout(() =>{
  //                 this.msgAlert = '';
  //               }, 3000);
  //             }
   

  //       })
  //     }
  //     else{
  //       //debugger
  //       // localStorage.setItem('userExist','false');
  //       this.msgAlert = '* נא למלא את כל השדות';
  //       setTimeout(() =>{
  //         this.msgAlert = '';
  //       }, 3000);
  //     }


  //   // if(validKind == 'ValidateOtp'){

  //   // }

  // }

  SendOtp(){
    debugger
    if(this.loginForm.valid){
      this.loginSpinner = true;
      let objToApi = {
        PhoneNumber: this.loginForm.get('PhoneNumber').value,
        CompanyId: this.loginForm.get('CompanyId').value
      }

      debugger
      this.dataService.SendOtp(objToApi).subscribe(result => {
        debugger
        this.loginSpinner = false;
        if (result['Token'] != undefined || result['Token'] != null) {
          if(Object.values(result).length > 0){
            this.validKind = 'ValidateOtp';
     
            this.loginForm.get('OtpKey').setValue(result['Token']);
            this.loginForm.get('OtpKey').setValidators(Validators.required);
  
          }
          else{
            this.msgAlert = 'שגיאה, נא לנסות שוב פעם';
            setTimeout(() =>{
              this.msgAlert = '';
            }, 3000);
          }
        }
        else{
          this.msgAlert = result.errdesc;
          setTimeout(() =>{
            this.msgAlert = '';
          }, 3000);
        }

      });
    }
    else{
      this.msgAlert = '* נא למלא את כל השדות';
      setTimeout(() =>{
        this.msgAlert = '';
      }, 3000);
    }
  }
  

  ValidateOtp(){
    if(this.loginForm.valid){
      let objToApi = {
        PhoneNumber: this.loginForm.get('PhoneNumber').value,
        CompanyId: this.loginForm.get('CompanyId').value,
        OtpKey: this.loginForm.get('OtpKey').value
      }
      this.dataService.ValidateOtp(objToApi).subscribe(result => {
        debugger
        if(result['Token'] != '' && result['obj'] != null){
          localStorage.setItem('user', JSON.stringify(result));
          //debugger
          this.route.navigate(['/public/home']);
          this.validKind = 'SendOtp';
        }
        else{
          this.validateOtpErrorAlert = 'קוד אימות לא תקין';
          setTimeout(()=>{
            this.validateOtpErrorAlert = '';
          }, 3000);
        }
      });
    }
    else{
      this.validateOtpErrorAlert = 'מספר מזהה שגוי  ';
      setTimeout(()=>{
        this.validateOtpErrorAlert = '';
      }, 3000);
    }
  }

  sendAgainCodeValidation(){
    this.SendOtp();
  }
  editPhoneNumber(){
    // alert('editPhoneNumber');
    debugger
    this.validKind = 'SendOtp';
    debugger
  }
}
