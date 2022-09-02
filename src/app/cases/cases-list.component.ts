import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Case, CaseMock } from './shared/cases.model';

@Component({
  selector: 'CasesList',
  moduleId: module.id,
  templateUrl: './cases-list.component.html',
  styleUrls: ['./cases-list.component.css'],
})
export class CasesListComponent implements OnInit, AfterViewInit {
  private isComponentLoading: boolean = false;
  private casesList: Case[] = [];
  private allCases: Array<Case>;
  constructor() {}

  ngOnInit(): void {
    console.log('welcome to cases components');
  }

  ngAfterViewInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.casesList = CaseMock;
    this.allCases = CaseMock;
  }

  get claims(): Case[] {
    return this.casesList;
  }
}
