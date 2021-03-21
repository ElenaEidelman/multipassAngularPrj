export class OrderData {
    orderId: string;
    orderiDcrm: number;
    companyName: string;
    companyId:string;
    comaxCustomerNumber: number;
    comaxFileId: number;
    ticketCount: number;
    dateCreation: string;
    dateIssue: string;
    dateActivation: string;
    orderValue: string;
    orderStatus:string;
    orderStatusId: number;
  
  
    constructor(orderId: string, 
                orderiDcrm: number, 
                companyName: string, 
                companyId: string,
                comaxCustomerNumber: number, 
                comaxFileId: number, 
                ticketCount: number, 
                dateCreation: string,
                dateIssue: string,
                dateActivation: string,
                orderValue: string,
                orderStatus: string,
                orderStatusId: number){
      this.orderId = orderId;
      this.orderiDcrm = orderiDcrm;
      this.companyName = companyName;
      this.companyId = companyId;
      this.comaxCustomerNumber = comaxCustomerNumber;
      this.comaxFileId = comaxFileId;
      this.ticketCount = ticketCount;
      this.dateCreation = dateCreation;
      this.dateIssue = dateIssue;
      this.dateActivation = dateActivation;
      this.orderValue = orderValue;
      this.orderStatus = orderStatus;
      this.orderStatusId = orderStatusId;
  
    }
  }