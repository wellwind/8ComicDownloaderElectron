import { ComicDownloaderModule } from './comic-downloader/comic-downloader.module';
import { SharedModule } from './shared/shared.module';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { DownloadStatusPipe } from './comic-downloader/comic-download-list/download-status.pipe';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DownloadStatusPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    SharedModule,
    ComicDownloaderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
