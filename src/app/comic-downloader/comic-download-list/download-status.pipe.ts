import { Pipe, PipeTransform } from '@angular/core';
import { ComicImageDownloadStatus} from '../../shared/enums/comic-image-download-status.enum';

@Pipe({
  name: 'downloadStatus'
})
export class DownloadStatusPipe implements PipeTransform {

  transform(value: ComicImageDownloadStatus): any {
    const mapping = [];
    mapping[ComicImageDownloadStatus.Ready] = '準備中';
    mapping[ComicImageDownloadStatus.Downloading] = '下載中';
    mapping[ComicImageDownloadStatus.Finish] = '完成';
    mapping[ComicImageDownloadStatus.Error] = '錯誤';

    return mapping[value] || '';
  }

}
