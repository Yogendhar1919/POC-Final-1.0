import { Component, OnInit, HostListener } from '@angular/core';
import {
  CasePhotoWrapper,
  mockCropARLinePhoto,
} from '../shared/crop-arline.model';
import { Case, Crop, CaseMock } from '../shared/cases.model';
import { RouterExtensions } from '@nativescript/angular';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Page } from '@nativescript/core';

@Component({
  selector: 'ns-crop-list',
  templateUrl: './crop-list.component.html',
  styleUrls: ['./crop-list.component.css'],
  moduleId: module.id,
})
export class CropListComponent implements OnInit {
  cropItems: Crop[];
  photos: CasePhotoWrapper;
  case: Case;
  policyLevel: boolean;
  _ngUnsubscribe = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private page: Page,
    private routerExtensions: RouterExtensions
  ) {}

  @HostListener('loaded')
  ngOnInit() {
    this.cropItems = CaseMock[0].Crops;
    console.log(this.cropItems);
    this.case = CaseMock[0];
    //this.photos = mockCropARLinePhoto[0];
  }
  @HostListener('unloaded')
  ngOnDestroy(): void {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  isCropDefault(cropId: number) {
    return cropId === 0;
  }

  hasPhotos(cropId: number, countyId: number): boolean {
    // if (this.photos === null) return false;
    // let hasPhotos = this.getPhotoCount(cropId, countyId) > 0;
    // return hasPhotos;
    return true;
  }

  getPhotoCount(cropId: number, countyId: number): number {
    // if (this.photos === null) return 0;
    // const count = this.photos.CropARLinePhotos.filter(
    //   (x) => x.CropId == cropId && x.CountyId == countyId
    // );
    // return count.length;
    return 10;
  }

  onPolicyCropTap(item: Crop) {
    this.routerExtensions.navigate(
      ['/cases/field-photo/', this.case.CaseId, 0],
      {
        animated: true,
        transition: {
          name: 'slide',
          duration: 200,
          curve: 'ease',
        },
      }
    );
  }

  onItemTap(item: Crop) {
    this.routerExtensions.navigate(
      [
        '/cases/arline-list/',
        this.case.CaseId,
        item.PolicyCropID,
        item.CropID,
        item.CountyID,
      ],
      {
        animated: true,
        transition: {
          name: 'slide',
          duration: 200,
          curve: 'ease',
        },
      }
    );
  }

  close(): void {
    this.routerExtensions.backToPreviousPage();
  }
}
