import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DataServiceService } from 'src/app/data-service.service';
import { ActivatedRoute, RouterLinkActive } from '@angular/router';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../shared.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-digital-files-list',
  templateUrl: './digital-files-list.component.html',
  styleUrls: ['./digital-files-list.component.css']
})
export class DigitalFilesListComponent implements OnInit {
  
  public excelFilesDataSource: MatTableDataSource<any>;
  public linksList = [
    {linkName: 'fileName', linkSrc: 'fileSrc', downloadFile: true}, // linkName parametr inside data for table
    {linkName: 'chargingNumber', linkSrc: 'fileSrc', downloadFile: false},//linkSrc parametr inside data for table
  ];

  userToken;
  spinner: boolean = false;
  digitalFiles;
  filename: string = "";
  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = [];

  excelFilesLabelForTable = [
    {value: 'chargingNumber', viewValue: 'מספר טעינה'},
    {value: 'fileDesc', viewValue: 'תאור הקובץ'},
    {value: 'dateOfAbs', viewValue: 'תאריך קליטה'},
    {value: 'fileName', viewValue: 'שם הקובץ'}
  ];

  constructor(private dataService: DataServiceService,
    private activateRoute: ActivatedRoute,
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

        // if (result.errdesc == 'OK') {
        //   this.dialog.open(DialogComponent, {
        //     data: {message: result }
        //   });
        // }
        if(result.errdesc != 'OK'){
          this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
        } 

        if (typeof result == 'object' && result.obj != null && result.obj.length > 0) {
          this.digitalFiles = result['obj'];
          this.excelFilesDataSource = result['obj'];
          console.log(" this.digitalFiles", this.digitalFiles);

          if (typeof result == 'object' && result.obj != null) {
            // this.dataSourceSpare.data = result['obj'];
            this.dataSource.data = result['obj'];
            // Object.keys(this.Report1Form.value).forEach(val => {
            //   if (this.Report1Form.get(val).value != '') {
            //     objToApi[val] = this.Report1Form.get(val).value;
            //   }
            // })

            this.digitalFiles.forEach(val => {
              console.log("val",val);
              var newArr = [];
              newArr.push(val);
              // val.FilePath.forEach(ele => {
              // this.filename = ele.replace(/^.*[\\\/]/, '');
              // console.log("filename",this.filename);
              // })
              newArr.filter(obj => {
                obj.forEach(val => {
              console.log("val",val);
               this.filename = val.FilePath.replace(/^.*[\\\/]/, '');
                })
              // console.log("filename",this.filename);
              // return obj.FilePath
            })
          })
            // console.log("newArr",newArr);

            // newArr.forEach(val => {
            //   console.log("val",val);

            //   var filename = val.replace(/^.*[\\\/]/, '');
            //   console.log("filename",filename);

            // })
            // let filePath = result['obj']
            // var filename = fullPath.replace(/^.*[\\\/]/, '')

          }

          // if (this.userId != undefined && this.indexId != undefined) {
          //   this.Report1Form.controls['customer'].setValue(this.fillteringUserData(this.userId));
          //   this.Report2Form.controls['customer'].setValue(this.fillteringUserData(this.userId));
          //   this.Report3Form.controls['customer'].setValue(this.fillteringUserData(this.userId));
          // }
          // else {
          //   this.indexId = 0;
          // }
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
        // else if (typeof result == 'object' && result['obj'] == null) {
        //     this.errorMsg = 'No Data Found';
        //     setTimeout(() => {
        //       this.errorMsg = '';
        //     }, 3000);
        //   }
      }

    });

    // this.excelFilesDataSource = new MatTableDataSource([
    //   {chargingNumber: '210310113118', fileDesc: 'תאור הקובץ 1', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113118.xls'},
    //   {chargingNumber: '210310113119', fileDesc: 'תאור הקובץ 2', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113119.xls'},
    //   {chargingNumber: '210310113120', fileDesc: 'תאור הקובץ 3', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113120.xls'},
    //   {chargingNumber: '210310113121', fileDesc: 'תאור הקובץ 4', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113121.xls'},
    //   {chargingNumber: '210310113122', fileDesc: 'תאור הקובץ 5', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113122.xls'},
    //   {chargingNumber: '210310113123', fileDesc: 'תאור הקובץ 6', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113123.xls'},
    //   {chargingNumber: '210310113124', fileDesc: 'תאור הקובץ 7', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113124.xls'},
    //   {chargingNumber: '210310113125', fileDesc: 'תאור הקובץ 8', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113125.xls'},
    //   {chargingNumber: '210310113126', fileDesc: 'תאור הקובץ 9', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113126.xls'},
    //   {chargingNumber: '210310113127', fileDesc: 'תאור הקובץ 10', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113127.xls'},
    //   {chargingNumber: '210310113128', fileDesc: 'תאור הקובץ 11', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113128.xls'},
    //   {chargingNumber: '210310113129', fileDesc: 'תאור הקובץ 12', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113129.xls'},
    //   {chargingNumber: '210310113130', fileDesc: 'תאור הקובץ 13', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113130.xls'},
    //   {chargingNumber: '210310113131', fileDesc: 'תאור הקובץ 14', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113131.xls'},
    //   {chargingNumber: '210310113132', fileDesc: 'תאור הקובץ 15', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113132.xls'},
    //   {chargingNumber: '210310113133', fileDesc: 'תאור הקובץ 16', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113133.xls'},
    // ]);
  }

  
}
