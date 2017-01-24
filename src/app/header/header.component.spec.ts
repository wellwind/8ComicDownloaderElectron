/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ElectronService } from './../shared/services/electron.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {

    const electronServiceStub = {
      getAppVersion: () => {}
    };

    TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      providers: [
        { provide: ElectronService, useValue: electronServiceStub }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;

    const electronServiceStub = TestBed.get(ElectronService);
    spyOn(electronServiceStub, 'getAppVersion').and.returnValue('any version');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title', () => {
    const expected = '8Comic下載器 - Ver any version';
    const actual = fixture.debugElement.nativeElement.querySelector('h1').textContent.trim();

    expect(expected).toBe(actual);
  });
});
