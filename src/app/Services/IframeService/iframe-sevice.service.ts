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

  constructor(private http: HttpClient) { }

  ngOnInit() {

  }

  getHost() {
    return this.http.get('../HostFileIframe.json').pipe(map(res => res));
  }

  InsertUpdateB2COrder(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/api/B2CIFrame/InsertUpdateB2COrder`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  GetPaymentToken(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/api/B2CIFrame/GetPaymentToken`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  SavePicForGreeting(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/api/B2CIFrame/SavePicForGreeting`, objToApi).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }

  GetResume(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/api/B2CIFrame/GetResume`, objToApi, httpOptions).pipe(
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
    return this.http.post(`${localStorage.getItem('baseUrl')}/api/B2CIFrame/GetBlessings`, objToApi, httpOptions).pipe(
      map(result => {
        return result;
      }),
      catchError(err => {
        return of(err.message);
      })
    );
  }


  //moved from dataService
  GetIFrameCompanyInfo(objToApi) {

    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/api/B2CIFrame/GetIFrameCompanyInfo`, objToApi).pipe(
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

    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/api/B2CIFrame/GetIFrameB2CLink`, objToApi).pipe(
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

  InsertUpdateIFrame(objToApi) {
    return this.http.post(`${localStorage.getItem('baseUrlIframe')}/api/B2CIFrame/InsertUpdateIFrame`, objToApi).pipe(
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

  ////////////////////////////////////////
}
