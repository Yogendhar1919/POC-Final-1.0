import { Component, OnInit, HostListener } from '@angular/core';
import { CasePhotoWrapper } from '../shared/batch-line.model';
import { Case, Crop, CaseMock } from '../shared/cases.model';
import { RouterExtensions } from '@nativescript/angular';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';
import { Page } from '@nativescript/core';

@Component({
  selector: 'ns-batch-list',
  templateUrl: './batch-list.component.html',
  styleUrls: ['./batch-list.component.css'],
  moduleId: module.id,
})
export class BatchListComponent implements OnInit {
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
    this.cropItems = new Array<Crop>();
    this.case = CaseMock[0];
    this.photos = data.photos;
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
    if (this.photos === null) return false;
    let hasPhotos = this.getPhotoCount(cropId, countyId) > 0;
    return hasPhotos;
  }

  getPhotoCount(cropId: number, countyId: number): number {
    if (this.photos === null) return 0;
    const count = this.photos.CropARLinePhotos.filter(
      (x) => x.CropId == cropId && x.CountyId == countyId
    );
    return count.length;
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
