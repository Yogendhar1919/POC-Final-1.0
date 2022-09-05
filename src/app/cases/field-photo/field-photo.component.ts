import {
  ApplicationRef,
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  HostListener,
} from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { ActivatedRoute } from '@angular/router';

import * as fs from '@nativescript/core/file-system';
import {
  ActionItem,
  Dialogs,
  DockLayout,
  GestureTypes,
  isIOS,
  Page,
  Image,
  StackLayout,
  SwipeDirection,
  SwipeGestureEventData,
  TextView,
  Frame,
} from '@nativescript/core';
import { PhotoCommentComponent } from '../photo-comment/photo-comment.component';
import { Case, CaseMock } from '../shared/cases.model';
import {
  CropARLine,
  CropARLinePhoto,
  mockCropARLinePhoto,
  mockCropARLine,
} from '../shared/crop-arline.model';
import { PhotoLocation } from '../shared/field-photo.model';
import { ImageProvider } from '../shared/image.provider';
import { PhotoService } from '../shared/photo.service';
import { LocationService } from '../shared/location.service';
import * as camera from '@nativescript/camera';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ImageSource, Screen } from '@nativescript/core';
import { Path } from '../shared/path';
import { ClaimsFileSystemService } from '../shared/claims-filesystem.service';
import { ListPicker } from '@nativescript/core';

export enum commentMode {
  add,
  edit,
}
export enum screenOrientationMode {
  Portrait = 1,
  PortraitUpsideDown = 2,
  LandscapeLeft = 3,
  LandscapeRight = 4,
}

@Component({
  selector: 'field-photo',
  moduleId: module.id,
  templateUrl: './field-photo.component.html',
  styleUrls: ['./field-photo.component.css'],
})
export class FieldPhotosComponent implements OnInit {
  case: Case;
  arLine: CropARLine;
  currentPhoto: CropARLinePhoto;
  photos: CropARLinePhoto[];
  showCamera: boolean = false;
  previewSource: string = null;
  editComments: boolean = false;
  addComments: boolean = false;
  isSearching: boolean = false;
  isLocationAvailable: boolean = false;
  _ngUnsubscribe = new Subject<void>();
  _hasNext: boolean = false;
  _hasPrevious: boolean = false;
  _currentPhotoPath: string;
  cameraInUse: boolean = false;

  private imageHeightWidth: number = 0;
  private screenOrientation1: screenOrientationMode =
    screenOrientationMode.Portrait;
  private screenOrientation2: screenOrientationMode =
    screenOrientationMode.Portrait;
  private directionOffset1: number = 0;
  private directionOffset2: number = 0;
  private policyId: number;
  private policyPublisherId: number;

  @ViewChild('arlinephoto', { static: false }) arLinePhotoElement: ElementRef;
  @ViewChild('photocomments', { static: false })
  photoCommentElement: PhotoCommentComponent;
  @ViewChild('editCommentsField', { static: false })
  editCommentsElement: ElementRef;
  @ViewChild('commentsContainer', { static: false })
  commentsContainerElement: ElementRef;
  @ViewChild('formContainer', { static: false })
  formContainerElement: ElementRef;
  @ViewChild('backButton', { static: false }) backButtonElement: ElementRef;

  constructor(
    private photoService: PhotoService,
    private claimsFileSystemService: ClaimsFileSystemService,
    private routerExtensions: RouterExtensions,
    private applicationRef: ApplicationRef,
    private page: Page,
    private imageProvider: ImageProvider,
    private locationService: LocationService,
    private route: ActivatedRoute
  ) {
    this.page.on(Page.navigatingToEvent, async () => {
      this.locationService.startUpdatingLocation();
      this.locationService.startUpdatingHeading();
      this.locationService.startWatchLocation();
    });
  }

