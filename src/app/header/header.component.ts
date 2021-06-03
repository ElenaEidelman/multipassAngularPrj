import { Route } from '@angular/compiler/src/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import { DataServiceService } from '../data-service.service';
import {Subscription} from 'rxjs'
import { SharedService } from '../shared.service';
import { MatDialog } from '@angular/material/dialog';
import { AdminLogInComponent } from '../PopUps/admin-log-in/admin-log-in.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  clickEventSubscription:Subscription;

  constructor(
                private route: Router, 
                private dataService: DataServiceService, 
                private sharedService: SharedService,
                private dialog: MatDialog) 
                { 
                  this.clickEventSubscription = this.sharedService.getExitSystemEvent().subscribe((el)=>{
                    this.exitSystem();
                })
  }

  @ViewChild(MatMenuTrigger) menu: MatMenuTrigger;
  NameUser: string = '';
  userLogo: string;

  ngOnInit() {
    this.setUserData();
  }

  settingsMenuOpened(){
    return this.menu.menuOpened;
  }


  exitSystem(){
    localStorage.removeItem('user');

    this.route.navigate(['/logIn']);
  }

  setUserData(){
    let userData = JSON.parse(localStorage.getItem('user'));
    let name = userData.obj.Fname;
    let lname = userData.obj.Lname;

    this.NameUser = name + ' ' + lname;

    this.userLogo = userData.obj.Image;
  }
  adminLogIn(){
    const dialogRef = this.dialog.open(AdminLogInComponent, {
      data: ''
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  ngOnDestroy(){
    this.clickEventSubscription.unsubscribe();

  }
}
