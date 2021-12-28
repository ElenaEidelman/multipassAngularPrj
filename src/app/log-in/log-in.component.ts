import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { DataServiceService } from '../data-service.service';
import { SharedService } from '../Services/SharedService/shared.service';




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

  constructor(
    private dataService: DataServiceService,
    private fb: FormBuilder,
    private route: Router,
    private sharedService: SharedService,
    private cookieService: CookieService) { }

  ngOnInit(): void {
    window.scroll(0, 0);
    // localStorage.removeItem('user');
    localStorage.removeItem('excelFileData');
  }

  SendOtp() {
    if (this.loginForm.valid) {
      this.loginSpinner = true;

      let phone = this.loginForm.get('PhoneNumber').value.includes('-') ? this.loginForm.get('PhoneNumber').value.replace('-', '') : this.loginForm.get('PhoneNumber').value;

      let objToApi = {
        PhoneNumber: phone,
        CompanyId: this.loginForm.get('CompanyId').value
      }
      debugger
      this.dataService.SendOtp(objToApi).subscribe(result => {
        debugger
        this.loginSpinner = false;
        if (result['Token'] != undefined || result['Token'] != null) {
          if (result.err != -1) {
            this.validKind = 'ValidateOtp';

            this.dataService.getHost().subscribe(hostResult => {
              if (hostResult['DevMode'] == 'true') {
                this.loginForm.get('OtpKey').setValue(result['Token']);
                this.loginForm.get('OtpKey').setValidators(Validators.required);
              }
            });

          }
          else {
            if (result['errdesc'].includes('Could not find User with phone number')) {
              this.msgAlert = result.errdesc.replace('Could not find User with phone number', 'לא נמצא משתמש עם מספר טלפון');
              setTimeout(() => {
                this.msgAlert = '';
              }, 3000);
            }
            else {
              this.msgAlert = 'שגיאה, נא לנסות שוב פעם';
              setTimeout(() => {
                this.msgAlert = '';
              }, 3000);
            }
          }
        }
        else if (result['Token'] == null && result.err == 1) {
          this.msgAlert = result.errdesc;
        }
        else if (typeof result == 'string') {
          this.msgAlert = result;
          setTimeout(() => {
            this.msgAlert = '';
          }, 3000);
        }


      });
    }
    else {
      this.msgAlert = '* נא למלא את כל השדות';
      setTimeout(() => {
        this.msgAlert = '';
      }, 3000);
    }
  }


  ValidateOtp() {
    if (this.loginForm.valid) {
      let objToApi = {
        PhoneNumber: this.loginForm.get('PhoneNumber').value,
        CompanyId: this.loginForm.get('CompanyId').value,
        OtpKey: this.loginForm.get('OtpKey').value
      }
      this.dataService.ValidateOtp(objToApi).subscribe(result => {

        if (result['Token'] != '' && result['obj'] != null) {
          let userObj = {
            Token: result['Token'],
            obj: {
              Fname: result['obj']['Fname'],
              Lname: result['obj']['Lname'],
              Image: result['obj']['Image']
            }
          }
          localStorage.setItem('user', JSON.stringify(userObj));

          this.route.navigate(['/public/home']);
          this.validKind = 'SendOtp';
        }
        else {
          this.validateOtpErrorAlert = 'קוד אימות לא תקין';
          setTimeout(() => {
            this.validateOtpErrorAlert = '';
          }, 3000);
        }
      });
    }
    else {
      this.validateOtpErrorAlert = 'מספר מזהה שגוי  ';
      setTimeout(() => {
        this.validateOtpErrorAlert = '';
      }, 3000);
    }
  }

  sendAgainCodeValidation() {
    this.SendOtp();
  }
  editPhoneNumber() {
    // alert('editPhoneNumber');

    this.validKind = 'SendOtp';

  }
}
