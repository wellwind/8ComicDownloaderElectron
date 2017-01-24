import { BrowserModule } from '@angular/platform-browser';
import { ElectronService } from './services/electron.service';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    BrowserModule,
    CommonModule
  ],
  declarations: [
    ProgressBarComponent
  ],
  providers: [
    ElectronService
  ],
  exports: [
    ProgressBarComponent
  ]
})
export class SharedModule { }
