import { ComicDownloaderElectronPage } from './app.po';

describe('comic-downloader-electron App', function() {
  let page: ComicDownloaderElectronPage;

  beforeEach(() => {
    page = new ComicDownloaderElectronPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
