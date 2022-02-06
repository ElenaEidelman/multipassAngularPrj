import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[Max10Dig]'
})
export class Max10DigDirective {

  @Output() valueChange = new EventEmitter()
  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {

    const lengthVal = this._el.nativeElement.value.length;
    // const newValue = initalValue.replace(/[^0-9]*/g, '');
    //    this._el.nativeElement.value = newValue;
    //    this.valueChange.emit(newValue);
    if (lengthVal == 10) {
      event.stopPropagation();
    }
  }
}
