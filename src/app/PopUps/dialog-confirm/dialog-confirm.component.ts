import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

export interface DialogData{
  message: any,
  eventButton: any
}
@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DialogConfirmComponent implements OnInit {

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<DialogConfirmComponent>, 
              @Inject(MAT_DIALOG_DATA) public data: DialogData, 
              private route: Router) { }

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

