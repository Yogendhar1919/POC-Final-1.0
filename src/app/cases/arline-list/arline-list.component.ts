import { Component, OnInit, HostListener } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Case, CaseMock } from '../shared/cases.model';
import {
  CropARLine,
  CasePhotoWrapper,
  mockCropARLine,
} from '../shared/crop-arline.model';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'arline-list',
  moduleId: module.id,
  templateUrl: './arline-list.component.html',
  styleUrls: ['./arline-list.component.css'],
})
export class ARLineListComponent implements OnInit {
  arlineItems: CropARLine[];
  case: Case;
  photos: CasePhotoWrapper;
  countyName: string;
  _ngUnsubscribe = new Subject<void>();
  count: number = 0;
  constructor(
    private routerExtensions: RouterExtensions,
    private route: ActivatedRoute
  ) {}

  @HostListener('loaded')
  ngOnInit(): void {
    this.case = CaseMock[0];
    //this.photos = data.photos,
    this.arlineItems = mockCropARLine;
    this.countyName = this.case.Crops[0].CountyName;
  }

  @HostListener('unloaded')
  ngOnDestroy() {
    this._ngUnsubscribe.next();
    this._ngUnsubscribe.complete();
  }

  hasPhoto(cropId: number, arlineId: number, countyId: number): boolean {
    return true;
  }

  getPhotoCount(cropId: number, arlineId: number, countyId: number): number {
    return 10;
  }

  onItemTap(arline: CropARLine): void {
    this.routerExtensions.navigate(
      [
        '/cases/field-photo/',
        arline.Case.CaseId,
        arline.PolicyCropID,
        arline.ARLineID,
        arline.CropID,
        arline.CountyId,
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
