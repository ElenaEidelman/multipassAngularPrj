import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from 'src/app/PopUps/dialog/dialog.component';
import { SharedService } from 'src/app/Services/SharedService/shared.service';

@Injectable({
  providedIn: 'root'
})
export class PagePermissionGuardGuard implements CanActivate {
  userToken;
  permissionMenuList;
  canActivatePath: boolean = false;

  constructor(
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private http: HttpClient) {

  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ) {

    try {
      await this.getPagePermission().then(result => {
        if (result['Token'] != undefined || result['Token'] != null) {

          //set new token
          let tempObjUser = JSON.parse(localStorage.getItem('user'));
          tempObjUser['Token'] = result['Token'];
          localStorage.setItem('user', JSON.stringify(tempObjUser));
          this.userToken = result['Token'];

          if (result['err'] != -1) {
            this.permissionMenuList = result['obj'][3];


            this.permissionMenuList.forEach(element => {
              if (element['PageName'] === route.routeConfig.path && element['In_Use'] === 1) {

                this.canActivatePath = true;
              }
            });
          }
          else {
            // this.dialog.open(DialogComponent, {
            //   data: { message: result.errdesc }
            // })
          }
        }
        else {
          this.sharedService.exitSystemEvent();
        }
      });
    }
    catch (error) {
      this.canActivatePath = false;
    }


    if (this.canActivatePath) {
      return true;
    }
    else {
      if (this.sharedService.pagesPermission.getValue() == 'false') {
        return true;
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: 'לא ניתן לעבור לדף המבוקש' }
        })
        return false;
      }
    }
  }

  getPagePermission() {

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    let objToApi = {
      Token: this.userToken
    }
    return this.dataService.GetMenuPages(objToApi).toPromise();
  }

}
