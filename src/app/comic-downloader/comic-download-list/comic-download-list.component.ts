import { ComicImageDownloadStatus } from '../../shared/enums/comic-image-download-status.enum';
import { ComicImageInfo } from './../../shared/interfaces/comic-image-info';
import { ComicDownloaderService } from './../comic-downloader.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-comic-download-list',
  templateUrl: './comic-download-list.component.html',
  styleUrls: ['./comic-download-list.component.css']
})
export class ComicDownloadListComponent implements OnInit {
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
