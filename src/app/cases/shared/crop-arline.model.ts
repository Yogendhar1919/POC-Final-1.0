import { Case, NOL, CaseMock } from './cases.model';
import { Path } from '~/app/cases/shared/path';

export class CropARLine {
  Case: Case;
  CropID: number;
  CountyId: number;
  CountyName: string;
  PolicyCropID: number;
  PolicyCropLineId: number;
  CropAbbr: string;
  ARLineID: number;
  Acres: string;
  FarmName: string;
  FarmNumber: string;
  Practice: string;
  SectionTownshipRange: string;
  Share: string;
  Type: string;
  UnitRowID: string;
  UnitNumber: string;
  NOLs: NOL[];
  PhotoCount: number;

  isDefaultLine(): boolean {
    return this.ARLineID === 0 && this.UnitNumber === null;
  }

  static createDefaultARLine(
    caseData: Case,
    policyCropID: number,
    cropId: number,
    countyId: number
  ): CropARLine {
    const defaultCrop = caseData.Crops.find(
      (x) => x.PolicyCropID == policyCropID
    );
    const nols = caseData.Crops.filter((x) => +x.CropID === cropId)[0].NOLs;
    let cropARLine: CropARLine = new CropARLine();
    cropARLine.ARLineID = 0;
    cropARLine.PolicyCropID = policyCropID;
    cropARLine.CropID = cropId;
    cropARLine.CountyId = countyId;
    cropARLine.CropAbbr = defaultCrop !== null ? defaultCrop.CropAbbr : '';
    cropARLine.UnitNumber = null;
    cropARLine.Case = caseData;
    cropARLine.NOLs = nols;
    return cropARLine;
  }

  getAdjuster(): string {
    let adjuster: string = 'Unknown';
    if (
      this.NOLs &&
      this.NOLs.length > 0 &&
      this.NOLs[0].AdjusterName &&
      this.NOLs[0].IsAssignedToUser
    ) {
      adjuster = this.NOLs[0].AdjusterName;
    }
    return adjuster;
  }
}

export class CasePhotoWrapper {
  constructor() {
    this.CropARLinePhotos = new Array<CropARLinePhoto>();
  }

  static createFrom(wrapper: any): CasePhotoWrapper {
    let newWrapper: CasePhotoWrapper = new CasePhotoWrapper();
    Object.assign(newWrapper, wrapper);
    return newWrapper;
  }

  static formatKey(caseId: number): string {
    return `case-${caseId}`;
  }

  key(): string {
    return CasePhotoWrapper.formatKey(this.CaseId);
  }

  _id: string;

  CaseId: number;
  PolicyId: number;
  PolicyPublisherId: number;

  CropARLinePhotos: CropARLinePhoto[];

  hasPhotosToUpload(): boolean {
    var foundPhoto: CropARLinePhoto = this.CropARLinePhotos.find(
      (value) => !value.Uploaded
    );
    return foundPhoto !== undefined;
  }

  deletePhoto(cropARLinePhoto: CropARLinePhoto): void {
    const index: number = this.indexOf(cropARLinePhoto);
    this.CropARLinePhotos.splice(index, 1);
  }

  addOrReplace(cropARLinePhoto: CropARLinePhoto): void {
    const index: number = this.indexOf(cropARLinePhoto);
    if (index >= 0) {
      this.CropARLinePhotos.splice(index, 1);
      this.CropARLinePhotos.push(cropARLinePhoto);
    } else {
      this.CropARLinePhotos.push(cropARLinePhoto);
    }
  }

  private indexOf(cropARLinePhoto: CropARLinePhoto): number {
    let foundPhoto: CropARLinePhoto = this.CropARLinePhotos.find(
      (photo) => cropARLinePhoto.Id === photo.Id
    );
    return foundPhoto === null ? -1 : this.CropARLinePhotos.indexOf(foundPhoto);
  }
}

export class CropARLinePhoto {
  key(): string {
    return this.Id;
  }

  caseKey(): string {
    return CasePhotoWrapper.formatKey(this.CaseId);
  }

  get path(): string {
    return new Path(this.File.directory as any, this.File.relativePath).path;
  }

