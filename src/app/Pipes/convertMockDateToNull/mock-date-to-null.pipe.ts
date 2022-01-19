import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'mockDateToNull'
})
export class MockCodeToNullPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    debugger
    if (value != undefined || value != null) {
      let year = new Date(value.toString()).getFullYear().toString();
      if (new Date(value.toString()).getFullYear().toString() === '1753') {
        return null;
      }
      else {
        return value;
      }
    }
    else {
      return null;
    }
  }

}
