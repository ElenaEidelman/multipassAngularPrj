import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, EventEmitter, OnInit } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { Observable, of, Subject, throwError } from 'rxjs';

import { environment } from '../../src/environments/environment';
import { SharedService } from './Services/SharedService/shared.service';
import { DialogComponent } from './PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
// import host from "../HostFile.json";


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root'
})
export class DataServiceService implements OnInit {


  //git fetch subBranch
  //git merge origin/subBranch

  // baseUrl = '';

  // baseUrl = 'http://tempdomain-test-3.mltp.co.il';
  // baseUrl = 'http://localhost:45036';
  // baseUrl = 'http://multitav.co.il';
  // baseUrl = localStorage.getItem('baseUrl');

  //test beforeMerge
  /**
   * 
$ git checkout master
$ git branch new-branch
$ git checkout new-branch

# ...develop some code...

$ git add –A
$ git commit –m "Some commit message"
$ git checkout master
$ git merge new-branch
   */




  constructor(private http: HttpClient, private sharedService: SharedService, private dialog: MatDialog) {
    this.setBaseUrl();
  }


  ngOnInit() {

  }

  setBaseUrl() {
    this.getHost().subscribe(result => {
      localStorage.setItem('baseUrl', result['baseUrl']);

    });
  }

  getHost() {
    return this.http.get('../HostFile.json').pipe(
      map(result => {
        return result;
      })
    )
  }

  SendOtp(obj) {

    return this.http.post(`${localStorage.getItem('baseUrl')}/api/Users/SendOtp`, obj).pipe(
      map(result => {

        return result;
      }),
      catchError(err => {
        // localStorage.removeItem('baseUrl');
        return of(err.message);

      })
    );
  }
  ValidateOtp(objToOtp) {
    //

    return this.http.post(`${localStorage.getItem('baseUrl')}/api/Users/ValidateOtp`, objToOtp).pipe(

      map(result => {

        return result;
      })
    );
  }

  checkResult(result) {
    debugger
    if (typeof result == 'object') {

      if (result['Token'] != null && result['Token'] != '') {
        if (+result['err'] < 0) {

          this.dialog.open(DialogComponent, {
            data: { message: result['errdesc'] != null ? result['errdesc'] : 'err: ' + result['err'] }
          })
        }
        else {
          return result;
        }
      }
      else {

        // this.dialog.open(DialogComponent, {
        //   data: { message: result['errdesc'] }
        // })
        this.sharedService.exitSystemEvent(result['errdesc']);
      }
    }
    else if (typeof result == 'string') {

      // this.dialog.open(DialogComponent, {
      //   data: { message: result }
      // })
      this.sharedService.exitSystemEvent(result);
    }
  }


