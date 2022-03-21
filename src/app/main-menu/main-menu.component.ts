import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MsgList } from '../Classes/msgsList';
import { DataServiceService } from '../data-service.service';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { SharedService } from '../Services/SharedService/shared.service';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  constructor(
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog) { }
  userToken;
  MsgList = MsgList;
  permissionMenuList;
  mockMenu = [
    { MenuEngName: 'allOrders', MenuName: 'הזמנות' },
    { MenuEngName: 'allCards', MenuName: 'שוברים' },
    { MenuEngName: 'allCustomers', MenuName: 'לקוחות' },
    { MenuEngName: 'reports', MenuName: 'דוחות' },
    { MenuEngName: 'allUsers', MenuName: 'משתמשים' },
    { MenuEngName: 'allSMStemplates', MenuName: 'SMS תבנית ' },
    { MenuEngName: 'IFrame', MenuName: 'IFrame' },
  ];

  ngOnInit() {
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.GetMenuPages();
  }
  GetMenuPages() {


    this.dataService.getHost().subscribe(result => {
      // this.sharedService.pagesPermission.next(result['pagesPermission']);


      if (result['pagesPermission'] == 'true') {
        let objToApi = {
          Token: this.userToken
        }


        this.dataService.GetMenuPages(objToApi).subscribe(result => {
          if (typeof result == 'string') {
            this.dialog.open(DialogComponent, {
              data: { message: result }
            })

            this.sharedService.exitSystemEvent();
            return false;
          }


          // if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          // if (result.err != -1) {
          if (result.obj != null) {


            this.permissionMenuList = this.distinctMenu(result.obj[1]);
            debugger

            this.permissionMenuList.sort((menua, menub) => {
              return menua['Sequence'] - menub['Sequence']
            })

            // this.permissionMenuList = this.distinctMenu(this.mockMenu);

          }
          else {
            this.permissionMenuList = this.mockMenu;
          }
          // }
          // else {
          //   this.dialog.open(DialogComponent, {
          //     data: { message: result.errdesc }
          //   })
          // }
          // }
          // else {

          //   this.sharedService.exitSystemEvent();
          // }
        })
      }
      else {

        this.permissionMenuList = this.mockMenu;
      }
    });
  }


  distinctMenu(menu) {
    let menuSet = [];


    menu.forEach(element => {
      if (element['In_Use'] === 1) {
        menuSet.push(element);
      }
    });


    // menu.forEach(element => {
    //   
    //   if (menuSet.some(menu => {
    //     
    //     return menu.MenuEngName === element.MenuEngName
    //   })) {
    //     
    //   }
    //   else {
    //     
    //     menuSet.push(element)
    //   }
    // });
    return menuSet;
  }

}
