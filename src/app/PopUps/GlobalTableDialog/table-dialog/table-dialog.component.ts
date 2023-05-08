import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { DialogWithTableDataComponent } from 'src/app/Cards/order-cards/Dialogs/dialog-with-table-data/dialog-with-table-data.component';

export interface DialogData {
  title: any,
  subTitle: any,
  message: any,
  data_Source: any,
  dataLabelsList: any

}

@Component({
  selector: 'app-table-dialog',
  templateUrl: './table-dialog.component.html',
  styleUrls: ['./table-dialog.component.css']
})
export class TableDialogComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource = new MatTableDataSource([]);

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogWithTableDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    // private route: Router
  ) { }

  ngOnInit(): void {
    debugger
    this.dataSource.data = this.data.data_Source;

  }

  dialogClose() {
    this.dialogRef.close();
  }
  yes() {
    this.dialogRef.close({ result: 'yes' });
  }
  no() {
    this.dialogRef.close({ result: 'no' });
  }

  // returnHebTranslation(val) {
  //   let obj = [
  //     { engLabel: 'FirstName', hebLabel: 'שם' },
  //     { engLabel: 'LastName', hebLabel: 'שם משפחה' },
  //     { engLabel: 'Cellular', hebLabel: 'טלפון' },
  //     { engLabel: 'Amount', hebLabel: 'סכום' },
  //   ];
  //   return obj.filter(obj => obj.engLabel == val)[0]['hebLabel'];
  // }

}
