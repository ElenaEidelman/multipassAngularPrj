import { AfterViewInit, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DataServiceService } from '../data-service.service';
import { DialogComponent } from '../PopUps/dialog/dialog.component';
import { SharedService } from '../Services/SharedService/shared.service';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.css']
})
export class SystemSettingsComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  userToken: string;
  dataSource = new MatTableDataSource([]);
  policyLabelForTable = [
    { value: 'POL_NAME', viewValue: 'שם פעילות' },
    { value: 'POL_ID', viewValue: 'קוד פעילות' },
    { value: 'POL_COMP', viewValue: 'CompanyId' }
  ];
  displayedColumns: string[] = [];
  constructor(
    private dataService: DataServiceService,
    private sharedService: SharedService,
    private dialog: MatDialog

  ) { }

  ngAfterViewInit() {
    if (this.dataSource != undefined) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  ngOnInit(): void {

    this.userToken = JSON.parse(localStorage.getItem('user'))['Token'];
    this.GetPoliciesByCompanyId();
    this.createDisplayedColumns(this.policyLabelForTable);
  }

  GetPoliciesByCompanyId() {

    let objToApi = {
      Token: this.userToken
    }

    this.dataService.GetPoliciesByCompanyId(objToApi).subscribe(result => {
      if (typeof result == 'string') {
        // this.sharedService.exitSystemEvent(result);
        return false;
      }
      //set new token
      let tempObjUser = JSON.parse(localStorage.getItem('user'));
      tempObjUser['Token'] = result['Token'];
      localStorage.setItem('user', JSON.stringify(tempObjUser));
      this.userToken = result['Token'];

      if (result['obj'] != null) {
        this.dataSource.data = result['obj'];
      }
      else {
        this.dialog.open(DialogComponent, {
          data: { message: result.errdesc }
        })
      }

    })
  }

  returnHebTranslation(obj, value) {
    return obj.filter(el => el.value == value)[0].viewValue;
  }

  createDisplayedColumns(columns) {
    columns.forEach(el => {
      this.displayedColumns.push(el.value);
    });
  }
}
