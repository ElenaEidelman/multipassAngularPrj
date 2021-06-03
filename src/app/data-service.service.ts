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




  //baseUrl = 'http://tempdomain-test-4.mltp.co.il';
  baseUrl = 'http://localhost:45036';
 
  

  constructor(private http: HttpClient, private sharedService: SharedService) { }



  ngOnInit(){

  }

  // checkUser(objToOtp){
  //   return this.http.post(`${this.baseUrl}/Users/login`, objToOtp).pipe(
  //     map(result => {
  //         return result;
  //     })
  //   );

  //   // return this.http.post(`${this.logInUrl}/SendOtp`,{},httpOptions).pipe(
  //   //   map(result => {
  //   //     debugger
  //   //   })
  //   // );
  // }

  SendOtp(obj){
      return this.http.post(`${this.baseUrl}/api/Users/SendOtp`,obj).pipe(
        map(result => {
         // debugger
          return result;
        })
      );
  }
  ValidateOtp(objToOtp){
    //debugger
    return this.http.post(`${this.baseUrl}/api/Users/ValidateOtp`,objToOtp).pipe(
      map(result => {
        //debugger
        return result;
      })
    );

    // return this.http.post(`${this.baseUrl}/Users/login`, objToOtp).pipe(
    //   map(result => {
    //     return result;
    // })
    // )

}

  getAllOrders(objToApi){
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrders`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      })
    );
  }

  GetOrderDetails(orderData){
    return this.http.post(`${this.baseUrl}/api/Orders/GetOrderDetails`, orderData, httpOptions).pipe(
      map(result => {
        debugger
        return result;
      })
    );
  }
  
  GetAllCards(objToApi){
    //debugger
    return this.http.post(`${this.baseUrl}/api/AllCards/GetAllCards`,objToApi).pipe(
      map(result => {
        debugger
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }
//GetOrderExObjectById
  
  GetAllCustomers(objToApi){
    return this.http.post(`${this.baseUrl}/api/AllCustomers/GetAllCustomers`,objToApi).pipe(
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
}
