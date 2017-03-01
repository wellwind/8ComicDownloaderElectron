import { OnChanges, Directive, Input, ElementRef } from '@angular/core';
declare var $: any;

@Directive({
  selector: '[appFocusMe]'
})
export class FocusMeDirective implements OnChanges {

  @Input() appFocusMe = false;

  constructor(private elementRef: ElementRef) { }

  ngOnChanges() {
    if (this.appFocusMe) {
      this.scrollIntoView(this.elementRef.nativeElement, '#comicUrlsList');
    }
  }

  // scroll to view refenence:
  // http://stackoverflow.com/questions/1805808/how-do-i-scroll-a-row-of-a-table-into-view-element-scrollintoview-using-jquery
  scrollIntoView(element, container) {
    const containerTop = $(container).scrollTop();
    const containerBottom = containerTop + $(container).height();
    const elemTop = element.offsetTop;
    const elemBottom = elemTop + $(element).height();
    if (elemTop < containerTop) {
      $(container).scrollTop(elemTop);
    } else if (elemBottom > containerBottom) {
      $(container).scrollTop(elemBottom - $(container).height());
    }
  }
}
