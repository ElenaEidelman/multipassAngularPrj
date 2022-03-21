import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { DataServiceService } from '../data-service.service';






@Injectable({
  providedIn: 'root'
})
export class LoginGuardGuard implements CanActivate {

  constructor(private router: Router, private dataService: DataServiceService) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    let userData = localStorage.getItem('user');
    if (userData != null
      && Object.keys(JSON.parse(userData)).includes('obj')
      && Object.keys(JSON.parse(userData)).includes('Token')
      && JSON.parse(userData).obj != null) {
      return true;
    }
    else {
      this.router.navigate(['logIn']);
      return false;
    }
  }

}
