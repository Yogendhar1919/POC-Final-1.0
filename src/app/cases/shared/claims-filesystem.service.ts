import { Injectable } from '@angular/core';
import { FileSystemService } from '../../shared/filesystem.service';
import { Path } from './path';

@Injectable()
export class ClaimsFileSystemService extends FileSystemService {
  constructor() {
    super();
  }

  getClaimBasePath(caseId: number): Path {
    return Path.fromPath(this.getPhotosPath(), `case-${caseId}/`);
  }

  getClaimARlinePhotoPath(caseId: number, arlineid: number): Path {
    let basePath = Path.fromPath(
      this.getClaimBasePath(caseId),
      `arline-${arlineid}/`
    );
    basePath.createDirs();
    return basePath;
  }

  getPolicyFileFolder(): Path {
    return Path.fromPath(this.getQuestMobilePath(), '/policies');
  }

  getPhotosPath(): Path {
    return Path.fromPath(this.getQuestMobileDocsPath(), 'photos');
  }

  getPhotosFolder(): Path {
    return this.getPhotosPath();
  }

  getPreviewFile(uuid: string): Path {
    return Path.fromPath(
      this.getQuestMobileDocsPath(),
      `photos/preview${uuid}.jpeg`
    );
  }
}
