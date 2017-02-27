import { ComicListComponent } from './../comic-list/comic-list.component';
import { ComicImageDownloadStatus } from '../../shared/enums/comic-image-download-status.enum';
import { ComicImageInfo } from './../../shared/interfaces/comic-image-info';
import { ComicDownloaderService } from './../comic-downloader.service';
import { Input, Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-comic-download-list',
  templateUrl: './comic-download-list.component.html',
  styleUrls: ['./comic-download-list.component.css']
})
export class ComicDownloadListComponent implements OnInit {
  @Input() getLastVols: number;

  downloadStatusEnum = ComicImageDownloadStatus;
  skipIfExist = true;
  downloading = false;

  constructor(private service: ComicDownloaderService) { }

  ngOnInit() {
  }

  getToDownloadImageList(): ComicImageInfo[] {
    return this.service.toDownloadComicImageList;
  }

  clearToDownloadImageList() {
    this.service.clearToDownloadImageList();
  }

  oneClickDownload() {
    let tasks: Promise<any>;
    (this.service.appSettings.comicList as any[]).forEach(comic => {
      if (tasks === undefined) {
        tasks = this.service.getImageList(comic.url, this.getLastVols);
      } else {
        tasks = tasks.then(() => this.service.getImageList(comic.url, this.getLastVols));
      }
    });

    tasks.then(() => this.startDownload());
  }

  toogleSkipIfExist() {
    this.skipIfExist = !this.skipIfExist;
  }

  startDownload() {
    if (this.service.toDownloadComicImageList !== undefined && this.service.toDownloadComicImageList.length > 0) {
      this.downloading = true;
      this.service.startDownload(this.skipIfExist).then(() => {
        alert('全部下載完成');
        this.downloading = false;
      });
    }
  }
}
