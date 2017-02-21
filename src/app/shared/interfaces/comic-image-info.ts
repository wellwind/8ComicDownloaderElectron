import { ComicImageDownloadStatus } from '../enums/comic-image-download-status.enum';

export interface ComicImageInfo {
    savedPath: string;
    imageUrl: string;
    status: ComicImageDownloadStatus;
}