  ngOnInit(): void {
    this.arLine = mockCropARLine[0];
    this.photos = mockCropARLinePhoto;
    this.policyId = CaseMock[0].PolicyId;
    this.policyPublisherId = CaseMock[0].PolicyPublisherId;
    this.currentPhoto = new CropARLinePhoto();
    if (this.hasPhotos() && this.currentPhoto.Id === undefined) {
      this.currentPhoto = this.photos[0];
      this.hasNext = this.photoCount() >= 2;
    }
    this.currentPhotoPath = '';
  }

  private getScreenOrientationMode(): screenOrientationMode {
    if (isIOS) {
      var device = UIDevice.currentDevice;
      if (device.orientation === 1) {
        return screenOrientationMode.Portrait;
      }
      if (device.orientation === 2) {
        return screenOrientationMode.PortraitUpsideDown;
      }
      if (device.orientation === 3) {
        return screenOrientationMode.LandscapeLeft;
      }
      if (device.orientation === 4) {
        return screenOrientationMode.LandscapeRight;
      }
    }
    return screenOrientationMode.Portrait;
  }

  ngAfterViewInit(): void {
    if (this.arLinePhotoElement) {
      let arLinePhotoField: Image = <Image>(
        this.arLinePhotoElement.nativeElement
      );
      arLinePhotoField.on(GestureTypes.swipe, (args: SwipeGestureEventData) => {
        if (args.direction === SwipeDirection.left) {
          this.next();
          this.applicationRef.tick();
        } else if (args.direction === SwipeDirection.right) {
          this.previous();
          this.applicationRef.tick();
        }
      });
    }
  }

  close(): void {
    this.routerExtensions.backToPreviousPage();
  }

  next(): void {
    if (
      this.photoCount() < 2 ||
      this.currentIndex() === this.photoCount() - 1
    ) {
      return;
    }

    let i: number = this.currentIndex();

    if (i < this.photoCount() - 1) {
      this.currentPhoto = this.photos[++i];
      this.hasPrevious = true;
    }
    this.hasPrevious = i > 0;
    this.hasNext = i < this.photoCount() - 1;
    this.currentPhotoPath = '';
  }

  previous(): void {
    if (this.photos.length < 2 || this.currentIndex() + 1 === 0) {
      this.hasPrevious = false;
      return;
    }

    let i: number = this.currentIndex();

    if (i > 0) {
      this.currentPhoto = this.photos[--i];
    }
    this.hasPrevious = i > 0;
    this.hasNext = i < this.photoCount() - 1;

    this.currentPhotoPath = '';
  }

  delete(): void {
    if (this.photoCount() === 0) {
      return;
    }

    if (this.currentPhoto.Uploaded) {
      Dialogs.alert({
        title: 'Photo Uploaded',
        message: 'Cannot delete photo. The photo has been uploaded.',
        okButtonText: 'OK',
      });
      return;
    }

    this.confirmDelete().then((result) => {
      if (result) {
        let i: number = this.currentIndex();
        let photoToDelete: CropARLinePhoto = this.currentPhoto;

        try {
          if (this.photoService.deletePhoto(photoToDelete)) {
            this.alertDeleteSuccess();
            this.photos.splice(i, 1);
            if (this.photos.length > 0 && i === 0) {
              this.currentPhoto = this.photos[0];
            } else if (this.photos.length > 0) {
              this.currentPhoto = this.photos[--i];
            } else {
              this.currentPhoto = new CropARLinePhoto();
            }

            this.currentPhotoPath = '';
          }
        } catch (e) {
          this.alertDeleteFailed();
        }
      }
    });
  }

  get hasNext(): boolean {
    this.hasPhotos() ? true : false;
    return this._hasNext;
  }

  set hasNext(val: boolean) {
    this._hasNext = val;
    this.hasPhotos() ? true : false;
  }

  get hasPrevious(): boolean {
    this.hasPhotos() ? true : false;
    return this._hasPrevious;
  }

  set hasPrevious(val: boolean) {
    this._hasPrevious = val;
    this.hasPhotos() ? true : false;
  }

  hasPhotos(): boolean {
    return this.photos !== null && this.photos.length > 0;
  }