  Id: string;
  CaseId: number;
  ARLineId: number;
  PolicyId: number;
  PolicyPublisherId: number;
  PolicyCropId: number;
  PolicyCropLineId: number;
  CropId: number;
  CountyId: number;
  File: {
    directory: string;
    relativePath: string;
    fileNamePath: string;
  };
  FileName: string;
  Latitude: number;
  Longitude: number;
  Adjuster: string;
  Taken: string;
  Direction: number;
  DirectionTaken: string;
  Comments: string;
  FileContent: any;
  Uploaded: boolean;
  Acres: string;

  static loadFromContent(content: string): CropARLinePhoto {
    let cropARLinePhoto: CropARLinePhoto = new CropARLinePhoto();
    let contentObject: any = JSON.parse(content, CropARLinePhoto.dateReviver);
    Object.assign(cropARLinePhoto, contentObject);
    return cropARLinePhoto;
  }

  private static dateReviver(key: any, value: any): any {
    let a: any;
    if (typeof value === 'string') {
      a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(
        value
      );
      if (a) {
        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
      }
    }
    return value;
  }
}

export const mockCropARLine = [
  {
    Case: CaseMock[0],
    CropID: 41,
    CountyId: 90,
    CountyName: 'county name',
    PolicyCropID: 1000,
    PolicyCropLineId: 100,
    CropAbbr: 'CORN',
    ARLineID: 36295995,
    Acres: '105.42',
    FarmName: 'farmname',
    FarmNumber: 'farmnum',
    Practice: 'practice',
    SectionTownshipRange: 'sec',
    Share: '100',
    Type: 'type',
    UnitRowID: 'string',
    UnitNumber: '0002-0001 OU',
    NOLs: [
      {
        NOLID: '164125216',
        AdjusterName: 'ADJUSTER',
        AdjusterPersonID: '2003114',
        DateAssigned: '2017-09-25',
        Status: 'OPEN',
        TypeCode: 'F',
        IsAssignedToUser: true,
        NoticeType: 'Final',
        NoticeTypeId: 1,
      },
      {
        NOLID: '164125217',
        AdjusterName: 'ADJUSTER',
        AdjusterPersonID: '2003114',
        DateAssigned: '2017-09-26',
        Status: 'OPEN',
        TypeCode: 'F',
        IsAssignedToUser: true,
        NoticeType: 'Final',
        NoticeTypeId: 1,
      },
    ],
    PhotoCount: 123,
    isDefaultLine(): boolean {
      return true;
    },
    getAdjuster(): string {
      return 'Adjuster';
    },
  },
] as CropARLine[];

export const mockCropARLinePhoto = [
  {
    Id: '36295995',
    CaseId: 1611200,
    ARLineId: 36295995,
    PolicyId: 7501456,
    PolicyPublisherId: 10000,
    PolicyCropId: 1000,
    PolicyCropLineId: 100,
    CropId: 41,
    CountyId: 90,
    File: {
      directory: '',
      relativePath: '',
      fileNamePath: '',
    },
    FileName: 'string',
    Latitude: 1000,
    Longitude: 5000,
    Adjuster: 'Adjuster',
    Taken: '12/12/2022',
    Direction: 1,
    DirectionTaken: 'north',
    Comments: 'string',
    FileContent: 'any',
    Uploaded: false,
    Acres: '100',
    key(): string {
      return this.Id;
    },

    caseKey(): string {
      return CasePhotoWrapper.formatKey(this.CaseId);
    },
  },
] as CropARLinePhoto[];

export const mockphotowrapper = [
  {
    _id: 'string',
    CaseId: 1611200,
    PolicyId: 7501456,
    PolicyPublisherId: 10000,
    CropARLinePhotos: mockCropARLinePhoto,
    addOrReplace(cropARLinePhoto: CropARLinePhoto): void {
      const index: number = this.indexOf(cropARLinePhoto);
      if (index >= 0) {
        this.CropARLinePhotos.splice(index, 1);
        this.CropARLinePhotos.push(cropARLinePhoto);
      } else {
        this.CropARLinePhotos.push(cropARLinePhoto);
      }
    },
  },
] as CasePhotoWrapper[];
