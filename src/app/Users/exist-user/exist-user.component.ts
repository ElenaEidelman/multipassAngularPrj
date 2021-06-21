import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';
import { DataServiceService } from 'src/app/data-service.service';

@Component({
  selector: 'app-exist-user',
  templateUrl: './exist-user.component.html',
  styleUrls: ['./exist-user.component.css']
})
export class ExistUserComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  userData;
  idUnsubscribe;
  id;
  fullNameUser;

  userToken;

  statusList = [
    {value: 'nextTo', viewValue: 'ליד'},
    {value: 'pending', viewValue: 'ממתין לאישור'},
    {value: 'active', viewValue: 'פעיל'},
    {value: 'delayed', viewValue: 'מושהה'},
    {value: 'refused', viewValue: 'מסורב'},
    {value: 'deleted', viewValue: 'מחוק'},
  ];
  userStat = [
    {value: 'admin', viewValue: 'אדמין'},
    {value: 'suppliers', viewValue: 'ספקים/מלונות'},
    {value: 'managerBO', viewValue: 'מנהל בק אופיס'},
    {value: 'company', viewValue: 'חברה'},
    {value: 'AuthoRecTickets', viewValue: 'מורשה קבלת כרטיסים'},
    {value: 'AuthoRecSecondOrd', viewValue: 'מורשה לקבל הזמנה שני'},
    {value: 'PrintHouse', viewValue: 'בית דפוס'}
  ];

  userDataForm = this.fb.group({
    FullName: (''),
    status: (''),
    Email: (''),//
    UserType: (''),//
    Password: (''),//
    Id: (''),//
    Phone: (''),//
    CityName: (''),//
    Phone1: (''),//
    Streetno: (''),//
    Role: (''),//
    ZIP: (''),//
    Permission: (''),
    ApartmentNo: ('')

  });
  /**
   * 
"Token":"IX_XFPHFaSg_B49tuiJwaZGrvjMMpFullName1Ozhx1SFnc2Qpg1", 
"Id":"2697",
"FullName":"Fname Lname",
"Email": "yuvi@16",
"Phone": "9876543",
 "Phone1" : " ",
"Tz": "1006",
"Password" : "txtPasswordnew",
 "Address" : "txtAddress", 
"Streetno" : "txtStreetno",
"ApartmentNo":"1004",
"OrganizationName" : "יינות ביתן",
"ZIP" : "txtZIP", 
"Permission" : "משתשמ משרד אחורי",
 "BusinessFile" : "", 
"CityName":"txtCityName.Text",
"StatusId" : "1", 
"UserType" : "6"
   */
  
  constructor(private activeRoute: ActivatedRoute, private fb: FormBuilder, private dataService: DataServiceService) { }



  ngOnInit(): void {
    window.scroll(0,0);
    debugger
    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
      //debugger
      //this.createDataSourceForTable();
      if(Object.keys(param).length > 0){
        this.id = param['id'];
        this.userData = this.getUserDataById(param['id']);
        debugger
        this.fillFormOfUserData(this.userData);
      }
      else{

      }
    })

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

  }

  getUserDataById(id){
    let user = [
      {id: '2523', fullName: 'fName lName 1', empNumber: '1578569', Email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2524', fullName: 'fName lName 2', empNumber: '1578569', Email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2525', fullName: 'fName lName 3', empNumber: '1578569', Email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2526', fullName: 'fName lName 4', empNumber: '1578569', Email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2527', fullName: 'fName lName 5', empNumber: '1578569', Email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2528', fullName: 'fName lName 6', empNumber: '1578569', Email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''}
    ];

    return user.filter(userById => userById.id == id)[0];
  }

  fillFormOfUserData(user){
    
    debugger
  }

  saveData(){
    debugger

    this.userDataForm.value['Token'] = this.userToken;

    this.dataService.InsertUpdateUser(this.userDataForm.value).subscribe(result => {
      debugger
    });
  }

}
