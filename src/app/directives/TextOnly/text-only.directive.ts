import { Directive, ElementRef, EventEmitter, HostListener, Output } from '@angular/core';

@Directive({
  selector: '[TextOnly]'
})
export class TextOnlyDirective {


  @Output() valueChange = new EventEmitter()
  constructor(private _el: ElementRef) { }

  @HostListener('input', ['$event']) onInputChange(event) {
    const initalValue = this._el.nativeElement.value;
    const newValue = initalValue.replace(/[^a-z, A-Z]*/g, '');
    // const newValue = initalValue.replace(/[^0-9,.]*/g, '');
    this._el.nativeElement.value = newValue;
    this.valueChange.emit(newValue);
    if (initalValue !== this._el.nativeElement.value) {
      event.stopPropagation();
    }
  }

}
