import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: Photo[] = [];
  // skeleton-screen
  public fakePhotos: string[] = new Array(50);

  constructor() { }

  loadSaved(storage) {
    storage.get('photos').then((photos) => {
      this.photos = photos || [];
    });
  }
}

class Photo {
  data: any;
}