export class PhoneContact {
  ContactValue: string;
  Description: string;
  IsPrimary: boolean;
}

export class AgentPhoneContact {
  ContactValue: string;
  Description: string;
  IsPrimary: boolean;
}

export class AgentEmailContact {
  ContactValue: string;
  Description: string;
  IsPrimary: boolean;
}

export class Agency {
  Name: string;
  PhoneContacts: PhoneContact[];
  AgentPhoneContacts: AgentPhoneContact[];
  AgentEmailContacts: AgentEmailContact[];
}

export class PolicyHolder {
  BusinessName: string;
  FirstName: string;
  LastName: string;
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  Zip: string;
  EmailAddress: string;
  PhoneContacts: PhoneContact[];
}

export class ARLine {
  UnitRowID: string;
  UnitNumber: string;
  PolicyCropLineID: number;
  ARLineID: number;
  Acres: string;
  FarmName: string;
  FarmNumber: string;
  Practice: string;
  SectionTownshipRange: string;
  Share: string;
  Type: string;
}

export class NOL {
  NOLID: string;
  AdjusterName: string;
  AdjusterPersonID: string;
  DateAssigned: string;
  Status: string;
  TypeCode: string;
  NoticeType: string;
  NoticeTypeId: number;
  IsAssignedToUser: boolean;
}

export class Crop {
  CropID: number;
  CropAbbr: string;
  PolicyCropID: number;
  CountyName: string;
  CountyID: number;
  CountyCode: number;
  ARLines: ARLine[];
  NOLs: NOL[];

  constructor() {
    this.CropID = 0;
    this.CropAbbr = 'Policy Crop';
  }
}

export class Case {
  key(): string {
    return Case.formatKey(this.CaseId);
  }

  CaseId: number;
  DateCompleted: string;
  ModifiedDate: Date;
  DownloadDate: Date;
  PolicyId: number;
  PolicyPublisherId: number;
  PolicyNumber: string;
  CropYear: number;
  CountyName: string;
  AdjusterName: string;
  Agency: Agency;
  PolicyHolder: PolicyHolder;
  Crops: Crop[];

  static formatKey(caseId: number): string {
    return 'case=' + caseId.toString();
  }
}

export class CaseProxy {
  key(): string {
    return Case.formatKey(this.CaseId);
  }

  CaseId: number;
  PolicyId: number;
  PolicyPublisherId: number;
  PolicyNumber: string;
  CropYear: number;
  CountyName: string;
  AdjusterName: string;
  Agency: Agency;
  PolicyHolder: PolicyHolder;
}

export const CaseMock = [
  {
    CaseId: 1611200,
    ModifiedDate: new Date(2020, 10, 17),
    DownloadDate: new Date(2020, 10, 17),
    PolicyId: 7501456,
    PolicyNumber: 'MN-951-000000',
    CropYear: 2022,
    CountyName: 'ADAMS',
    AdjusterName: 'ADJUSTER',
    DateCompleted: '0001-01-01T00:00:00',
    PolicyPublisherId: 10000,
    Agency: {
      Name: 'AGENCY NAME',
      PhoneContacts: [
        {
          ContactValue: '(012)345-6789',
          Description: 'BUSINESS',
          IsPrimary: true,
        },
      ],
      AgentPhoneContacts: [
        {
          ContactValue: '(012)345-6789',
          Description: 'BUSINESS',
          IsPrimary: true,
        },
        {
          ContactValue: '(012)345-6789',
          Description: 'HOME',
          IsPrimary: false,
        },
      ],
      AgentEmailContacts: [],
    },
    PolicyHolder: {
      Address1: 'Address 1',
      Address2: 'Address 2',
      City: 'City',
      EmailAddress: 'abcd4qwert@gmail.com',
      State: 'MN',
      Zip: '50009',
      BusinessName: '',
      FirstName: 'FIRST NAME',
      LastName: 'LAST NAME',
      PhoneContacts: [
        {
          ContactValue: '(012)345-6789',
          Description: 'HOME',
          IsPrimary: true,
        },
      ],
    },
    Crops: [
      {
        CountyCode: 90,
        CountyID: 90,
        CountyName: 'ADAMS',
        PolicyCropID: 1000,
        CropID: 41,
        CropAbbr: 'CORN',
        ARLines: [
          {
            PolicyCropLineID: 100,
            UnitRowID: '1',
            UnitNumber: '0002-0001 OU',
            ARLineID: 36295995,
            Acres: '105.42',
            FarmName: '',
            FarmNumber: '4792',
            Practice: '3',
            SectionTownshipRange: '6-003S-007W',
            Share: '0.5432',
            Type: '016',
          },
          {
            PolicyCropLineID: 100,
            UnitRowID: '2',
            UnitNumber: '0002-0002 OU',
            ARLineID: 36295996,
            Acres: '34.02',
            FarmName: '',
            FarmNumber: '4792',
            Practice: '3',
            SectionTownshipRange: '32-002S-007W',
            Share: '0.5432',
            Type: '016',
          },
        ],
        NOLs: [
          {
            NOLID: '164125216',
            AdjusterName: 'ADJUSTER',
            AdjusterPersonID: '2003114',
            DateAssigned: '2017-09-25',
            Status: 'OPEN',
            TypeCode: 'F',
            IsAssignedToUser: true,
            NoticeType: 'Final',
            NoticeTypeId: 1,
          },
          {
            NOLID: '164125217',
            AdjusterName: 'ADJUSTER',
            AdjusterPersonID: '2003114',
            DateAssigned: '2017-09-26',
            Status: 'OPEN',
            TypeCode: 'F',
            IsAssignedToUser: true,
            NoticeType: 'Final',
            NoticeTypeId: 1,
          },
        ],
      },
    ],
  },
] as Case[];
