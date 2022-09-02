import { Component, OnInit, Input } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { Case } from '../shared/cases.model';

@Component({
  selector: 'PolicyHeader',
  moduleId: module.id,
  templateUrl: './policy-header.component.html',
  styleUrls: ['./policy-header.component.css'],
})
export class PolicyHeaderComponent implements OnInit {
  @Input('policyNumber') PolicyNumber: string;
  @Input('cropYear') CropYear: string;
  @Input('county') County: string;
  @Input('Case') Case: Case;

  constructor(private routerExtensions: RouterExtensions) {}

  ngOnInit() {}

  onContactTab(caseData: Case): void {
    this.routerExtensions.navigate(['/claims/contact-item/', caseData.CaseId], {
      animated: true,
      transition: {
        name: 'slide',
        duration: 200,
        curve: 'ease',
      },
    });
  }
}
