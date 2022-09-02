import * as geoLocation from '@nativescript/geolocation';

export class FieldPhotos {
  id: number;
  name: string;
}

export class PhotoLocation {
  latitude: number;
  longitude: number;
  direction: number;
  geoLocation: geoLocation.Location;

  hasValidDirection(): boolean {
    return (
      this.direction !== null && this.direction !== -1 && this.direction !== 0
    );
  }

  hasValidLocation(): boolean {
    return (
      this.latitude !== null &&
      this.latitude !== -1 &&
      this.latitude !== 0 &&
      this.longitude !== null &&
      this.longitude !== -1 &&
      this.longitude !== 0
    );
  }
}
