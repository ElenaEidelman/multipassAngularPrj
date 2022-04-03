import { AfterViewInit, Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DataServiceService } from 'src/app/data-service.service';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MsgList } from '../Classes/msgsList';
import { SharedService } from '../Services/SharedService/shared.service';
import { MockData } from '../Classes/mockData';

@Component({
  selector: 'app-digital-files-list',
  templateUrl: './digital-files-list.component.html',
  styleUrls: ['./digital-files-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DigitalFilesListComponent implements OnInit, AfterViewInit {
  //MatPaginator is keyword here
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  userToken;
  spinner: boolean = false;
  digitalFiles;
  filename: string = "";
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [];
  newArr: string[] = [];

  MockData = MockData;
  MsgList = MsgList;

  pagePermissionAccessLevel = {
    AccessLevel: '',
    PageName: ''
  }


  excelFilesLabelForTable = [
    { value: 'BatchNum', viewValue: 'מספר טעינה' },
    { value: 'Description', viewValue: 'תאור  ההזמנה' },
    { value: 'DateInsert', viewValue: 'תאריך קליטה' },
    { value: 'FilePath', viewValue: 'שם הקובץ' }
  ];

  constructor(private dataService: DataServiceService,
    private dialog: MatDialog,
    private sharedService: SharedService) { }

  ngOnInit(): void {
    window.scroll(0, 0);
    this.spinner = true;
    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];

    this.pagePermissionAccessLevel = this.sharedService.pagesAccessLevel.value.length > 0 ? JSON.parse(this.sharedService.pagesAccessLevel.value) : JSON.parse(JSON.stringify(this.pagePermissionAccessLevel));

    this.sharedService.pagesAccessLevel.next('');

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

  getTableData() {
    this.dataSource.data = [];
    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetDigitalFilesList(objToApi).subscribe(result => {

      this.spinner = false;
      if (typeof result == 'string') {
        // this.dialog.open(DialogComponent, {
        //   data: { message: result }
        // })

        this.sharedService.exitSystemEvent(result);
        return false;
      }

      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token']
      this.digitalFiles = result['obj'];

      this.newArr = this.digitalFiles.map(o => {
        return {
          FilePath: o.FilePath.replace(/^.*[\\\/]/, ''),
          BatchNum: o.BatchNum,
          Description: o.Description,
          DateInsert: o.DateInsert,
        }
      });
      this.dataSource.data = this.newArr
    });
  }

  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
}
