import { Injectable } from '@angular/core';
import * as fs from '@nativescript/core/file-system';
import { Path } from '~/app/cases/shared/path';

@Injectable()
export class FileSystemService {
  constructor() {}

  cleanUpFolders(folder: fs.Folder, deleteParent: boolean): void {
    folder.getEntities().then((entities) => {
      if (entities.length === 0) {
        folder.removeSync();
        this.cleanUpFolders(folder.parent, false);
      }
    });
  }

  getPolicyFileFolder(): Path {
    const path = Path.fromPath(this.getQuestMobilePath(), '/policies');
    path.createDirs();
    return path;
  }

  getFileName(
    cropYear: number,
    policyNumber: string,
    unitNumber: string,
    farmNumber: string,
    id: string
  ): string {
    return `${cropYear}_${policyNumber}_${id}`.replace(' ', '_');
  }

  getQuestMobilePath(): Path {
    const path = new Path('documents', '/data/');
    path.createDirs();
    return path;
  }

  getQuestMobileDocsPath(): Path {
    return new Path('documents', '/data/');
  }

  getConfigFilePath(): string {
    const path = fs.path.join(
      fs.knownFolders.currentApp().path,
      `/app/config/config.json`
    );
    return path;
  }

  isJsonFile(fileName: string): boolean {
    return fileName.endsWith('json');
  }

  hasUploadedFile(fileName: string): boolean {
    return fs.File.exists(fileName + '.uploaded');
  }

  protected hasFilesNeedToBeUploaded(claimFolderPath: string): boolean {
    let result: boolean = false;
    let claimFolder: fs.Folder = fs.Folder.fromPath(claimFolderPath);
    claimFolder.eachEntity((entity) => {
      let arLineFolder: fs.Folder = fs.Folder.fromPath(entity.path);
      arLineFolder.eachEntity((arLineEntity) => {
        if (
          this.isJsonFile(arLineFolder.name) &&
          !this.hasUploadedFile(arLineFolder.path)
        ) {
          result = true;
        }
        return !result;
      });
      return !result;
    });
    return result;
  }
}
