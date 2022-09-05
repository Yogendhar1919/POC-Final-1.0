import * as geoLocation from '@nativescript/geolocation';
import { PhotoLocation } from './field-photo.model';
import { CoreTypes } from '@nativescript/core';
import {
  enableLocationRequest,
  getCurrentLocation,
  isEnabled,
  watchLocation,
  clearWatch,
} from '@nativescript/geolocation';
import { Injectable, NgZone } from '@angular/core';
@Injectable()
export class LocationService {
  private watchId: number;
  private locationManager: CLLocationManager;
  constructor(private zone: NgZone) {
    this.locationManager = CLLocationManager.alloc().init();
    this.locationManager.desiredAccuracy = 3;
    this.locationManager.distanceFilter = 0.1;
    this.locationManager.headingFilter = 0.1;
  }

  enableLocationServices(): Promise<boolean> {
    return isEnabled()
      .then((enabled) => {
        if (!enabled) {
          enableLocationRequest().then(() => {
            enabled = true;
          });
        }
        return enabled;
      })
      .catch((error) => {
        throw error;
      });
  }

  getLocation(): Promise<PhotoLocation> {
    return new Promise((resolve, reject) => {
      this.enableLocationServices().then(() => {
        getCurrentLocation({
          desiredAccuracy: CoreTypes.Accuracy.high,
        })
          .then((location) => {
            let photoLocationData = new PhotoLocation();
            photoLocationData.latitude = location.latitude;
            photoLocationData.longitude = location.longitude;
            photoLocationData.direction = this.getDirection();
            //photoLocationData.direction = -1;
            photoLocationData.geoLocation = location;
            resolve(photoLocationData);
          })
          .catch((error) => {
            reject(error);
          });
      });
    });
  }

  getDistance(loc1: geoLocation.Location, loc2: geoLocation.Location): number {
    return geoLocation.distance(loc1, loc2);
  }

  canUseLocation(location1: PhotoLocation, location2: PhotoLocation): boolean {
    if (location1 == null || location2 == null) {
      return false;
    }

    var loc1: geoLocation.Location =
      this.createLocationFromPhotoLocation(location1);
    var loc2: geoLocation.Location =
      this.createLocationFromPhotoLocation(location2);

    var distance: number = geoLocation.distance(loc1, loc2);
    return distance < 20;
  }

  convertDegreesToDirectionText(direction: number): string {
    if (direction == null) {
      return 'N/A';
    }
    if (direction > 337.5) {
      return 'North';
    }
    if (direction <= 22.5 && direction >= 0) {
      return 'North';
    }
    if (direction > 22.5 && direction < 67.5) {
      return 'Northeast';
    }
    if (direction >= 67.5 && direction <= 112.5) {
      return 'East';
    }
    if (direction > 112.5 && direction < 157.5) {
      return 'Southeast';
    }
    if (direction >= 157.5 && direction <= 202.5) {
      return 'South';
    }
    if (direction > 202.5 && direction < 247.5) {
      return 'Southwest';
    }
    if (direction >= 247.5 && direction <= 292.5) {
      return 'West';
    }
    if (direction > 292.5 && direction < 337.5) {
      return 'Northwest';
    }
    return 'Could not determine direction.';
  }

  private createLocationFromPhotoLocation(
    photoLocation: PhotoLocation
  ): geoLocation.Location {
    var loc: geoLocation.Location = new geoLocation.Location();
    loc.latitude = photoLocation.latitude;
    loc.longitude = photoLocation.longitude;
    return loc;
  }

  startWatchLocation(): void {
    this.enableLocationServices().then(() => {
      this.watchId = watchLocation(
        (location) => {
          if (location) {
            this.zone.run(() => {});
          }
        },
        (error) => {},
        {}
      );
    });
  }

  stopWatchingLocation(): void {
    if (this.watchId) {
      clearWatch(this.watchId);
    }
  }
  startUpdatingLocation(): void {
    this.locationManager.startUpdatingLocation();
  }

  stopUpdatingLocation(): void {
    this.locationManager.stopUpdatingLocation();
  }

  getDirection(): number {
    return this.locationManager?.heading?.trueHeading === undefined
      ? -1
      : this.locationManager?.heading?.trueHeading;
  }

  startUpdatingHeading(): void {
    this.locationManager.startUpdatingHeading();
  }

  stopUpdatingHeading(): void {
    this.locationManager.stopUpdatingHeading();
  }
}
