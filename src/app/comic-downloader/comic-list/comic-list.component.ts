import { ComicDownloaderService } from './../comic-downloader.service';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-comic-list',
  templateUrl: './comic-list.component.html',
  styleUrls: ['./comic-list.component.css']
})
export class ComicListComponent implements OnInit {

  @Input()
  appSettings;

  urlToAdd;
  selectedComic;
  getLastVolumes;
  getAll;

  constructor(private service: ComicDownloaderService) { }

  ngOnInit() {
    this.getLastVolumes = 10;
  }

  addComicUrl() {
    if (this.urlToAdd) {
      this.service.addComicUrl(this.urlToAdd);
    }
  }

  removeComicData() {
    if (this.selectedComic) {
      this.service.removeComicData({ name: '', url: this.selectedComic });
    }
  }

  getPictureList() {
    if (this.getAll) {
      this.service.getImageList(this.selectedComic);
    } else {
      this.service.getImageList(this.selectedComic, this.getLastVolumes);
    }
  }
}
