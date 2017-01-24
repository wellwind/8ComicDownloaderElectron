import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComicDownloaderComponent } from './comic-downloader/comic-downloader.component';
import { ComicFolderComponent } from './comic-folder/comic-folder.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  declarations: [ComicDownloaderComponent, ComicFolderComponent],
  exports: [
    ComicDownloaderComponent
  ]
})
export class ComicDownloaderModule { }
