import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';


export interface changePinCodDialogData {
  pinCode: '',
  element: '',
  control: ''
}


@Component({
  selector: 'app-change-pin-code-dialog',
  templateUrl: './change-pin-code-dialog.component.html',
  styleUrls: ['./change-pin-code-dialog.component.css']
})
export class ChangePinCodeDialogComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ChangePinCodeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: changePinCodDialogData,
    private route: Router
  ) {
    // this.setCalendarFilter();
  }

  validity = new FormControl()


  ngOnInit(): void {
  
    this.validity.setValue(this.data.pinCode);//new Date
  }

  dialogClose() {
    this.dialogRef.close();
  }

  select() {
    this.dialogRef.close({
      result: {
        pinCode: this.validity.value,
        element: this.data.element,
        control: this.data.control
      },
    });
  }

}
