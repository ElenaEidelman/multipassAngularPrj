import { Injectable } from '@angular/core';
import {Observable, Subject} from 'rxjs';
import { EventEmitter } from 'stream';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  private subject = new Subject<any>();

  file = new File([],'empFile');
  constructor() {

   }

  //send massage example
  exitSystemEvent(){
    this.subject.next();
  }

  //get massage example
  getExitSystemEvent():Observable<any>{
     return this.subject.asObservable();
  }
}
