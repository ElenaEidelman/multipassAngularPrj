import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';


export interface DialogData{
  imgSrc: string
}

@Component({
  selector: 'app-preview-img',
  templateUrl: './preview-img.component.html',
  styleUrls: ['./preview-img.component.css']
})
export class PreviewIMGComponent implements OnInit {

  constructor(
              public dialog: MatDialog,
              public dialogRef: MatDialogRef<PreviewIMGComponent>, 
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
