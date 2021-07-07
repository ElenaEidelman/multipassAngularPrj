import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-sms-template',
  templateUrl: './new-sms-template.component.html',
  styleUrls: ['./new-sms-template.component.css']
})
export class NewSmsTemplateComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    
    /**
     * Route:/api/SMS/CreateOrUpdateSMSTemplate
        Json: {
            "Token":"BHW6RE5gNkygs4EjlXCFyC8K8DKouFhkgCfEtAob2zA1",
            "TemplateId":62,
            "Format":"Update New Format 1110",
            "Description":"Create new SMS 0111"
        }
     */
  }

}
