import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, EventEmitter, OnInit } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { Observable, of, Subject, throwError} from 'rxjs';
import { SharedService } from './shared.service';

const httpOptions = {
  headers: new HttpHeaders({'Content-Type': 'application/json'})
}

@Injectable({
  providedIn: 'root'
})
export class DataServiceService implements OnInit {




  baseUrl = 'http://tempdomain-test-3.mltp.co.il';
  //baseUrl = 'http://localhost:45036';

  //test main
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
  

  constructor(private http: HttpClient, private sharedService: SharedService) { }



  ngOnInit(){

  }

  SendOtp(obj){
      return this.http.post(`${this.baseUrl}/api/Users/SendOtp`,obj).pipe(
        map(result => {
          return result;
        }),
        catchError(err => {
          return of(err.message);
        })
      );
  }
  ValidateOtp(objToOtp){
    //debugger
    return this.http.post(`${this.baseUrl}/api/Users/ValidateOtp`,objToOtp).pipe(
      map(result => {
        return result;
      })
    );
}


  getAllOrders(objToApi){
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrders`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      })
    );
  }

  GetOrderDetails(orderData){
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrderDetailsById`, orderData, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }


  ApproveOrder(objToApi){
    //debugger
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/ApproveOrder`,objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }
  GetAllCards(objToApi){
    //debugger
    return this.http.post(`${this.baseUrl}/api/AllCards/GetAllCards`,objToApi).pipe(
      map(result => {
        //debugger
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }
  GetCardsByOrderId(objToApi){
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/GetCardsByOrderId`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })

    );
  }
//GetOrderExObjectById
  

  InsertUpdateOrder(objToApi){
    //api/InsertUpdateOrder/InsertUpdateOrder
    // debugger
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/InsertUpdateOrder`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }
  InsertUpdateLines(objToApi){
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


  GetOrdersByFilter(objToApi){
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrdersByFilter`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteVoidOrder(objToApi){
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/DeleteVoidOrder`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  
  GetAllCustomers(objToApi){
    //debugger
    return this.http.post(`${this.baseUrl}/api/AllCustomers/GetAllCustomers`,objToApi).pipe(
      map(result => {
        //debugger
        return result;
      }),
      catchError(error => {
        //debugger
        return of(error.message);
      })
    );
  }

  GetCustomersByFilter(objToApi){
    return this.http.post(`${this.baseUrl}/api/AllCustomers/GetCustomersByFilter`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }


  
  GetAllUsers(objToApi){
    return this.http.post(`${this.baseUrl}/api/AllUsers/GetAllUsers`,objToApi).pipe(
      map(result => {
        debugger
        return result;
      }),
      catchError(error => {
        debugger
        return of(error.message);
      })
    );
  }

  GetUsersByFilter(objToApi){
    return this.http.post(`${this.baseUrl}/api/AllUsers/GetUsersByFilter	`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  InsertUpdateUser(objToApi){
    return this.http.post(`${this.baseUrl}/api/InsertUpdateUser/InsertUpdateUsers`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }
  InsertUpdateBackOfficeUsers(objToApi){
    return this.http.post(`${this.baseUrl}/api/AllUsers/InsertUpdateBackOfficeUsers`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  GetUserStatus(objToApi){
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
  GetOrdersStatus(objToApi){
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrdersStatus`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteSuspendUsers(objToApi){
    return this.http.post(`${this.baseUrl}/api/InsertUpdateUser/DeleteSuspendUsers`,objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteSuspendBackOfficeUsers(objToApi){
    return this.http.post(`${this.baseUrl}/api/AllUsers/DeleteSuspendBackOfficeUsers`,objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }


  
  GetSMSFormats(objToApi){
    return this.http.post(`${this.baseUrl}/api/SMS/GetSMSFormats`,objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  CreateOrUpdateSMSTemplate(objToApi){
    return this.http.post(`${this.baseUrl}/api/SMS/CreateOrUpdateSMSTemplate`,objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  DeleteSMSTemplate(objToApi){
    return this.http.post(`${this.baseUrl}/api/SMS/DeleteSMSTemplate`,objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  SendSampleMessage(objToApi){
    return this.http.post(`${this.baseUrl}//api/SMS/SendSampleMessage`,objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(error => {
        return of(error.message);
      })
    );
  }

  InsertUpdateOrderByExcel(objToApi){
    //debugger
    return this.http.post(`${this.baseUrl}/api/InsertUpdateOrder/InsertUpdateOrderByExcel`,objToApi).pipe(
      map(result => {
        //debugger
        return result;
      }),
      catchError(error => {
        //debugger
        return of(error.message);
      })
    );
  }
}
