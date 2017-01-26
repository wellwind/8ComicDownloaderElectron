import { ElectronService } from './../../shared/services/electron.service';
import { ComicDownloaderService } from './../comic-downloader.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-comic-folder',
  templateUrl: './comic-folder.component.html',
  styleUrls: ['./comic-folder.component.css']
})
export class ComicFolderComponent implements OnInit {

  @Input()
  appSettings;

  constructor(private service: ComicDownloaderService) { }

  ngOnInit() {
  }
}
