/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ElectronService } from './electron.service';

describe('ElectronService', () => {

  let service: ElectronService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ElectronService]
    });

    service = TestBed.get(ElectronService);
  });

  it('getAppVersion() should call remote.app.getVersion()', () => {
    // mocking
    service.electronApp = {
      remote: {
        app: jasmine.createSpyObj('app', ['getVersion'])
      }
    };

    service.getAppVersion();
    expect(service.electronApp.remote.app.getVersion).toHaveBeenCalled();
  });

  describe('openDirectoryDialog()', () => {
    beforeEach(() => {

    });

    it('should call remote.dialog.showOpenDialog()', () => {
      const openOptions: any = {
        defaultPath: '/foo/bar',
        properties: ["openDirectory"]
      };
      service.electronApp = {
        remote: {
          dialog: {
            showOpenDialog: (opt, cb) => {
              expect(opt).toEqual(openOptions);
            }
          }
        }
      }

      service.openDirectoryDialog('/foo/bar');
    });
  })

});
