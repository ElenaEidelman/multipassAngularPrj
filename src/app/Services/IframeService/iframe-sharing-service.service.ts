import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class IframeSharingServiceService {
  // public companyInfo = new BehaviorSubject('');
  public companyId = new BehaviorSubject('');
  public iframeInfo = new BehaviorSubject('');
  public iframePreviewInfo = this.iframeInfo.asObservable();
  public companyInfoService = new BehaviorSubject('');

  public iframeCalledFromMultitav = new BehaviorSubject('');





  constructor() { }

  setPreviwIframeInfo(iframeInfo) {
    this.iframeInfo.next(iframeInfo);
  }
}
