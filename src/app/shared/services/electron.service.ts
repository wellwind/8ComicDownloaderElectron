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

  openDirectoryDialog(defaultPath?, ) {
    const dialog = (this.electronApp as Electron.ElectronMainAndRenderer).remote.dialog;
    const openOptions: any = {
      defaultPath: defaultPath || '',
      properties: ["openDirectory"]
    };
    return new Promise((resolve, reject) => {
      dialog.showOpenDialog(openOptions, (directoryPath) => {
        if (directoryPath) {
          resolve(directoryPath[0]);
        } else {
          resolve(undefined);
        }
      });
    });
  }

  openDirectory(directoryPath){
  }
}
