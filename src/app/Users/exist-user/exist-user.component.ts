import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';
import { ActivatedRoute } from '@angular/router';

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
    fullName: (''),
    status: (''),
    email: (''),
    systemUserId: (''),
    password: (''),
    empNumber: (''),
    phoneNumber: (''),
    city: (''),
    additionalPhoneNumber: (''),
    street: (''),
    userStat: (''),
    Zcode: (''),
    permiss: (''),
    appNumber: ('')
  });
  
  constructor(private activeRoute: ActivatedRoute, private fb: FormBuilder) { }



  ngOnInit(): void {
    //debugger
    this.idUnsubscribe = this.activeRoute.params.subscribe( param => {
      //debugger
      //this.createDataSourceForTable();
      this.id = param['id'];
      this.userData = this.getUserDataById(param['id']);
      this.fillFormOfUserData(this.userData);
    })
  }

  getUserDataById(id){
    let user = [
      {id: '2523', fullName: 'fName lName 1', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2524', fullName: 'fName lName 2', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2525', fullName: 'fName lName 3', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2526', fullName: 'fName lName 4', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2527', fullName: 'fName lName 5', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''},
      {id: '2528', fullName: 'fName lName 6', empNumber: '1578569', email: 'test@gmail.com', phone: '052-3438921', status: 'פעיל', delUser: ''}
    ];

    return user.filter(userById => userById.id == id)[0];
  }

  fillFormOfUserData(user){
    
    debugger
  }

}
