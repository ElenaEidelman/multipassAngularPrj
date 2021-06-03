import { Route } from '@angular/compiler/src/core';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router, Routes } from '@angular/router';


export interface DialogData {
  data: string;
}

@Component({
  selector: 'app-admin-log-in',
  templateUrl: './admin-log-in.component.html',
  styleUrls: ['./admin-log-in.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AdminLogInComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AdminLogInComponent>, 
              @Inject(MAT_DIALOG_DATA) public data: DialogData, 
              private route: Router) { }

  ngOnInit(): void {
  }

  dialogClose(){
    this.dialogRef.close();
  }

  toAdmin(){
    this.route.navigate(['public/admin']);
    this.dialogClose();
  }
}