  photoCount(): number {
    if (!this.hasPhotos()) return 0;
    return this.photos.length;
  }

  currentIndex(): number {
    return 0;
  }

  get currentPhotoPath() {
    return this._currentPhotoPath;
  }

  set currentPhotoPath(value) {
    const path = Path.fromPath(
      this.claimsFileSystemService.getClaimARlinePhotoPath(
        this.currentPhoto.CaseId,
        this.currentPhoto.ARLineId
      ),
      `${this.currentPhoto.FileName}.jpeg`
    );
    this._currentPhotoPath = path.path;
  }

  private async addImage(
    imageFile: string,
    photoLocation: PhotoLocation
  ): Promise<boolean> {
    return this.photoService
      .addImage(this.arLine, imageFile, photoLocation)
      .then((croparLinePhoto) => {
        this.currentPhoto = croparLinePhoto;
        this.photoCommentElement.cropARLinePhoto = croparLinePhoto;
        this.photoCommentElement.init(croparLinePhoto.Comments);
        if (this.photoCount() - 1 > 0) {
          this.hasPrevious = true;
        }
        this.currentPhotoPath = '';
        return true;
      })
      .catch((error) => {
        this.hideComment();
        Dialogs.alert({
          title: 'Image Save Error',
          message: error.message,
          okButtonText: 'OK',
        });
        return false;
      });
  }

  updateComments(): void {
    if (this.currentPhoto.File) {
      if (this.currentPhoto.Uploaded) {
        Dialogs.alert({
          title: 'Photo Uploaded',
          message: 'Cannot edit comments. The photo has been uploaded.',
          okButtonText: 'OK',
        });
        return;
      }
      this.showComment(this.currentPhoto.Comments, commentMode.edit);
    }
  }

