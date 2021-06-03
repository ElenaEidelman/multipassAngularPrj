export class OrderData {
    orderId: string;
    orderiDcrm: number;
    customerName: string;
    customerId:string;
    comaxFileId: number;
    ticketCount: number;
    dateCreation: string;
    dateIssue: string;
    orderValue: string;
    orderStatus:string;
    orderStatusId: number;
  
  
    constructor(orderId: string, 
                orderiDcrm: number, 
                customerName: string, 
                customerId: string,
                comaxFileId: number, 
                ticketCount: number, 
                dateCreation: string,
                dateIssue: string,
                orderValue: string,
                orderStatus: string,
                orderStatusId: number){
      this.orderId = orderId;
      this.orderiDcrm = orderiDcrm;
      this.customerName = customerName;
      this.customerId = customerId;
      this.comaxFileId = comaxFileId;
      this.ticketCount = ticketCount;
      this.dateCreation = dateCreation;
      this.dateIssue = dateIssue;
      this.orderValue = orderValue;
      this.orderStatus = orderStatus;
      this.orderStatusId = orderStatusId;
  
    }
  }