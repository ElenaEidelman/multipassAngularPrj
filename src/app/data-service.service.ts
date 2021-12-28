import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, EventEmitter, OnInit } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { Observable, of, Subject, throwError } from 'rxjs';

import { environment } from '../../src/environments/environment';
import { SharedService } from './Services/SharedService/shared.service';
// import * as urlData from 'src/assets/Files/HostFile.json';

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
  // baseUrl = '';
  baseUrl = localStorage.getItem('baseUrl');


  // baseUrl = environment.apiUrl;

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


  constructor(private http: HttpClient, private sharedService: SharedService) {

    this.getHost().subscribe(result => {
      this.sharedService.pagesPermission.next(result['pagesPermission']);

      localStorage.setItem('baseUrl', result['baseUrl']);

    });
  }



  ngOnInit() {

  }

  getHost() {
    return this.http.get('../assets/Files/HostFile.json');
  }

  SendOtp(obj) {
    debugger
    return this.http.post(`${this.baseUrl}/api/Users/SendOtp`, obj).pipe(
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
    return this.http.post(`${this.baseUrl}/api/Users/ValidateOtp`, objToOtp).pipe(
      map(result => {
        return result;
      })
    );
  }

  GetHomeData(objToApi) {
    return this.http.post(`${this.baseUrl}/api/DashBoard/GetHomeData`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }


  getAllOrders(objToApi) {
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrders`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  GetOrderDetails(orderData) {
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrderDetailsById`, orderData, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }


  ApproveOrder(objToApi) {
    //
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/ApproveOrder`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }
  GetAllCards(objToApi) {
    //
    return this.http.post(`${this.baseUrl}/api/AllCards/GetAllCards`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }
  GetCardsByOrderId(objToApi) {
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/GetCardsByOrderId`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })

    );
  }

  GetCardInfoById(objToApi) {
    return this.http.post(`${this.baseUrl}/api/AllCards/GetCardInfoById`, objToApi).pipe(
      map(result => {
        return result;
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
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/InsertUpdateOrder`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }
  InsertUpdateLines(objToApi) {
    //api/InsertUpdateOrder/InsertUpdateOrder

    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/InsertUpdateLines`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }


  GetOrdersByFilter(objToApi) {
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrdersByFilter`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteVoidOrder(objToApi) {
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/DeleteVoidOrder`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }


  GetAllCustomers(objToApi) {

    return this.http.post(`${this.baseUrl}/api/AllCustomers/GetAllCustomers`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  GetCustomersByFilter(objToApi) {
    return this.http.post(`${this.baseUrl}/api/AllCustomers/GetCustomersByFilter`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }



  GetAllUsers(objToApi) {
    return this.http.post(`${this.baseUrl}/api/AllUsers/GetAllUsers`, objToApi).pipe(
      map(result => {
        // 
        return result;
      }),
      catchError(error => {
        // 
        return of(error.message);
      })
    );
  }

  GetUsersByFilter(objToApi) {
    return this.http.post(`${this.baseUrl}/api/AllUsers/GetUsersByFilter	`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  InsertUpdateUser(objToApi) {
    return this.http.post(`${this.baseUrl}/api/InsertUpdateUser/InsertUpdateUsers`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }
  InsertUpdateBackOfficeUsers(objToApi) {
    return this.http.post(`${this.baseUrl}/api/AllUsers/InsertUpdateBackOfficeUsers`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  GetUserStatus(objToApi) {
    return this.http.post(`${this.baseUrl}/api/AllUsers/GetUserStatus	
    `, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }
  GetOrdersStatus(objToApi) {
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrdersStatus`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteSuspendUsers(objToApi) {
    return this.http.post(`${this.baseUrl}/api/InsertUpdateUser/DeleteSuspendUsers`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteSuspendBackOfficeUsers(objToApi) {
    return this.http.post(`${this.baseUrl}/api/AllUsers/DeleteSuspendBackOfficeUsers`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }



  GetSMSFormats(objToApi) {
    return this.http.post(`${this.baseUrl}/api/SMS/GetSMSFormats`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  CreateOrUpdateSMSTemplate(objToApi) {
    return this.http.post(`${this.baseUrl}/api/SMS/CreateOrUpdateSMSTemplate`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteSMSTemplate(objToApi) {
    return this.http.post(`${this.baseUrl}/api/SMS/DeleteSMSTemplate`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  SendSampleMessage(objToApi) {
    return this.http.post(`${this.baseUrl}/api/SMS/SendSampleMessage`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  SendSMSByOrderId(objToApi) {
    return this.http.post(`${this.baseUrl}/api/SMSController/SendSMSByOrderId


    `, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }


  SendSMSByOrderLine(objToApi) {
    return this.http.post(`${this.baseUrl}/api/SMS/SendSMSByOrderLine`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  InsertUpdateOrderByExcel(objToApi) {
    //
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/InsertUpdateOrderByExcel`, objToApi).pipe(
      map(result => {
        //
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
    return this.http.post(`${this.baseUrl}/api/AllCards/ActivateCards`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }
  VoidCards(objToApi) {
    //
    return this.http.post(`${this.baseUrl}/api/AllCards/VoidCards`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }
  CreateRealizationReports(objToApi) {
    return this.http.post(`${this.baseUrl}/api/AllReports/CreateRealizationReports`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }
  UpdateCards(objToApi) {
    //
    return this.http.post(`${this.baseUrl}/api/AllCards/UpdateCards`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  UpdateExpirationDateOfCards(objToApi) {
    //
    return this.http.post(`${this.baseUrl}/api/AllCards/UpdateExpirationDateOfCards`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  GetDigitalFilesList(objToApi) {
    //
    return this.http.post(`${this.baseUrl}/api/DigitalFilesList/GetDigitalFilesList`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }


  UpdatePinCodeOfCards(objToApi) {
    //
    return this.http.post(`${this.baseUrl}/api/AllCards/UpdatePinCodeOfCards`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  GetIFrameCompanyInfo(objToApi) {
    return this.http.post(`${this.baseUrl}/api/B2CIFrame/GetIFrameCompanyInfo`, objToApi).pipe(
      map(result => {
        //
        debugger
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  InsertUpdateIFrame(objToApi) {
    return this.http.post(`${this.baseUrl}/api/B2CIFrame/InsertUpdateIFrame`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  GetIFrameB2CLink(objToApi) {
    return this.http.post(`${this.baseUrl}/api/B2CIFrame/GetIFrameB2CLink`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }
  GetMenuPages(objToApi) {
    return this.http.post(`${this.baseUrl}/api/Credential/GetMenuPages`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }


  GetRoles(objToApi) {
    return this.http.post(`${this.baseUrl}/api/Credential/GetRoles`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }

  GetUserToRole(objToApi) {
    return this.http.post(`${this.baseUrl}/api/Credential/GetUserToRole`, objToApi).pipe(
      map(result => {
        //
        return result;
      }),
      catchError(error => {
        //
        return of(error.message);
      })
    );
  }
}