  GetHomeData(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/DashBoard/GetHomeData`, objToApi, httpOptions).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(err => {

        return of(err.message);
      })
    );
  }


  GetPoliciesByCompanyId(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/Policy/GetPoliciesByCompanyId`, objToApi, httpOptions).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(err => {

        return of(err.message);
      })
    );
  }


  getAllOrders(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/Orders/GetOrders`, objToApi, httpOptions).pipe(
      map(result => {

        return this.checkResult(result);
      }),
      catchError(err => {

        return of(err.message);
      })
    );
  }

  GetOrderDetails(orderData) {

    return this.http.post(`${localStorage.getItem('baseUrl')}/api/Orders/GetOrderDetailsById`, orderData, httpOptions).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }


  ApproveOrder(objToApi) {
    //
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/InsertUpdateOrder/ApproveOrder`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }
  GetAllCards(objToApi) {
    //

    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllCards/GetAllCards`, objToApi).pipe(
      map(result => {
        //

        return this.checkResult(result);
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }
  GetCardsByOrderId(objToApi) {

    return this.http.post(`${localStorage.getItem('baseUrl')}/api/InsertUpdateOrder/GetCardsByOrderId`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(err => {
        return of(err.message);
      })

    );
  }

  GetCardInfoById(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllCards/GetCardInfoById`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(err => {
        return of(err.message);
      })

    );
  }
  //GetOrderExObjectById


  InsertUpdateOrder(objToApi) {
    //api/InsertUpdateOrder/InsertUpdateOrder
    // 
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/InsertUpdateOrder/InsertUpdateOrder`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }
  InsertUpdateLines(objToApi) {
    //api/InsertUpdateOrder/InsertUpdateOrder

    return this.http.post(`${localStorage.getItem('baseUrl')}/api/InsertUpdateOrder/InsertUpdateLines`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }


  GetOrdersByFilter(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/Orders/GetOrdersByFilter`, objToApi).pipe(
      map(result => {

        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteVoidOrder(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/InsertUpdateOrder/DeleteVoidOrder`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }


  GetAllCustomers(objToApi) {


    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllCustomers/GetAllCustomers`, objToApi).pipe(
      map(result => {
        //
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  GetCustomersByFilter(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllCustomers/GetCustomersByFilter`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }



  GetAllUsers(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllUsers/GetAllUsers`, objToApi).pipe(
      map(result => {
        // 
        return this.checkResult(result);
      }),
      catchError(error => {
        // 
        return of(error.message);
      })
    );
  }

  GetUsersByFilter(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllUsers/GetUsersByFilter	`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  InsertUpdateUser(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/InsertUpdateUser/InsertUpdateUsers`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }
  InsertUpdateBackOfficeUsers(objToApi) {

    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllUsers/InsertUpdateBackOfficeUsers`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  GetUserStatus(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllUsers/GetUserStatus	
    `, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }
  GetOrdersStatus(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/Orders/GetOrdersStatus`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteSuspendUsers(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/InsertUpdateUser/DeleteSuspendUsers`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteSuspendBackOfficeUsers(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllUsers/DeleteSuspendBackOfficeUsers`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }



  GetSMSFormats(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/SMS/GetSMSFormats`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  CreateOrUpdateSMSTemplate(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/SMS/CreateOrUpdateSMSTemplate`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteSMSTemplate(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/SMS/DeleteSMSTemplate`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  SendSampleMessage(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/SMS/SendSampleMessage`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  // SendSMSByOrderId(objToApi) {
  //   return this.http.post(`${localStorage.getItem('baseUrl')}/api/SMS/SendSMSByOrderId


  //   `, objToApi).pipe(
  //     map(result => {
  //       return result;
  //     }),
  //     catchError(error => {
  //       return of(error.message);
  //     })
  //   );
  // }


  SendSMSByOrderLine(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/SMS/SendSMSByOrderLine`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  InsertUpdateOrderByExcel(objToApi) {
    //
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/InsertUpdateOrder/InsertUpdateOrderByExcel`, objToApi).pipe(
      map(result => {
        //check result happening in component
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  ActivateCards(objToApi) {
    //
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllCards/ActivateCards`, objToApi).pipe(
      map(result => {
        //
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }
  VoidCards(objToApi) {
    //
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllCards/VoidCards`, objToApi).pipe(
      map(result => {
        //
        debugger
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }
  CreateRealizationReports(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllReports/CreateRealizationReports`, objToApi).pipe(
      map(result => {
        //
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }
  UpdateCards(objToApi) {
    //
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllCards/UpdateCards`, objToApi).pipe(
      map(result => {
        //
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  UpdateExpirationDateOfCards(objToApi) {
    //
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllCards/UpdateExpirationDateOfCards`, objToApi).pipe(
      map(result => {
        //
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  GetDigitalFilesList(objToApi) {
    //
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/DigitalFilesList/GetDigitalFilesList`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }


  UpdatePinCodeOfCards(objToApi) {
    //
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/AllCards/UpdatePinCodeOfCards`, objToApi).pipe(
      map(result => {
        //
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }
  GetMenuPages(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/Credential/GetMenuPages`, objToApi).pipe(
      map(result => {
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }


  GetRoles(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/Credential/GetRoles`, objToApi).pipe(
      map(result => {
        //
        return this.checkResult(result);
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  // GetUserToRole(objToApi) {
  //   return this.http.post(`${localStorage.getItem('baseUrl')}/api/Credential/GetUserToRole`, objToApi).pipe(
  //     map(result => {
  //       //
  //       return this.checkResult(result);
  //     }),
  //     catchError(error => {
  //       //
  //       return of(error.message);
  //     })
  //   );
  // }
}