  takePicture(): void {
    // if they do not allow location services or we fail
    // to get the location the user will need to enter the location information.
    this.cameraInUse = true;
    this.imageProvider.imageLocation1 = null;
    this.imageProvider.imageLocation2 = null;

    //Screen Orientation
    this.screenOrientation1 = this.getScreenOrientationMode();

    if (this.screenOrientation1 === 1 || this.screenOrientation1 === 2) {
      this.directionOffset1 = 0;
      this.imageHeightWidth = Screen.mainScreen.widthDIPs * 0.8;
    }
    if (this.screenOrientation1 === 3) {
      this.directionOffset1 = 90;
      this.imageHeightWidth = Screen.mainScreen.heightDIPs * 0.8;
    }
    if (this.screenOrientation1 === 4) {
      this.directionOffset1 = -90;
      this.imageHeightWidth = Screen.mainScreen.heightDIPs * 0.8;
    }

    this.isSearching = true;
    //When trying to get the location1 This will result in posibly returning an error so the location is null on line 400-401 giving bad direction
    this.locationService
      .getLocation()
      .then((location1) => {
        this.isSearching = false;
        if (location1.hasValidDirection()) {
          location1.direction = location1.direction + this.directionOffset1;
        }
        this.imageProvider.imageLocation1 = location1;

        //this section calls for the camera
        this.photoService
          .requestPermissions()
          .then((result) =>
            camera.takePicture({
              height: this.imageHeightWidth,
              width: this.imageHeightWidth,
              keepAspectRatio: true,
              saveToGallery: true,
            })
          )
          .then((picture) => {
            this.imageProvider.current = picture;

            // if you need image source
            const folder: fs.Folder = fs.knownFolders.documents();
            const path: string = fs.path.join(folder.path, 'preview.png');

            ImageSource.fromAsset(this.imageProvider.current).then(
              (imageSource) => {
                if (imageSource.saveToFile(path, 'png')) {
                  this.previewSource = path;
                }

                this.screenOrientation2 = this.getScreenOrientationMode();
                if (
                  this.screenOrientation1 === 1 &&
                  this.screenOrientation2 === 1
                ) {
                  this.directionOffset2 = 0;
                }
                if (
                  this.screenOrientation1 === 1 &&
                  this.screenOrientation2 === 2
                ) {
                  this.directionOffset2 = 0;
                }
                if (
                  this.screenOrientation1 === 1 &&
                  this.screenOrientation2 === 3
                ) {
                  this.directionOffset2 = 90;
                }
                if (
                  this.screenOrientation1 === 1 &&
                  this.screenOrientation2 === 4
                ) {
                  this.directionOffset2 = -90;
                }
                if (
                  this.screenOrientation1 === 2 &&
                  this.screenOrientation2 === 1
                ) {
                  this.directionOffset2 = 0;
                }
                if (
                  this.screenOrientation1 === 2 &&
                  this.screenOrientation2 === 2
                ) {
                  this.directionOffset2 = 0;
                }
                if (
                  this.screenOrientation1 === 2 &&
                  this.screenOrientation2 === 3
                ) {
                  this.directionOffset2 = 90;
                }
                if (
                  this.screenOrientation1 === 2 &&
                  this.screenOrientation2 === 4
                ) {
                  this.directionOffset2 = -90;
                }
                if (
                  this.screenOrientation1 === 3 &&
                  this.screenOrientation2 === 1
                ) {
                  this.directionOffset2 = 0;
                }
                if (
                  this.screenOrientation1 === 3 &&
                  this.screenOrientation2 === 2
                ) {
                  this.directionOffset2 = 0;
                }
                if (
                  this.screenOrientation1 === 3 &&
                  this.screenOrientation2 === 3
                ) {
                  this.directionOffset2 = 90;
                }
                if (
                  this.screenOrientation1 === 3 &&
                  this.screenOrientation2 === 4
                ) {
                  this.directionOffset2 = -90;
                }
                if (
                  this.screenOrientation1 === 4 &&
                  this.screenOrientation2 === 1
                ) {
                  this.directionOffset2 = 0;
                }
                if (
                  this.screenOrientation1 === 4 &&
                  this.screenOrientation2 === 2
                ) {
                  this.directionOffset2 = 0;
                }
                if (
                  this.screenOrientation1 === 4 &&
                  this.screenOrientation2 === 3
                ) {
                  this.directionOffset2 = 90;
                }
                if (
                  this.screenOrientation1 === 4 &&
                  this.screenOrientation2 === 4
                ) {
                  this.directionOffset2 = -90;
                }
                this.isSearching = true;
                //This section seems to get called after the photo is taken so there seems to be location information.
                this.locationService
                  .getLocation()
                  .then((location2) => {
                    if (location2 && location2.hasValidDirection()) {
                      location2.direction =
                        location2.direction + this.directionOffset2;
                    }

                    this.imageProvider.imageLocation2 = location2;
                    this.cameraInUse = false;

                    if (
                      !(
                        this.imageProvider.imageLocation1 &&
                        this.imageProvider.imageLocation1.hasValidLocation()
                      ) ||
                      !(
                        this.imageProvider.imageLocation2 &&
                        this.imageProvider.imageLocation2.hasValidLocation()
                      )
                    ) {
                      setTimeout(() => {
                        Dialogs.alert({
                          title: 'Bad Location',
                          message:
                            'Cannot use photo. The phone location cannot be determined.',
                          okButtonText: 'OK',
                        }).then(() => {});
                      }, 1000);
                      this.imageProvider.imageLocation2.latitude = 0;
                      this.imageProvider.imageLocation2.longitude = 0;
                      this.isSearching = false;
                      return;
                    }

                    if (
                      !this.imageProvider.imageLocation1.hasValidDirection() ||
                      !this.imageProvider.imageLocation2.hasValidDirection()
                    ) {
                      setTimeout(() => {
                        Dialogs.alert({
                          title: 'Bad Direction',
                          message:
                            'Cannot use photo. The phone direction cannot be determined.',
                          okButtonText: 'OK',
                        }).then(() => {});
                      }, 1000);
                      this.imageProvider.imageLocation2.direction = -1;
                      this.isSearching = false;
                      return;
                    }

                    if (
                      this.hasDirectionChanged(
                        this.imageProvider.imageLocation1,
                        this.imageProvider.imageLocation2
                      )
                    ) {
                      setTimeout(() => {
                        Dialogs.alert({
                          title: 'Direction Changed',
                          message:
                            'Cannot use photo. The phone direction changed when capturing and previewing the photo.',
                          okButtonText: 'OK',
                        }).then(() => {});
                      }, 1000);
                      if (this.imageProvider.imageLocation2)
                        this.imageProvider.imageLocation2.direction = -1;
                      this.isSearching = false;
                      return;
                    }

                    if (
                      this.locationService.getDistance(
                        this.imageProvider.imageLocation1.geoLocation,
                        this.imageProvider.imageLocation2.geoLocation
                      ) > 50
                    ) {
                      setTimeout(() => {
                        Dialogs.alert({
                          title: 'Location Changed',
                          message:
                            'Cannot use photo. The phone location changed when capturing and previewing the photo.',
                          okButtonText: 'OK',
                        }).then(() => {});
                      }, 1000);
                      this.imageProvider.imageLocation2.latitude = 0;
                      this.imageProvider.imageLocation2.longitude = 0;
                      this.isSearching = false;
                      return;
                    }

                    this.addImage(
                      this.previewSource,
                      this.imageProvider.imageLocation2
                    ).then((flag) => {
                      if (flag) {
                        this.showComment('', commentMode.add);
                        this.addComments = flag;
                        this.isSearching = false;
                      }
                    });

                    if (this.screenOrientation1 === 1) {
                      this.setOrientation(screenOrientationMode.Portrait);
                    }
                    if (this.screenOrientation1 === 2) {
                      this.setOrientation(screenOrientationMode.Portrait);
                    }
                    if (this.screenOrientation1 === 3) {
                      this.setOrientation(screenOrientationMode.LandscapeLeft);
                    }
                    if (this.screenOrientation1 === 4) {
                      this.setOrientation(screenOrientationMode.LandscapeRight);
                    }
                    this.enableRotation();
                  })
                  .catch((error) => {
                    this.isSearching = false;
                    this.cameraInUse = false;
                    Dialogs.alert({
                      title: 'Bad Direction',
                      message:
                        'Cannot use photo. The phone direction cannot be determined.',
                      okButtonText: 'OK',
                    }).then(() => {});
                  });
              }
            );
          })
          .catch((_error) => {
            // handle camera cancel here
            this.cameraInUse = false;
          });
      })
      .catch((error) => {
        this.cameraInUse = false;
        Dialogs.alert({
          title: 'Bad Direction',
          message:
            'Cannot open camera. The phone direction cannot be determined.',
          okButtonText: 'OK',
        }).then(() => {});
      });
  }

