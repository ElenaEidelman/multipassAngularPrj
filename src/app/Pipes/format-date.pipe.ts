import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    if(value != undefined){
      let date = new Date(value.toString());
      let day = date.getDay() < 10 ? '0' + date.getDay() : date.getDay();
      let month = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
      let year = date.getFullYear();
      return day + '/' + month + '/' + year;
    }
    else{
      return value;
    }
  }

}
