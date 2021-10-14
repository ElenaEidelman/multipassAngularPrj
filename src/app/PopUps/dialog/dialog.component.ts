import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';


export interface DialogData{
  title: any,
  subTitle: any,
  message: any

}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css']
})
export class DialogComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
              public dialogRef: MatDialogRef<DialogComponent>, 
              @Inject(MAT_DIALOG_DATA) public data: DialogData, 
              private route: Router
  ) { }

  ngOnInit(): void {
    
  }

  dialogClose(){
    this.dialogRef.close();
  }
  yes(){
    this.dialogRef.close({result: 'yes'}); 
  }
  no(){
    this.dialogRef.close({result: 'no'});
  }

}
