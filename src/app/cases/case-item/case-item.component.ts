import { Component, Input } from '@angular/core';
import { Case } from '../shared/cases.model';
import { RouterExtensions } from '@nativescript/angular';

@Component({
  selector: 'CaseItem',
  moduleId: module.id,
  templateUrl: './case-item.component.html',
  styleUrls: ['./case-item.component.css'],
})
export class CaseItemComponent {
  @Input('case') Case: Case;

  constructor(private routerExtensions: RouterExtensions) {}

  getInsuredName(): string {
    if (
      !this.Case.PolicyHolder.BusinessName ||
      this.Case.PolicyHolder.BusinessName.length === 0
    ) {
      return (
        this.Case.PolicyHolder.FirstName + ' ' + this.Case.PolicyHolder.LastName
      );
    } else {
      return this.Case.PolicyHolder.BusinessName;
    }
  }

  getClaimHasPhotosImage(): string {
    // if (this.photoService.hasClaimPhotos(this.Claim.ClaimId) == true) {
    //   return String.fromCharCode(0xf03e);
    // } else {
    //   return ' ';
    // }
    return '';
  }

  onPolicyTab(caseData: Case): void {
    this.routerExtensions.navigate(['/cases/crop-list/', caseData.CaseId], {
      animated: true,
      transition: {
        name: 'slide',
        duration: 200,
        curve: 'ease',
      },
    });
  }

  onContactTab(caseData: Case) {}
}