  setOrientation(currentOrientation: number) {
    UIDevice.currentDevice.setValueForKey(currentOrientation, 'orientation');
  }

  enableRotation() {
    var curFrame = Frame.topmost();
    if (!curFrame) {
      return;
    }

    try {
      let allowRotation = true;
      let forceRotation = true;
      let app = curFrame.ios.controller;
      let proto = this.findRootPrototype(app, 'shouldAutorotate');
      if (proto === null) {
        console.log(
          'Unable to find rotations system, disabling orientation system.'
        );
        return;
      }
      Object.defineProperty(proto, 'shouldAutorotate', {
        get: function () {
          return forceRotation || allowRotation;
        },
        enumerable: true,
        configurable: true,
      });
    } catch (err) {
      console.log('Unable to setup Rotation', err);
    }
  }

  findRootPrototype(source: any, name: any) {
    var proto = source;
    do {
      proto = Object.getPrototypeOf(proto);
    } while (proto !== null && !proto.hasOwnProperty(name));
    return proto;
  }

  private hasDirectionChanged(
    location1: PhotoLocation,
    location2: PhotoLocation
  ): boolean {
    // cannot determine if direction changed. will prompt for direction.
    if (!location1.hasValidDirection() || !location2.hasValidDirection()) {
      return false;
    }
    return (
      this.convertDegreesToDirectionText(location1.direction) !==
        this.convertDegreesToDirectionText(location2.direction) &&
      Math.abs(location1.direction - location2.direction) > 25
    );
  }

