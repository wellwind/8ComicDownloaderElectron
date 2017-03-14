import { ComicImageDownloadStatus } from '../../shared/enums/comic-image-download-status.enum';
import { ElectronService } from './../../shared/services/electron.service';
import { ComicDownloaderService } from './../comic-downloader.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-comic-downloader',
  templateUrl: './comic-downloader.component.html',
  styleUrls: ['./comic-downloader.component.css']
})
export class ComicDownloaderComponent implements OnInit {
  appSettings: any;
  downloadProgrsss = 0;
  constructor(private service: ComicDownloaderService) { }

  ngOnInit() {
    this.service.readSettingsPromise().then(() => {
      this.appSettings = this.service.appSettings;
    });

    this.service.downloadProgress.subscribe(num => {
      this.downloadProgrsss = num;
    });
  }
}
