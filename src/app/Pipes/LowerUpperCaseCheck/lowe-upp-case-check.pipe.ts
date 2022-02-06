import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'loweUppCaseCheck'
})
export class LoweUppCaseCheckPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {

    return null;
  }

}
