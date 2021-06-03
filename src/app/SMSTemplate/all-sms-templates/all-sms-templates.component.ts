import { Component, ElementRef, Input, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, NgControl } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-all-sms-templates',
  templateUrl: './all-sms-templates.component.html',
  styleUrls: ['./all-sms-templates.component.css']
})
export class AllSmsTemplatesComponent implements OnInit {

  @ViewChildren("txtArea") textAreas:QueryList<ElementRef>;

  @ViewChild(MatAccordion) accordion: MatAccordion;
  @ViewChild('newTemplate') newTemplate: ElementRef;




  templatesSMS = [
    {id: 0, tempName: '1קבוע', senderName: 'sender', format: 'שלום'},
    {id: 2, tempName: '3קבוע', senderName: 'sender', format: ''},
    {id: 3, tempName: '4קבוע', senderName: 'sender', format: ''},
    {id: 4, tempName: '5קבוע', senderName: 'sender', format: ''},
  ];

  // SMSTemplatesForm = this.fb.group({});
  // SMSTitlesForm = this.fb.group({});

  newTemplateForm = this.fb.group({
    name: (''),
    senderName: (''),
    template: ('')
  });
  SMSForm = this.fb.group({});



  openNewTemplate: boolean = false;
  edit: boolean = false;

  editingTempId: number;

  saveMessage:string = '';


  constructor(private fb: FormBuilder) { }


  ngOnInit(): void {
    window.scroll(0,0);
    this.createForm('SMSForm', this.templatesSMS, 'id-');
  }



  createForm(form, values, controlName){
    this[form] = this.fb.group({});
    values.forEach((value) => {
      let group = this.fb.group({});
      group.addControl('template' + value.id, this.fb.control(value.format));
      group.addControl('senderName' + value.id, this.fb.control(value.senderName));
      group.addControl('name' + value.id, this.fb.control(value.tempName));
      this[form].addControl(controlName + value.id, this.fb.group(group.value));
    });

    //disable all inputs
    Object.keys(this.SMSForm.value).forEach((el, i) => {
      Object.keys(this.SMSForm.get(el).value).forEach( (control, index) => {
        this.SMSForm.get(el).get(control).disable();
      })
    })
  }

  addNewTemplate(){
    this.openNewTemplate = !this.openNewTemplate;
  }

  saveTemplate(template){
    if(template != 'newTemplate'){
      this.edit = !this.edit;
      this.editingTempId = -1;
      this.SMSForm.get('id-' + template.id).get('template' + template.id).disable();
      this.SMSForm.get('id-' + template.id).get('senderName' + template.id).disable();
      this.SMSForm.get('id-' + template.id).get('name' + template.id).disable();
    }
    else{
      //templatesSMS
      //{id: 0, tempName: '1קבוע', format: 'שלום'},

      this.templatesSMS.unshift({
        id: this.templatesSMS.length, 
        tempName: this.newTemplateForm.get('name').value, 
        senderName: this.newTemplateForm.get('senderName').value, 
        format: this.newTemplateForm.get('template').value
      });

      this.newTemplateForm.get('name').setValue('');
      this.newTemplateForm.get('senderName').setValue('');
      this.newTemplateForm.get('template').setValue('');

      this.saveMessage = 'נשמר בהצלחה';

      setTimeout(()=> {
        this.saveMessage = '';
      },3000);
      this.createForm('SMSForm', this.templatesSMS, 'id-');

    }
  }

  editTemplate(template){
    this.edit = !this.edit;
    this.editingTempId = template.id;
    this.SMSForm.get('id-' + template.id).get('template' + template.id).enable();
    this.SMSForm.get('id-' + template.id).get('senderName' + template.id).enable();
    this.SMSForm.get('id-' + template.id).get('name' + template.id).enable();
  }
  editButtonClicked(obj,buttonName){
    //debugger

    if(obj != ''){
    // fill textArea
    let valueTA = this.SMSForm.get('id-' + obj.id).get('template' + obj.id).value;
    let textAreaValue = valueTA != null ? valueTA : '';
    this.SMSForm.get('id-' + obj.id).get('template' + obj.id).setValue(textAreaValue + ' <' + buttonName + '>');

    //focus text area
    this.textAreas.find((item, idx) => {
      //debugger
      return idx === obj.id;
    }).nativeElement.focus();
    }

    //if new template
    else{
      let valueTA = this.newTemplateForm.get('template').value;
      let textAreaValue = valueTA != null ? valueTA : '';
      this.newTemplateForm.get('template').setValue(textAreaValue + ' <' + buttonName + '>');

      //focus text area
      this.newTemplate.nativeElement.focus()
    }


  }

}
