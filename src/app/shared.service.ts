import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private subject = new Subject<any>();

  constructor() { }

  //send massage example
  exitSystemEvent(){
    this.subject.next();
  }

  //get massage example
  getExitSystemEvent():Observable<any>{
     return this.subject.asObservable();
  }
}
