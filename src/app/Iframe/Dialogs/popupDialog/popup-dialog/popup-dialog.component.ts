import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';


export interface PopupDialog{
  title: '',
  text: ''
}

@Component({
  selector: 'app-popup-dialog',
  templateUrl: './popup-dialog.component.html',
  styleUrls: ['./popup-dialog.component.css']
})
export class PopupDialogComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<PopupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopupDialog,
    private route: Router
  ) {
  }

  ngOnInit(): void {
    let data = this.data;
    console.log(this.data)
    debugger
  }


  dialogClose() {
    this.dialogRef.close();
  }
}
