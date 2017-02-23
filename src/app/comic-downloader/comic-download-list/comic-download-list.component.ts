import { ComicImageInfo } from './../../shared/interfaces/comic-image-info';
import { ComicDownloaderService } from './../comic-downloader.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-comic-download-list',
  templateUrl: './comic-download-list.component.html',
  styleUrls: ['./comic-download-list.component.css']
})
export class ComicDownloadListComponent implements OnInit {

  constructor(private service: ComicDownloaderService) { }

  ngOnInit() {
  }

  getToDownloadImageList(): ComicImageInfo[] {
    return this.service.toDownloadComicImageList;
  }

  startDownload() {
    this.service.startDownload().then(() => {
      alert('全部下載完成');
    });
  }
}
