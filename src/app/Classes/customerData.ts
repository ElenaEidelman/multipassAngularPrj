export class CustomerData {
    customerName: string;
    customerId: string;
    orders: string;
    status: string;
    constructor(customerName: string, customerId: string, orders: string, status: string){
      this.customerName = customerName;
      this.customerId = customerId;
      this.orders = orders;
      this.status = status;
  
    }
  }