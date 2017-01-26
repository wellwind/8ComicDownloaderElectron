/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ComicDownloadListComponent } from './comic-download-list.component';

describe('ComicDownloadListComponent', () => {
  let component: ComicDownloadListComponent;
  let fixture: ComponentFixture<ComicDownloadListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComicDownloadListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComicDownloadListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
