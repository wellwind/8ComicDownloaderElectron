import { Injectable } from '@angular/core';

@Injectable()
export class ElectronService {
  electronApp: any;

  constructor() {
    // to avoid unit test show electron is not defined
    window['electron'] = window['electron'] || {};

    this.electronApp = window['electron'];
  }

  getAppVersion() {
    return (this.electronApp as Electron.ElectronMainAndRenderer).remote.app.getVersion();
  }
}
