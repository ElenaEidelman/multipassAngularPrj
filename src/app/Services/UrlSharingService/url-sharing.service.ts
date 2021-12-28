import { EventEmitter, Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject, ReplaySubject, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UrlSharingService {


  /**
   *  BehaviorSubject — используем тогда, когда нам важно иметь начальное значение для подписки.
      ReplaySubject — используем тогда, когда нам нужно запомнить какое-то количество значений из потока данных и передать в новую подписку.
      AsyncSubject — используем тогда, когда нам нужно только последнее значение, при этом все остальные нам не важны.
   */

  public ReplaySubject = new ReplaySubject();
  public AsyncSubject = new AsyncSubject();
  public BehaviorSubject = new BehaviorSubject('');

  // private baseUrlSource = new AsyncSubject();
  // baseUrl = this.baseUrlSource.asObservable();

  public messageSource = new BehaviorSubject('');
  currentMessage = this.messageSource.asObservable();

  // replaySubject = this.ReplaySubject.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  // addToReplaySubject(message){
  //   this.ReplaySubject.next(message);
  // }

  // addBaseUrl(message: string){
  //   this.baseUrlSource.next(message);
  // }

}
