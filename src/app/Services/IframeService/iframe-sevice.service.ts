import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, EventEmitter, OnInit } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
// import * as urlData from 'src/assets/Files/HostFile.json';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
}

@Injectable({
  providedIn: 'root'
})
export class IframeSeviceService {

  // public companyInfoService = new BehaviorSubject('');

  // baseUrl = `https://tempdomain-test-3.mltp.co.il/api`;
  // baseUrl =  `http://localhost:45036/api`;
  // baseUrl = localStorage.getItem('baseUrlIframe');
  picSizeInMega = localStorage.getItem('picSizeInMega');
  minAmount = new EventEmitter();

  constructor(private http: HttpClient) {
    this.getHost().subscribe(result => {

      localStorage.setItem('baseUrlIframe', result['baseUrl'] + '/api');
      localStorage.setItem('picSizeInMega', result['picSizeInMega']);
      this.minAmount.emit(+result['minAmount']);
    });
  }

  ngOnInit() {

  }

  getHost() {
    return this.http.get('../assets/Files/HostFileIframe.json').pipe(map(res => res));
  }



  // GetIFrameCompanyInfo(objToApi) {

  //   return this.http.post(`${localStorage.getItem('baseUrlIframe')}/api/B2CIFrame/GetIFrameCompanyInfo`, objToApi).pipe(
  //     map(result => {
  //       return result;
  //     }),
  //     catchError(err => {
  //       return of(err);
  //     })
  //   );
  // }
  InsertUpdateB2COrder(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/B2CIFrame/InsertUpdateB2COrder`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  GetPaymentToken(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/B2CIFrame/GetPaymentToken`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  SavePicForGreeting(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/B2CIFrame/SavePicForGreeting`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  GetResume(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/B2CIFrame/GetResume`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  GetBlessings(objToApi) {
    //api/B2CIFrame/GetBlessings
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/B2CIFrame/GetBlessings`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

}
