import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnInit {

  @Input() dataLabelsList;
  @Input() data_Source;
  @Input() linksList;

  displayedColumns: string[] = [];
  dataSource;
  links;

  
  linkURL: string = ''
  downloadFile: string = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;



  constructor() { }


  ngOnInit(): void {

    this.links = this.linksList;
    //debugger
    if(this.dataLabelsList != undefined){
      this.createDisplayedColumns(this.dataLabelsList);
    }
    if(this.data_Source != undefined){
      this.dataSource = this.data_Source;
    }

  }

  createDisplayedColumns(columns){
    columns.forEach( el => {
      this.displayedColumns.unshift(el.value);
    });
  }
  
  returnHebTranslation(obj,value){
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  translateTitles(){
    document.querySelectorAll('.mat-paginator-page-size-label').forEach(title => {
      title.innerHTML = 'פריטים פר עמוד';
    });
  }

  checkIfLink(rowData){
    let ifLink = false;
    //debugger
    if(this.links != undefined){
      this.links.forEach(element => {
        if(element.linkName == rowData){
          ifLink = true;
        }
      });
    }
    return ifLink;
  }

  returnUrl(url){
    return this.links.filter(el => el.linkName == url)[0].linkSrc;
  }
  checkIfDownload(data){
    return this.links.filter(el => el.linkName == data)[0].downloadFile;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.translateTitles();
  }
}
