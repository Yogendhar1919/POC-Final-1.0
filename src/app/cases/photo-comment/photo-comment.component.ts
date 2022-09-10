import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { CropARLine, CropARLinePhoto } from '../shared/crop-arline.model';
import { ad } from '@nativescript/core/utils';
import { TextView } from '@nativescript/core';

@Component({
  selector: 'PhotoComment',
  moduleId: module.id,
  templateUrl: './photo-comment.component.html',
  styleUrls: ['./photo-comment.component.css'],
})
export class PhotoCommentComponent {
  standardLabel: string =
    'Optional info can be entered now or later in MP Quest. Enter info by typing or speaking:';
  requirementsLabel: string = 'Required info must be entered now. ';
  standardPrompt: string = 'Optional: \n- Photo description';
  requirementsPrompt: string = 'Required:\n';
  acreagePrompt: string = '- Acres\n';
  locationPrompt: string = '- Nearest intersection with distance.\n';
  directionPrompt: string = '- Direction of view\n';

  commentPrompt: string;
  commentLabel: string;

  commentLength: number = 0;

  @ViewChild('comments', { static: false }) commentElement: ElementRef;
  @Input('photo') cropARLinePhoto: CropARLinePhoto;
  @Input('croparline') cropARLine: CropARLine;

  init(comment: string): void {
    this.cropARLinePhoto.Comments = comment || '';
    if (comment.length) {
      this.commentLength = comment.length;
    }
    this.createCommentPlaceholder();
    this.openCommentsInput();
  }

  public onChange(args: any): void {
    console.log('bum');
    let textView: TextView = <TextView>args.object;
    if (textView.text === undefined) {
      //this.commentLength = 0;
    } else {
      this.commentLength = textView.text.length;
    }
  }

  private openCommentsInput(): void {
    let commentsField: TextView = <TextView>this.commentElement.nativeElement;
    commentsField.text = this.cropARLinePhoto.Comments;

    if (commentsField.ios) {
      commentsField.focus();
    }
  }

  private createCommentPlaceholder(): void {
    let needsLocations: boolean =
      this.cropARLinePhoto.Latitude === undefined ||
      this.cropARLinePhoto.Latitude === null ||
      this.cropARLinePhoto.Latitude === 0 ||
      this.cropARLinePhoto.Longitude === undefined ||
      this.cropARLinePhoto.Longitude === null ||
      this.cropARLinePhoto.Longitude === 0;

    let needsDirection: boolean =
      this.cropARLinePhoto.Direction === undefined ||
      this.cropARLinePhoto.Direction === null ||
      this.cropARLinePhoto.Direction < 0;

    let needsAcreage: boolean = this.cropARLine.isDefaultLine();
    let hasRequirements: boolean =
      needsAcreage || needsDirection || needsLocations;
    this.commentPrompt = '';
    this.commentLabel = '';

    if (hasRequirements) {
      this.commentPrompt += this.requirementsPrompt;
      this.commentLabel += this.requirementsLabel;
    }

    if (needsAcreage) {
      this.commentPrompt += this.acreagePrompt;
      hasRequirements = true;
    }

    if (needsLocations) {
      this.commentPrompt += this.locationPrompt;
      hasRequirements = true;
    }

    if (needsDirection) {
      this.commentPrompt += this.directionPrompt;
      hasRequirements = true;
    }

    this.commentLabel += this.standardLabel;
    this.commentPrompt += this.standardPrompt;
  }

  closeCommentsInput(): void {
    let commentsField: TextView = <TextView>this.commentElement.nativeElement;
    if (commentsField.android) {
      setTimeout(() => {
        commentsField.dismissSoftInput();
        commentsField.android.clearFocus();
      }, 300);
    } else {
      setTimeout(() => {
        commentsField.dismissSoftInput();
      }, 0);
    }
  }
}
