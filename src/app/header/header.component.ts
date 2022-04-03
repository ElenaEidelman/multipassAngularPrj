import { Route } from '@angular/compiler/src/core';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { DataServiceService } from '../data-service.service';
import { Subscription } from 'rxjs'

import { MatDialog } from '@angular/material/dialog';
// import { AdminLogInComponent } from '../PopUps/admin-log-in/admin-log-in.component';
import { HttpClient } from '@angular/common/http';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { MsgList } from '../Classes/msgsList';
import { SharedService } from '../Services/SharedService/shared.service';



@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {



  clickEventSubscription: Subscription;


  constructor(
    private route: Router,
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private http: HttpClient) {
    this.clickEventSubscription = this.sharedService.getExitSystemEvent().subscribe((el) => {
      debugger
      this.exitSystem(el);
    })
  }

  @ViewChild(MatMenuTrigger) menu: MatMenuTrigger;
  NameUser: string = '';
  userLogo: string;



  ngOnInit() {
    this.setUserData();
  }

  settingsMenuOpened() {
    return this.menu.menuOpened;
  }


  exitSystem(addText?: string) {


    // if (this.dialog.openDialogs.length == 0) {
    //   let dialogRef = this.dialog.open(DialogComponent, {
    //     // disableClose: true  
    //   });
    // }

    // let dialogConfig = { hasBackdrop: false, skipHide: true, panelClass: 'cssthemeInfo', width: '300px', height: '400px' };


    //multitav local storages
    localStorage.removeItem('user');
    localStorage.removeItem('excelFileData');


    //iframe local storages
    localStorage.removeItem('companyId');
    localStorage.removeItem('picSizeInMega');
    localStorage.removeItem('baseUrlIframe');
    localStorage.removeItem('companyInfo');

    this.route.navigate(['/logIn']);
    this.dialog.open(DialogComponent, {
      data: { title: 'התנתקת מהמערכת', message: `${MsgList.exitSystemAlert}`, subTitle: addText }
    })
  }

  setUserData() {
    let userData = JSON.parse(localStorage.getItem('user'));
    let name = userData.obj.Fname;
    let lname = userData.obj.Lname == null ? '' : userData.obj.Lname;

    this.NameUser = name + ' ' + lname;

    this.userLogo = userData.obj.Image;
  }
  // adminLogIn() {
  //   // const dialogRef = this.dialog.open(AdminLogInComponent, {
  //   //   data: ''
  //   // });

  //   // dialogRef.afterClosed().subscribe(result => {
  //   //   console.log(`Dialog result: ${result}`);
  //   // });


  //   this.route.navigate(['public/admin'])
  // }

  ngOnDestroy() {
    this.clickEventSubscription.unsubscribe();

  }
}
