import { Injectable } from '@angular/core';
import * as camera from '@nativescript/camera';
import * as fs from '@nativescript/core/file-system';
import { ImageSource, ImageAsset } from '@nativescript/core';
import { LocationService } from './location.service';
import {
  CropARLine,
  CropARLinePhoto,
  CasePhotoWrapper,
  mockphotowrapper,
} from './crop-arline.model';
import { PhotoLocation } from './field-photo.model';
import { ClaimsFileSystemService } from './claims-filesystem.service';
import { Observable, of } from 'rxjs';
import { Path } from './path';

@Injectable()
export class PhotoService {
  private photos: CropARLinePhoto[];
  private photoType: string = 'jpeg';

  constructor(
    private filesystemService: ClaimsFileSystemService,
    private locationService: LocationService
  ) {
    this.photos = new Array<CropARLinePhoto>();
  }

  // getCropARPhotoCount(claimid: number, arlineid: number): number {
  //   return 1;
  // }

  // getPhotos(claimId: number): Observable<CasePhotoWrapper> {
  //   return of(mockphotowrapper[0]);
  // }

  loadClaimARLinePhotos(
    claimid: number,
    arlineid: number,
    cropId: number = null,
    countyId: number = null
  ): Observable<CropARLinePhoto[]> {
    return of(this.loadARLinePhotos(claimid, arlineid, cropId, countyId));
  }
  private loadARLinePhotos(
    claimid: number,
    arlineid: number,
    cropId: number = null,
    countyId: number = null
  ): CropARLinePhoto[] {
    const photos = new Array<CropARLinePhoto>();
    let wrapper: CasePhotoWrapper = this.getClaimPhotoWrapper(
      CasePhotoWrapper.formatKey(claimid)
    );
    if (wrapper !== null) {
      //filter photos by crop and county
      if (cropId !== null && countyId !== null) {
        wrapper.CropARLinePhotos = wrapper.CropARLinePhotos.filter(
          (x) => +x.CropId === cropId && +x.CountyId === countyId
        );
      }

      wrapper.CropARLinePhotos.forEach((photo) => {
        //if there are photos append to array if they are the same arlineid
        if (photo.ARLineId === arlineid) {
          let cropARLinePhoto: CropARLinePhoto = new CropARLinePhoto();
          Object.assign(cropARLinePhoto, photo);
          photos.push(cropARLinePhoto);
        }
      });
    }

    photos.sort(function (orderA, orderB) {
      var valueA = new Date(orderA.Taken);
      var valueB = new Date(orderB.Taken);
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    });

    return photos;
  }

