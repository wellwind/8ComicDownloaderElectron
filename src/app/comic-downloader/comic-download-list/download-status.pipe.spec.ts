import { DownloadStatusPipe } from './download-status.pipe';
import { ComicImageDownloadStatus } from '../../shared/enums/comic-image-download-status.enum';

describe('DownloadStatusPipe', () => {
  let pipe: DownloadStatusPipe;

  beforeEach(() => {
    pipe = new DownloadStatusPipe();
  });

  it('should transform ComicImageDownloadStatus.Ready to chinese', () => {
    expect(pipe.transform(ComicImageDownloadStatus.Ready)).toBe('準備中');
  });

  it('should transform ComicImageDownloadStatus.Downloading to chinese', () => {
    expect(pipe.transform(ComicImageDownloadStatus.Downloading)).toBe('下載中');
  });

  it('should transform ComicImageDownloadStatus.Finish to chinese', () => {
    expect(pipe.transform(ComicImageDownloadStatus.Finish)).toBe('完成');
  });

  it('should transform ComicImageDownloadStatus.Error to chinese', () => {
    expect(pipe.transform(ComicImageDownloadStatus.Error)).toBe('錯誤');
  });

  it('should return empty when input is not in ComicImageDownloadStatus', () =>{
    expect(pipe.transform(9999)).toBe('');
  });
});
