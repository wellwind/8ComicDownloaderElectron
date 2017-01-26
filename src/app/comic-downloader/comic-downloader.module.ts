import { ComicDownloaderService } from './comic-downloader.service';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComicDownloaderComponent } from './comic-downloader/comic-downloader.component';
import { ComicFolderComponent } from './comic-folder/comic-folder.component';
import { ComicListComponent } from './comic-list/comic-list.component';
import { ComicDownloadListComponent } from './comic-download-list/comic-download-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: [
    ComicDownloaderService
  ],
  declarations: [ComicDownloaderComponent, ComicFolderComponent, ComicListComponent, ComicDownloadListComponent],
  exports: [
    ComicDownloaderComponent
  ]
})
export class ComicDownloaderModule { }
