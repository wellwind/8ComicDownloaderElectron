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

  constructor(private service: ComicDownloaderService) { }

  ngOnInit() {
  }

  getToDownloadImageList(): ComicImageInfo[] {
    return this.service.toDownloadComicImageList;
  }

  getDownloadStatusIconStyleCondition(comicImage: ComicImageInfo) {
    return {
      'fa-spinner': comicImage.status === ComicImageDownloadStatus.Downloading,
      'fa-check': comicImage.status === ComicImageDownloadStatus.Finish,
      'fa-warning': comicImage.status === ComicImageDownloadStatus.Error,
      'fa-copy': comicImage.status === ComicImageDownloadStatus.Exist
    };

  }

  getDownloadStatusTextStyleCondition(comicImage: ComicImageInfo) {
    return {
      'text-success': comicImage.status === ComicImageDownloadStatus.Finish,
      'text-info': comicImage.status === ComicImageDownloadStatus.Downloading,
      'text-danger': comicImage.status === ComicImageDownloadStatus.Error || comicImage.status === ComicImageDownloadStatus.Exist,
    };
  }

  startDownload() {
    this.service.startDownload().then(() => {
      alert('全部下載完成');
    });
  }
}
