import { DownloadStatusPipe } from './comic-download-list/download-status.pipe';
import { FormsModule } from '@angular/forms';
import { ComicDownloaderService } from './comic-downloader.service';
import { SharedModule } from './../shared/shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComicDownloaderComponent } from './comic-downloader/comic-downloader.component';
import { ComicFolderComponent } from './comic-folder/comic-folder.component';
import { ComicListComponent } from './comic-list/comic-list.component';
import { ComicDownloadListComponent } from './comic-download-list/comic-download-list.component';
import { FocusMeDirective } from './directives/focus-me.directive';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule
  ],
  providers: [
    ComicDownloaderService
  ],
  declarations: [
    ComicDownloaderComponent,
    ComicFolderComponent,
    ComicListComponent,
    ComicDownloadListComponent,
    DownloadStatusPipe,
    FocusMeDirective],
  exports: [
    ComicDownloaderComponent
  ]
})
export class ComicDownloaderModule { }
