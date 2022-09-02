import { Injectable } from '@angular/core';
import { Logger } from '../../shared/default-logger.service';
import { FileSystemService } from '../../shared/filesystem.service';
import { Path } from './path';

@Injectable()
export class ClaimsFileSystemService extends FileSystemService {
  constructor(logger: Logger) {
    super(logger);
  }

  getClaimBasePath(claimid: number): Path {
    return Path.fromPath(this.getPhotosPath(), `claim-${claimid}/`);
  }

  getClaimARlinePhotoPath(claimid: number, arlineid: number): Path {
    let basePath = Path.fromPath(
      this.getClaimBasePath(claimid),
      `arline-${arlineid}/`
    );
    basePath.createDirs();
    return basePath;
  }

  getPolicyFileFolder(): Path {
    return Path.fromPath(this.getQuestMobilePath(), '/policies');
  }

  getPhotosPath(): Path {
    // return fs.path.join(this.getQuestMobilePath(), "photos");
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

  getPolicyFilePath(): Path {
    return Path.fromPath(this.getPolicyFileFolder(), '/quest_mobile.json');
  }
}
