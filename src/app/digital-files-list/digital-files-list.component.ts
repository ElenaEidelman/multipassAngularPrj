import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../shared.service';

@Component({
  selector: 'app-digital-files-list',
  templateUrl: './digital-files-list.component.html',
  styleUrls: ['./digital-files-list.component.css']
})
export class DigitalFilesListComponent implements OnInit {
   
  userToken;
  spinner: boolean = false;
  digitalFiles;
  filename: string = "";
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [];
  newArr: string[] = [];

  excelFilesLabelForTable = [
    {value: 'chargingNumber', viewValue: 'מספר טעינה'},
    {value: 'fileDesc', viewValue: 'תאור הקובץ'},
    {value: 'dateOfAbs', viewValue: 'תאריך קליטה'},
    {value: 'fileName', viewValue: 'שם הקובץ'}
  ];

  constructor(private dataService: DataServiceService,
    private dialog: MatDialog,
    private sharedService: SharedService) { }

  ngOnInit(): void {
    window.scroll(0,0);
    this.spinner = true;
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.createDisplayedColumns(this.excelFilesLabelForTable);

    this.getTableData();
  }

  createDisplayedColumns(columns) {
    columns.forEach(el => {
      this.displayedColumns.push(el.value);
    });
  }

  returnHebTranslation(obj, value) {
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  getTableData(){
  
    let objToApi = {
      Token: this.userToken
    }
     
    this.dataService.GetDigitalFilesList(objToApi).subscribe(result => {
      this.spinner = false;
      if (result['Token'] != undefined || result['Token'] != null) {
        //set new token
        let tempObjUser = JSON.parse(localStorage.getItem('user'));
        tempObjUser['Token'] = result['Token'];
        localStorage.setItem('user', JSON.stringify(tempObjUser));
        this.userToken = result['Token'];

        if(result.errdesc != 'OK'){
          this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        } 

        if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
          this.digitalFiles = result['obj'];
  
          this.newArr = this.digitalFiles.map(o => {
            return { FilePath: o.FilePath.replace(/^.*[\\\/]/, '').split('.')[0],
            BatchNum: o.BatchNum,
            Description: o.Description,
            DateInsert: o.DateInsert,
            };
          });

          if (typeof result == 'object' && result.obj != null) {
            this.dataSource.data = this.newArr;
         }
        }
        else if(typeof result == 'string'){
          this.dialog.open(DialogComponent, {
            data: {message: result}
          });
        }
        else {
          this.dialog.open(DialogComponent, {
            data: { message: result.errdesc }
          })
          this.sharedService.exitSystemEvent();
        }
      }
    });
  }
}
