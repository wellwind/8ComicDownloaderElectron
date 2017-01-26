/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, tick, inject } from '@angular/core/testing';
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
      };

      service.openDirectoryDialog('/foo/bar');
    });

    it('should resolve selected path', done => {
      service.electronApp = {
        remote: {
          dialog: {
            showOpenDialog: (opt, cb) => {
              cb('/foo/bar/new');
            }
          }
        }
      };

      service.openDirectoryDialog('').then(selectedPath => {
        expect(selectedPath).toBe('/foo/bar/new');
        done();
      });
    });
  })

});
