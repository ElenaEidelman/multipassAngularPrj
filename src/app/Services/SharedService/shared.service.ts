import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject, Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private subject = new Subject<any>();

  public pagesPermission = new BehaviorSubject('');
  public pagesAccessLevel = new BehaviorSubject('');


  //orderCards 
  // public newCustomerForForm = new BehaviorSubject('');
  public newCustomerData = new BehaviorSubject('');
  public newCustomerObservable = this.newCustomerData.asObservable()



  // file = new File([],'empFile');
  constructor() {

  }

  //send massage example
  exitSystemEvent() {
    this.subject.next();
  }

  //get massage example
  getExitSystemEvent(): Observable<any> {
    return this.subject.asObservable();
  }
}
