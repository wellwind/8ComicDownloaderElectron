import { ElectronService } from './../../shared/services/electron.service';
import { ComicDownloaderService } from './../comic-downloader.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-comic-downloader',
  templateUrl: './comic-downloader.component.html',
  styleUrls: ['./comic-downloader.component.css']
})
export class ComicDownloaderComponent implements OnInit {

  constructor(private service: ComicDownloaderService) { }

  ngOnInit() {
    this.service.readSettings();
  }

}
