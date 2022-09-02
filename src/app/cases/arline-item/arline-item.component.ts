import { Component, OnInit, Input } from '@angular/core';
import { CropARLine } from '../shared/crop-arline.model';

@Component({
  selector: 'ARLineItem',
  moduleId: module.id,
  templateUrl: './arline-item.component.html',
  styleUrls: ['./arline-item.component.css'],
})
export class ARLineItemComponent implements OnInit {
  @Input('crop-arLine') cropARLine: CropARLine;
  @Input('hasPhotos') hasPhotos: boolean;
  @Input('photoCount') photoCount: number;

  ngOnInit(): void {}

  getNOLs(): string {
    let typecodes: string[] = this.cropARLine.NOLs.map(
      (nols) => nols.NoticeType
    );
    typecodes.forEach((x, i) => {
      this.cropARLine.NOLs.filter(
        (nols) => nols.IsAssignedToUser && nols.NoticeType === x
      ).length > 0
        ? (typecodes[i] = typecodes[i] + '*')
        : '';
    });

    return typecodes.join(', ');
  }

  getSectionTownshipRangeOrFarmNumber(): string {
    let result = this.cropARLine.SectionTownshipRange;
    if (result.length <= 3) {
      result = `FN: ${this.cropARLine.FarmNumber}`;
    }
    return result;
  }
}
