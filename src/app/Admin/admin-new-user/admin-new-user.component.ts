import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators,FormGroup } from '@angular/forms';
import { MatAccordion } from '@angular/material/expansion';

@Component({
  selector: 'app-admin-new-user',
  templateUrl: './admin-new-user.component.html',
  styleUrls: ['./admin-new-user.component.css']
})
export class AdminNewUserComponent implements OnInit {

  @ViewChild(MatAccordion) accordion: MatAccordion;

  newUserGroupForm = this.fb.group({
    userData : this.fb.group({
      Fname: (''),
      Lname: (''),
      Email: ['', Validators.email],
      Password: (''),
      Phone: (''),
      Phone1: (''),
      Fax: (''),
      Address: (''),
      UserTypeDesc: (''),
      ZIP: (''),
      CityId: (''),
      CityName: (''),
      AreaId: (''),
      Address2: (''),
      CityId2: (''),
      CityName2: (''),
      AreaId2: (''),
      ZIP2: (''),
      UserType:(''),
      Tz: (''),
      NameInSite: (''),
      Logo: (''),
      Image: (''),
      ExternalId: (''),
      DealerPaymentCondition: (''),
      DealerItemPriceListId: (''),
      DealerCredit: (''),
      DealerDiscountPercent: (''),
      OrganizationName: (''),
      Website: (''),
      Priority: (''),
      ClubType: (''),
      ShowInSite: (''),
      AcceptNewsLetter: (''),
      Latitude: (''),
      Longitude: (''),
      SEO_H1Title: (''),
      SEO_KeyWords: (''),
      ComaxNumber: (''),
      PosNo: (''),
      Role: (''),
      BusinessFile: (''),
      BusinessValidDate: (''),
      LastPassUpdated: (''),
      Streetno: (''),
      DealerContactInYbitanb2b: (''),
      ApartmentNo: (''),
      Entrance: (''),
      Floor: (''),
      Contactof: (''),
      TenantId : (''),
      MultipassClientId: ('')
    }),
    tenantData: this.fb.group({
      TenantId: (''),
      TenantDescription: (''),
      GroupDescription: (''),
      Image: ('')
    })
  });

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    
  }

}