  getPhotoIndex(): number {
    if (!this.hasPhotos()) return 0;
    return this.currentIndex() + 1;
  }

  private confirmDelete(): Promise<boolean> {
    return Dialogs.confirm({
      title: 'Delete Confirmation',
      message: 'Are you sure you want to delete this photo?',
      okButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
  }

  private alertDeleteFailed(): void {
    Dialogs.alert({
      title: 'Photo Deletion',
      message: 'Unable to delete the photo.',
      okButtonText: 'OK',
    });
  }

  private alertDeleteSuccess(): void {
    Dialogs.confirm({
      title: 'Photo Deletion',
      message: 'The photo was successfully deleted.',
      okButtonText: 'OK',
    }).then(() => {});
  }

  private editCommentCompleted(): void {
    this.currentPhoto.Comments =
      this.photoCommentElement.commentElement.nativeElement.text;
    let needsLocations: boolean =
      this.currentPhoto.Latitude === undefined ||
      this.currentPhoto.Latitude === null ||
      this.currentPhoto.Latitude === 0 ||
      this.currentPhoto.Longitude === undefined ||
      this.currentPhoto.Longitude === null ||
      this.currentPhoto.Longitude === 0;

    let needsDirection: boolean =
      this.currentPhoto.Direction === undefined ||
      this.currentPhoto.Direction === null ||
      this.currentPhoto.Direction <= 0;

    let needsAcreage: boolean = this.arLine.isDefaultLine();
    let hasRequirements: boolean =
      needsAcreage || needsDirection || needsLocations;

    if (hasRequirements && this.currentPhoto.Comments.trim().length === 0) {
      let message: string =
        'Cannot save photo.  The following information is required in the comments:\n';
      let acreagePrompt: string = '- Acres\n';
      let locationPrompt: string = '- Nearest intersection with distance.\n';
      let directionPrompt: string = '- Direction of view\n';

      if (needsAcreage) {
        message = message + acreagePrompt;
      }
      if (needsLocations) {
        message = message + locationPrompt;
      }
      if (needsDirection) {
        message = message + directionPrompt;
      }

      Dialogs.alert({
        title: 'Photo Save',
        message: message,
        okButtonText: 'OK',
      }).then(() => {});
      return;
    } else {
      this.currentPhoto.PolicyId = this.policyId;
      this.currentPhoto.PolicyPublisherId = this.policyPublisherId;
      this.currentPhoto.PolicyCropId =
        this.arLine.PolicyCropID !== undefined ? this.arLine.PolicyCropID : 0;
      this.currentPhoto.PolicyCropLineId =
        this.arLine.PolicyCropLineId !== undefined
          ? this.arLine.PolicyCropLineId
          : 0;
      this.currentPhoto.Acres =
        this.arLine.Acres !== undefined ? this.arLine.Acres : '0';
      this.photoService.saveARLinePhotoMetadata(this.currentPhoto);
      this.photoService
        .loadClaimARLinePhotos(this.arLine.Case.CaseId, this.arLine.ARLineID)
        .pipe(takeUntil(this._ngUnsubscribe))
        .subscribe((x) => {
          this.photos = x;
          this.hasPrevious = this.photos.length > 1;
        });
      this.currentPhoto = this.photos[this.currentIndex()];

      this.hideComment();
    }
  }

  private cancelEditComments(): void {
    this.hideComment();
  }

  private cancelAddComments(): void {
    this.hideComment();
    if (this.photos.length > 0) {
      this.photos.length = this.photos.length - 1;
      if (this.photos.length > 0) {
        this.currentPhoto = this.photos[0];
      } else {
        this.currentPhoto = new CropARLinePhoto();
      }
    }
  }

  private hideComment(): void {
    this.editComments = false;
    this.addComments = false;
    if (this.formContainerElement) {
      let formContainer: DockLayout = <DockLayout>(
        this.formContainerElement.nativeElement
      );
      formContainer.visibility = 'visible';
      let commentsContainer: StackLayout = <StackLayout>(
        this.commentsContainerElement.nativeElement
      );
      commentsContainer.visibility = 'collapse';
      commentsContainer.height = 0;

      try {
        let backButton: ActionItem = <ActionItem>(
          this.backButtonElement.nativeElement
        );
        backButton.visibility = 'visible';
        // tslint:disable-next-line:no-empty
      } catch {}

      let editCommentsField: TextView = <TextView>(
        this.editCommentsElement.nativeElement
      );
      setTimeout(() => {
        editCommentsField.dismissSoftInput();
      }, 0);

      if (editCommentsField.android) {
        setTimeout(() => {
          editCommentsField.dismissSoftInput();
          editCommentsField.android.clearFocus();
        }, 300);
      } else {
        setTimeout(() => {
          editCommentsField.dismissSoftInput();
        }, 0);
      }

      this.photoCommentElement.closeCommentsInput();

      let arLinePhotoField: Image = <Image>(
        this.arLinePhotoElement.nativeElement
      );
      arLinePhotoField.focus();
    }
  }

  private showComment(comment: string, mode: commentMode): void {
    switch (mode) {
      case commentMode.add:
        this.editComments = false;
        this.addComments = true;
        break;

      case commentMode.edit:
        this.editComments = true;
        this.addComments = false;
        break;
    }

    let commentsContainer: StackLayout = <StackLayout>(
      this.commentsContainerElement.nativeElement
    );
    commentsContainer.visibility = 'visible';
    commentsContainer.height = 200;
    this.photoCommentElement.init(comment);

    let formContainer: DockLayout = <DockLayout>(
      this.formContainerElement.nativeElement
    );
    formContainer.visibility = 'collapse';

    try {
      let backButton: ActionItem = <ActionItem>(
        this.backButtonElement.nativeElement
      );
      backButton.visibility = 'collapse';
      // tslint:disable-next-line:no-empty
    } catch {}
  }

  getPhotoTimeZone(dt: string): string {
    let tz: string = '';
    let date: Date = new Date(dt);

    tz = date
      .toLocaleTimeString('en-us', { timeZoneName: 'short' })
      .split(' ')[2];
    return tz;
  }

  getFarmNumberName(farmNumber: string, farmName: string): string {
    let fNN: string = farmName;
    if (farmNumber) {
      if (farmNumber.length > 0) {
        fNN = farmNumber + ' ' + farmName;
      }
    }

    return fNN;
  }

  getPractice(practice: string): string {
    var prac: string = '';
    if (practice) {
      if (practice.length > 0) {
        prac = ('000' + practice).slice(-3);
      }
    }
    return prac;
  }

  convertDegreesToDirectionText(direction: number): string {
    let directionText: string =
      this.locationService.convertDegreesToDirectionText(direction);
    return directionText;
  }

  @HostListener('unloaded')
  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
    this.photos = null;
    this.locationService.stopWatchingLocation();
    this.locationService.stopUpdatingHeading();
    this.locationService.stopUpdatingLocation();
  }

  showCountryPicker = false;
  textFieldValue = 'Choose Direction.....';
  listPickerCountries: Array<string> = [
    'Select',
    'Australia',
    'Belgium',
    'Bulgaria',
  ];

  showHideField() {
    this.showCountryPicker = true;
  }
  selectedCountyChanged(args) {
    const picker = <ListPicker>args.object;
    this.textFieldValue = this.listPickerCountries[picker.selectedIndex];
    this.showCountryPicker = false;
  }
}
