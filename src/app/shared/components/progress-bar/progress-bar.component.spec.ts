/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ProgressBarComponent } from './progress-bar.component';

describe('ProgressBarComponent', () => {
  let component: ProgressBarComponent;
  let fixture: ComponentFixture<ProgressBarComponent>;
  let progressBarDebug: DebugElement;
  let progressBar: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProgressBarComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    progressBarDebug = fixture.debugElement.query(By.css('.progress-bar'));
    progressBar = progressBarDebug.nativeElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should has default bar style `success`', () => {
    fixture.detectChanges();

    expect(progressBar.classList).toContain('progress-bar-success');
  });

  it('should be set bootstrap color class', () => {
    component.barStyle = 'info';
    fixture.detectChanges();

    expect(progressBar.classList).toContain('progress-bar-info');
  });

  xit('should has default progress percentage', () => {
    fixture.detectChanges();

    const ariaValueNow = progressBarDebug.attributes['aria-valuenow'];
    const progressBarWidthPercent = progressBarDebug.attributes['style'];

    expect(ariaValueNow).toBe('100');
    expect(progressBarWidthPercent).toContain('width: 100%');
  });

  xit('should be set progress percentage', () => {
    component.progress = 50;

    fixture.detectChanges();

    const ariaValueNow = progressBarDebug.attributes['aria-valuenow'];
    const progressBarWidthPercent = progressBarDebug.attributes['style'];

    expect(ariaValueNow).toBe('50');
    expect(progressBarWidthPercent).toContain('width: 50%');
  });
});
