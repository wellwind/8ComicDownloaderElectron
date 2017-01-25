import { ElectronService } from './../../shared/services/electron.service';
import { ComicDownloaderService } from './../comic-downloader.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-comic-folder',
  templateUrl: './comic-folder.component.html',
  styleUrls: ['./comic-folder.component.css']
})
export class ComicFolderComponent implements OnInit {

  constructor(private service: ComicDownloaderService) { }

  ngOnInit() {
  }

  getComicFolder() {
    return this.service.appSettings.comicFolder;
  }
}
