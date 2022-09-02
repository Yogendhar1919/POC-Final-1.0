import { Component, OnInit, Input } from '@angular/core';
import { Crop } from '../shared/cases.model';

@Component({
  selector: 'cropItem',
  templateUrl: './crop-item.component.html',
  styleUrls: ['./crop-item.component.css'],
  moduleId: module.id,
})
export class CropItemComponent implements OnInit {
  @Input('crop') crop: Crop;
  @Input('hasPhotos') hasPhoto: boolean;
  @Input('photoCount') photoCount: number;
  constructor() {}

  ngOnInit() {
    console.log(this.crop);
    console.log(this.hasPhotos);
    console.log(this.photoCount);
  }
}
