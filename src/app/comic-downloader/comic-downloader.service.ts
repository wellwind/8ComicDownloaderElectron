import { Injectable } from '@angular/core';
const os = window.require('os');

@Injectable()
export class ComicDownloaderService {
  constructor() { }

  getConfigFilePath() {
    return os.homedir() + '/8ComicDownloader/settings.conf';;
  }
}
