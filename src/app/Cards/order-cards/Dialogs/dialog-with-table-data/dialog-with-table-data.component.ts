import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';



export interface DialogData {
  title: any,
  subTitle: any,
  message: any,
  data_Source: any,
  dataLabelsList: any

}

@Component({
  selector: 'app-dialog-with-table-data',
  templateUrl: './dialog-with-table-data.component.html',
  styleUrls: ['./dialog-with-table-data.component.css']
})
export class DialogWithTableDataComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource = new MatTableDataSource([]);

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
  }

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DialogWithTableDataComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private route: Router
  ) { }

  ngOnInit(): void {
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

  returnHebTranslation(val) {
    let obj = [
      { engLabel: 'FirstName', hebLabel: 'שם' },
      { engLabel: 'LastName', hebLabel: 'שם משפחה' },
      { engLabel: 'Cellular', hebLabel: 'טלפון' },
      { engLabel: 'Amount', hebLabel: 'סכום' },
    ];
    return obj.filter(obj => obj.engLabel == val)[0]['hebLabel'];
  }
}
