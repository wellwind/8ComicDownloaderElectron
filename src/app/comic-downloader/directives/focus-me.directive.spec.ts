import { FocusMeDirective } from './focus-me.directive';

describe('FocusMeDirective', () => {
  it('should do scrollIntoView whne appFocusMe is true', () => {
    const directive = new FocusMeDirective({nativeElement: {}});
    spyOn(directive, 'scrollIntoView');

    directive.appFocusMe = true;
    directive.ngOnChanges();

    expect(directive.scrollIntoView).toHaveBeenCalled();
  });
});
