import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-digital-files-list',
  templateUrl: './digital-files-list.component.html',
  styleUrls: ['./digital-files-list.component.css']
})
export class DigitalFilesListComponent implements OnInit {
  
  public excelFilesLabelForTable;
  public excelFilesDataSource: MatTableDataSource<any>;
  public linksList = [
    {linkName: 'fileName', linkSrc: 'fileSrc', downloadFile: true}, // linkName parametr inside data for table
    {linkName: 'chargingNumber', linkSrc: 'fileSrc', downloadFile: false},//linkSrc parametr inside data for table
  ];

  constructor() { }

  ngOnInit(): void {
    this.getTableData();
  }

  getTableData(){
    this.excelFilesLabelForTable = [
      {value: 'chargingNumber', viewValue: 'מספר טעינה'},
      {value: 'fileDesc', viewValue: 'תאור הקובץ'},
      {value: 'dateOfAbs', viewValue: 'תאריך קליטה'},
      {value: 'fileName', viewValue: 'שם הקובץ'}
    ];
  
    this.excelFilesDataSource = new MatTableDataSource([
      {chargingNumber: '210310113118', fileDesc: 'תאור הקובץ 1', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113118.xls'},
      {chargingNumber: '210310113119', fileDesc: 'תאור הקובץ 2', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113119.xls'},
      {chargingNumber: '210310113120', fileDesc: 'תאור הקובץ 3', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113120.xls'},
      {chargingNumber: '210310113121', fileDesc: 'תאור הקובץ 4', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113121.xls'},
      {chargingNumber: '210310113122', fileDesc: 'תאור הקובץ 5', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113122.xls'},
      {chargingNumber: '210310113123', fileDesc: 'תאור הקובץ 6', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113123.xls'},
      {chargingNumber: '210310113124', fileDesc: 'תאור הקובץ 7', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113124.xls'},
      {chargingNumber: '210310113125', fileDesc: 'תאור הקובץ 8', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113125.xls'},
      {chargingNumber: '210310113126', fileDesc: 'תאור הקובץ 9', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113126.xls'},
      {chargingNumber: '210310113127', fileDesc: 'תאור הקובץ 10', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113127.xls'},
      {chargingNumber: '210310113128', fileDesc: 'תאור הקובץ 11', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113128.xls'},
      {chargingNumber: '210310113129', fileDesc: 'תאור הקובץ 12', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113129.xls'},
      {chargingNumber: '210310113130', fileDesc: 'תאור הקובץ 13', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113130.xls'},
      {chargingNumber: '210310113131', fileDesc: 'תאור הקובץ 14', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113131.xls'},
      {chargingNumber: '210310113132', fileDesc: 'תאור הקובץ 15', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113132.xls'},
      {chargingNumber: '210310113133', fileDesc: 'תאור הקובץ 16', dateOfAbs: '10/03/2021 11:31:22', fileName: 'file name', fileSrc: 'NewdigitalOrderonevalue_210310113133.xls'},
    ]);
  }
}
