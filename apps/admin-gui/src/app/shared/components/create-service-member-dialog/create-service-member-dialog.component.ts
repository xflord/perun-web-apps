import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  Candidate,
  ExtSource,
  Member,
  MembersManagerService,
  RichMember,
  RichUser,
  UserExtSource,
  UsersManagerService,
  Vo,
} from '@perun-web-apps/perun/openapi';
import {
  ApiRequestConfigurationService,
  FindSponsorsService,
  GuiAuthResolver,
  NotificatorService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { TABLE_VO_MEMBERS } from '@perun-web-apps/config/table-config';
import { CustomValidators } from '@perun-web-apps/perun/utils';
import { loginAsyncValidator } from '@perun-web-apps/perun/namespace-password-form';
import { MatStepper } from '@angular/material/stepper';

export interface CreateServiceMemberDialogData {
  vo: Vo;
  theme: string;
}

export interface CreateServiceMemberDialogResult {
  result: boolean;
  sponsor: boolean;
  voSponsors?: RichUser[];
  findSponsorsAuth?: boolean;
  serviceMemberId?: number;
}

@Component({
  selector: 'app-create-service-member-dialog',
  templateUrl: './create-service-member-dialog.component.html',
  styleUrls: ['./create-service-member-dialog.component.scss'],
})
export class CreateServiceMemberDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('stepper') stepper: MatStepper;
  firstFormGroup: UntypedFormGroup;
  secondFormGroup: UntypedFormGroup;

  parsedRules: Map<string, { login: string }> = new Map<string, { login: string }>();

  loading: boolean;
  theme: string;
  firstSearchDone = false;
  searchCtrl = new UntypedFormControl('');
  members: RichMember[] = [];
  selection = new SelectionModel<RichMember>(true, []);
  tableId = TABLE_VO_MEMBERS;
  assignedMembers: RichMember[] = [];
  candidate: Candidate = { beanName: '', id: 0 };
  successMessageMember = '';
  successMessagePwd = '';
  processing = false;
  setSponsorshipAuth: boolean;
  findSponsorsAuth: boolean;
  voSponsors: RichUser[] = [];

  constructor(
    private dialogRef: MatDialogRef<CreateServiceMemberDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: CreateServiceMemberDialogData,
    private membersManagerService: MembersManagerService,
    private usersManagerService: UsersManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private store: StoreService,
    private apiRequestConfiguration: ApiRequestConfigurationService,
    private _formBuilder: UntypedFormBuilder,
    private cd: ChangeDetectorRef,
    private authResolver: GuiAuthResolver,
    private findSponsors: FindSponsorsService
  ) {
    translate
      .get('DIALOGS.CREATE_SERVICE_MEMBER.SUCCESS_MEMBER')
      .subscribe((m: string) => (this.successMessageMember = m));
    translate
      .get('DIALOGS.CREATE_SERVICE_MEMBER.SUCCESS_PWD')
      .subscribe((m: string) => (this.successMessagePwd = m));
  }

  ngAfterViewInit(): void {
    this.cd.detectChanges();
  }

  ngOnInit(): void {
    this.theme = this.data.theme;
    this.firstFormGroup = this._formBuilder.group({
      nameCtrl: ['', Validators.required],
      emailCtrl: [
        '',
        [Validators.required, Validators.pattern('\\w+([.-]?\\w+)*@\\w+([.-]?\\w+)*(.\\w{2,3})+')],
      ],
      subjectCtrl: [null],
      issuerCtrl: [null],
    });
    this.secondFormGroup = this._formBuilder.group(
      {
        namespaceCtrl: ['Not selected'],
        loginCtrl: [
          '',
          [
            Validators.pattern('^[a-z][a-z0-9_-]+$'),
            Validators.maxLength(15),
            Validators.minLength(2),
          ],
        ],
        passwordCtrl: [
          '',
          Validators.required,
          [loginAsyncValidator(null, this.usersManagerService, this.apiRequestConfiguration)],
        ],
        passwordAgainCtrl: [''],
        generatePasswordCtrl: [true],
      },
      {
        validators: CustomValidators.passwordMatchValidator as ValidatorFn,
      }
    );

    const user = this.store.getPerunPrincipal().user;
    this.membersManagerService.getMembersByUser(user.id).subscribe((members) => {
      let tempMember: RichMember = {} as RichMember;
      for (const member of members) {
        if (member.voId === this.data.vo.id) {
          tempMember = member as RichMember;
        }
      }
      tempMember['user'] = user;
      this.assignedMembers.push(tempMember);
    });

    this.setSponsorshipAuth = this.authResolver.isAuthorized(
      'setSponsorshipForMember_Member_User_LocalDate_policy',
      [this.data.vo, this.store.getPerunPrincipal().user]
    );

    this.findSponsorsAuth = this.findSponsors.findSponsorsAuth(this.data.vo);
    if (this.findSponsorsAuth) {
      this.findSponsors.getSponsors(this.data.vo.id).subscribe((sponsors) => {
        this.voSponsors = sponsors;
      });
    }
  }

  onCreate(sponsor: boolean): void {
    this.processing = true;
    this.candidate['firstName'] = '';
    this.candidate['lastName'] = this.firstFormGroup.get('nameCtrl').value as string;
    this.candidate['attributes'] = {};
    this.candidate['attributes']['urn:perun:member:attribute-def:def:mail'] =
      this.firstFormGroup.get('emailCtrl').value as string;
    const subject = this.firstFormGroup.get('subjectCtrl');
    if (subject?.value as string) {
      this.candidate['userExtSource'] = {} as UserExtSource;
      this.candidate['userExtSource']['login'] = subject.value as string;
      this.candidate['userExtSource']['loa'] = 0;
      this.candidate['userExtSource']['extSource'] = {} as ExtSource;
      this.candidate['userExtSource']['extSource']['name'] = this.firstFormGroup.get('issuerCtrl')
        .value as string;
      this.candidate['userExtSource']['extSource']['type'] =
        'cz.metacentrum.perun.core.impl.ExtSourceX509';
    }

    const namespace = (this.secondFormGroup.get('namespaceCtrl').value as string).toLowerCase();
    const rules = this.parsedRules.get(namespace);
    const namespaceUrn = `urn:perun:user:attribute-def:def:login-namespace:${namespace}`;
    if (
      (this.secondFormGroup.get('namespaceCtrl').value as string) !== 'Not selected' &&
      rules.login === 'disabled'
    ) {
      this.usersManagerService
        .generateAccountForName(namespace, this.firstFormGroup.get('nameCtrl').value as string)
        .subscribe(
          (params) => {
            this.candidate['attributes'][namespaceUrn] = params[namespaceUrn];
            this.createSpecificMember(sponsor);
          },
          () => (this.processing = false)
        );
    } else {
      if (this.secondFormGroup.get('namespaceCtrl').value !== 'Not selected') {
        this.candidate['attributes'][namespaceUrn] = this.secondFormGroup.get('loginCtrl')
          .value as string;
      }
      this.createSpecificMember(sponsor);
    }
  }

  createSpecificMember(sponsor: boolean): void {
    this.membersManagerService
      .createSpecificMember({
        vo: this.data.vo.id,
        specificUserType: 'SERVICE',
        specificUserOwners: this.assignedMembers.map((m) => m.user),
        candidate: this.candidate,
      })
      .subscribe(
        (member) => {
          this.membersManagerService.validateMemberAsync(member.id).subscribe(
            (mem) => {
              this.notificator.showSuccess(this.successMessageMember);
              if (this.secondFormGroup.get('namespaceCtrl').value !== 'Not selected') {
                this.setPassword(
                  mem,
                  this.secondFormGroup.get('generatePasswordCtrl').value as boolean,
                  sponsor
                );
              } else {
                this.dialogRef.close({
                  result: true,
                  sponsor: sponsor,
                  voSponsors: this.voSponsors,
                  findSponsorsAuth: this.findSponsorsAuth,
                  serviceMemberId: member.id,
                });
              }
            },
            () => (this.processing = false)
          );
        },
        () => (this.processing = false)
      );
  }

  setPassword(member: Member, generateRandom: boolean, sponsor: boolean): void {
    const namespace: string = (
      this.secondFormGroup.get('namespaceCtrl').value as string
    ).toLowerCase();
    const password: string = this.secondFormGroup.get('passwordCtrl').value as string;
    if (generateRandom) {
      if (this.parsedRules.get(namespace).login === 'disabled') {
        this.validateMember(member.id, sponsor);
        return; // password already set when account was generated
      }
      this.usersManagerService.reserveRandomPassword(member.userId, namespace).subscribe(
        () => {
          this.usersManagerService.validatePasswordForUser(member.userId, namespace).subscribe(
            () => {
              this.validateMember(member.id, sponsor, false);
            },
            () => {
              this.processing = false;
            }
          );
        },
        () => {
          this.processing = false;
        }
      );
    } else {
      this.usersManagerService
        .reservePasswordForUser({ user: member.userId, namespace: namespace, password: password })
        .subscribe(
          () => {
            this.usersManagerService.validatePasswordForUser(member.userId, namespace).subscribe(
              () => {
                this.validateMember(member.id, sponsor);
              },
              () => {
                this.processing = false;
                this.dialogRef.close({
                  result: true,
                  sponsor: sponsor,
                  voSponsors: this.voSponsors,
                  findSponsorsAuth: this.findSponsorsAuth,
                  serviceMemberId: member.id,
                });
              }
            );
          },
          () => {
            this.processing = false;
            this.dialogRef.close({
              result: true,
              sponsor: sponsor,
              voSponsors: this.voSponsors,
              findSponsorsAuth: this.findSponsorsAuth,
              serviceMemberId: member.id,
            });
          }
        );
    }
  }

  validateMember(memberId: number, sponsor: boolean, showNotification = true): void {
    this.membersManagerService.validateMemberAsync(memberId).subscribe(
      () => {
        if (showNotification) {
          this.notificator.showSuccess(this.successMessagePwd);
        }
        this.dialogRef.close({
          result: true,
          sponsor: sponsor,
          voSponsors: this.voSponsors,
          findSponsorsAuth: this.findSponsorsAuth,
          serviceMemberId: memberId,
        });
      },
      () => {
        this.processing = false;
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close({ result: false, sponsor: false });
  }

  onSearchByString(): void {
    this.loading = true;
    this.membersManagerService
      .findCompleteRichMembersForVo(this.data.vo.id, [''], this.searchCtrl.value as string)
      .subscribe((members) => {
        this.members = members.filter((m) => !m.user.specificUser);
        this.firstSearchDone = true;
        this.loading = false;
      });
  }

  addUsers(): void {
    const temp = this.assignedMembers.map((m) => m.id);
    this.selection.selected.forEach((member) => {
      if (!temp.includes(member.id)) {
        this.assignedMembers.push(member);
      }
    });
    this.selection.clear();
  }

  removeUser(member: RichMember): void {
    this.assignedMembers = this.assignedMembers.filter((m) => m.id !== member.id);
  }

  getStepperNextConditions(): boolean {
    switch (this.stepper.selectedIndex) {
      case 0:
        return this.firstFormGroup.invalid || this.firstFormGroup.pending;
      case 1:
        return this.secondFormGroup.invalid || this.secondFormGroup.pending;
      case 2:
        return this.selection.selected.length > 0;
      default:
        return false;
    }
  }

  stepperPrevious(): void {
    this.stepper.previous();
  }

  stepperNext(): void {
    this.stepper.next();
  }
}
