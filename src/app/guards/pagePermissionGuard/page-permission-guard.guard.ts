import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
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
  canActivatePath: boolean;

  constructor(
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog,
    private http: HttpClient,
    private router: Router) {

  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ) {

    try {

      this.canActivatePath = false;
      await this.getPagePermission().then(result => {

        if (typeof result == 'string') {
          // this.dialog.open(DialogComponent, {
          //   data: { message: result }
          // })

          this.sharedService.exitSystemEvent(result);
          return false;
        }

        // if (result.err != -1) {
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];
        this.permissionMenuList = result['obj'][3];




        /**
         *  0--> no access
            1--> access
            2--> read only
         */




        this.permissionMenuList.forEach(element => {


          if (element['PageName'] === route.routeConfig.path && (element['AccessLevel'] === 1 || element['AccessLevel'] === 2)) {



            if (element['PageName'] == 'IFrame') {

              if (result.obj[5].WorkWithIframe == '0') {
                return false;
              }


            }

            this.sharedService.pagesAccessLevel.next(JSON.stringify({ PageName: element['PageName'], AccessLevel: element['AccessLevel'].toString() }));
            this.canActivatePath = true;
          }
          else {

          }
        });
        // }
        // else {
        //   this.sharedService.exitSystemEvent();
        // }
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

        // this.router.navigate(['/public/home']);
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
