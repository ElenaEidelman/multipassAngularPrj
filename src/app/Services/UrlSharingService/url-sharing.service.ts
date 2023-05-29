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
  public currentMessage = this.messageSource.asObservable();

  public orderTypeSource = new BehaviorSubject('');
  public orderTypeMessage = this.orderTypeSource.asObservable();

  public issuanceVoucherFormData = new BehaviorSubject('');
  public issuanceVoucherFormDataMessage = this.issuanceVoucherFormData.asObservable();


  // replaySubject = this.ReplaySubject.asObservable();

  constructor() { }

  changeMessage(message: string) {
    this.messageSource.next(message)
  }

  changeOrderType(orderType: string) {
    this.orderTypeSource.next(orderType);
  }
  setIssuanceVouchersFormData(issuanceVouchersForm: string) {
    this.issuanceVoucherFormData.next(issuanceVouchersForm);
  }

  // addToReplaySubject(message){
  //   this.ReplaySubject.next(message);
  // }

  // addBaseUrl(message: string){
  //   this.baseUrlSource.next(message);
  // }

}
