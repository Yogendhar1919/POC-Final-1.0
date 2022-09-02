import { Injectable } from '@angular/core';
import { ImageAsset } from '@nativescript/core';
import { PhotoLocation } from '../shared/field-photo.model';

@Injectable()
export class ImageProvider {
  public current: ImageAsset = null;
  public imageLocation1: PhotoLocation = null;
  public imageLocation2: PhotoLocation = null;
}
