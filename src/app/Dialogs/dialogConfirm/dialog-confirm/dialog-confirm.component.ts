import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface ConfirmData{
  question: string;
}

@Component({
  selector: 'app-dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
  styleUrls: ['./dialog-confirm.component.css']
})
export class DialogConfirmComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmData,
              public dialogRef: MatDialogRef<DialogConfirmComponent>) { }

  yesButtonName = 'כן';
  noButtonName = 'לא'; 
  formTitle = '';

  ngOnInit(){
  }

  yes(){
    this.dialogRef.close({result: 'yes'}); 
  }
  no(){
    this.dialogRef.close({result: 'no'});
  }
  close(){
    this.dialogRef.close();
  }

}
