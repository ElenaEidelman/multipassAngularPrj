import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-all-sms-templates',
  templateUrl: './all-sms-templates.component.html',
  styleUrls: ['./all-sms-templates.component.css']
})
export class AllSmsTemplatesComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  templatesSMS = [
    {id: 0, tempName: '1קבוע', format: ''},
    {id: 1, tempName: '2קבוע', format: ''},
    {id: 2, tempName: '3קבוע', format: ''},
    {id: 3, tempName: '4קבוע', format: ''},
    {id: 4, tempName: '5קבוע', format: ''},
  ];

  openNewTemplate: boolean = false;
  edit: boolean = false;

  editingTempId: number;

  constructor() { }

  testTRV = []

  ngOnInit(): void {
  }

  addNewTemplate(){
    this.openNewTemplate = !this.openNewTemplate;
  }
  editTemplate(event, template){
    this.edit = !this.edit;
    this.editingTempId = template.id;
  }

}
