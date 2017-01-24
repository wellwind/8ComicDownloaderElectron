import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComicDownloaderComponent } from './comic-downloader/comic-downloader.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [ComicDownloaderComponent],
  exports: [
    ComicDownloaderComponent
  ]
})
export class ComicDownloaderModule { }