  requestPermissions(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      camera.requestPermissions().then(
        () => {
          resolve(true);
        },
        () => {
          reject(false);
        }
      );
    });
  }

  addImage(
    cropARLine: CropARLine,
    imageFile: string,
    photoLocation: PhotoLocation
  ): Promise<CropARLinePhoto> {
    return new Promise((resolve, reject) => {
      let arLinePhoto: CropARLinePhoto = this.createCropARLinePhoto(
        cropARLine.Case.CaseId,
        cropARLine.PolicyCropID,
        cropARLine.CropID,
        cropARLine.ARLineID,
        cropARLine.getAdjuster(),
        cropARLine.CountyId
      );
      console.log(photoLocation);
      if (
        this.locationService.convertDegreesToDirectionText(
          photoLocation.direction
        ).length > 9
      ) {
        console.log('jinkinchikikiiiiiiiii', photoLocation.direction);
        reject(new Error('Failed to save image'));
        return;
      }
      if (photoLocation != null) {
        arLinePhoto.Latitude = photoLocation.latitude;
        arLinePhoto.Longitude = photoLocation.longitude;
        arLinePhoto.Direction = photoLocation.direction;
        arLinePhoto.DirectionTaken =
          this.locationService.convertDegreesToDirectionText(
            photoLocation.direction
          );
      }

      let source = ImageSource.fromFileSync(imageFile);
      try {
        let fileName: string = this.filesystemService.getFileName(
          cropARLine.Case.CropYear,
          cropARLine.Case.PolicyNumber,
          cropARLine.UnitNumber,
          cropARLine.FarmNumber,
          arLinePhoto.Id
        );

        let newFile = Path.fromPath(
          this.filesystemService.getClaimARlinePhotoPath(
            cropARLine.Case.CaseId,
            cropARLine.ARLineID
          ),
          `${fileName}.${this.photoType}`
        );

        if (source.saveToFile(newFile.path, 'jpeg')) {
          arLinePhoto.File = {
            directory: newFile.base,
            relativePath: newFile.relativePath,
            fileNamePath: newFile.path,
          };

          arLinePhoto.FileName = fileName;
          this.photos.push(arLinePhoto);

          this.removeImage(imageFile);
          resolve(arLinePhoto);
        } else {
          reject(new Error('Failed to save image'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  removeImage(fileName: string): void {
    let assetFile: fs.File = fs.File.fromPath(fileName);
    assetFile.remove();
  }

  // moveToPreviewImage(imageAsset: ImageAsset): Promise<Path> {
  //   return new Promise((resolve, reject) => {
  //     let source: ImageSource = new ImageSource();
  //     source.fromAsset(imageAsset).then((imageAccessSource) => {
  //       try {
  //         let previewFileName = this.filesystemService.getPreviewFile(
  //           this.generateUUID()
  //         );

  //         if (imageAccessSource.saveToFile(previewFileName.path, 'jpeg')) {
  //           if (imageAsset.ios) {
  //             let assetFile: fs.File = fs.File.fromPath(imageAsset.ios);
  //             assetFile.remove();
  //           }

  //           resolve(previewFileName);
  //         } else {
  //           reject(new Error('Failed to save image'));
  //         }
  //       } catch (error) {
  //         reject(error);
  //       }
  //     });
  //   });
  // }

  saveARLinePhotoMetadata(cropARLinePhoto: CropARLinePhoto): void {}

  // getCropARPhoto(photoId: string): CropARLinePhoto {
  //   let foundPhotos: CropARLinePhoto[] = this.photos.filter(
  //     (file) => file.Id === photoId
  //   );
  //   if (foundPhotos.length > 0) {
  //     return foundPhotos[0];
  //   }
  //   return null;
  // }

  deletePhoto(selectedPhotoToDelete: CropARLinePhoto): boolean {
    return true;
  }

  // private cleanUpFolders(folder: fs.Folder, deleteParent: boolean): void {
  //   folder.getEntities().then((entities) => {
  //     if (entities.length === 0) {
  //       folder.removeSync();
  //       this.cleanUpFolders(folder.parent, false);
  //     }
  //   });
  // }

  private createCropARLinePhoto(
    caseId: number,
    policyCropId,
    cropId: number,
    arLineId: number,
    adjuster: string,
    countyId: number
  ): CropARLinePhoto {
    var arLinePhoto: CropARLinePhoto = new CropARLinePhoto();
    arLinePhoto.Id = this.generateUUID();
    arLinePhoto.ARLineId = arLineId;
    arLinePhoto.CaseId = caseId;
    arLinePhoto.CropId = cropId;
    arLinePhoto.PolicyCropId = policyCropId;
    arLinePhoto.Comments = '';
    arLinePhoto.Adjuster = adjuster;
    arLinePhoto.CountyId = countyId;
    arLinePhoto.Taken = new Date().toISOString();
    return arLinePhoto;
  }

  private generateUUID(): string {
    var d: number = new Date().getTime();
    var uuid: string = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g,
      (c) => {
        // tslint:disable-next-line:no-bitwise
        var r: number = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        // tslint:disable-next-line:no-bitwise
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      }
    );
    return uuid;
  }

  private getClaimPhotoWrapper(key: string): CasePhotoWrapper {
    return mockphotowrapper[0];
  }
}
