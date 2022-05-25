import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  AttributesManagerService,
  Group,
  GroupsManagerService,
  InputCreateSponsoredMemberFromCSV,
  MembersManagerService,
  NamespaceRules,
  RichGroup,
} from '@perun-web-apps/perun/openapi';
import {
  GuiAuthResolver,
  NotificatorService,
  SponsoredMembersPdfService,
  StoreService,
} from '@perun-web-apps/perun/services';
import { TranslateService } from '@ngx-translate/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { SelectionModel } from '@angular/cdk/collections';
import { Urns } from '@perun-web-apps/perun/urns';
import { TABLE_VO_GROUPS } from '@perun-web-apps/config/table-config';
import {
  downloadData,
  emailRegexString,
  hasBooleanAttributeEnabled,
  isGroupSynchronized,
} from '@perun-web-apps/perun/utils';
import { MatStepper } from '@angular/material/stepper';

interface MemberData {
  name: string;
  status: string;
  login?: string;
  password?: string;
  note?: string;
}

export interface GenerateSponsoredMembersDialogData {
  voId: number;
  theme: string;
}

interface OutputSponsoredMember {
  name: string;
  status: string;
  login: string;
  password: string;
}

@Component({
  selector: 'app-generate-sponsored-members-dialog',
  templateUrl: './generate-sponsored-members-dialog.component.html',
  styleUrls: ['./generate-sponsored-members-dialog.component.scss'],
})
export class GenerateSponsoredMembersDialogComponent implements OnInit {
  @ViewChild('stepper') stepper: MatStepper;

  theme: string;
  loading = false;
  functionalityNotSupported = false;

  namespaceOptions: string[] = [];
  usersInfoFormGroup: FormGroup;
  state: 'user-input' | 'results' = 'user-input';
  passwordReset = 'generate';
  groupAssignment: string = null;
  expiration = 'never';
  createGroupAuth: boolean;
  assignableGroups: Group[] = [];
  allVoGroups: Group[] = [];
  selection = new SelectionModel<Group>(true, []);
  manualMemberAddingBlocked = false;
  name = '';
  description = '';
  asSubGroup = false;
  parentGroup: Group = null;
  groupIds: number[] = [];
  filterValue = '';
  tableId = TABLE_VO_GROUPS;
  finishedWithErrors = false;
  private namespaceRules: NamespaceRules[] = [];
  private resultData: MemberData[] = [];

  private groupAttrNames = [Urns.GROUP_SYNC_ENABLED, Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING];

  constructor(
    private dialogRef: MatDialogRef<GenerateSponsoredMembersDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: GenerateSponsoredMembersDialogData,
    private store: StoreService,
    private membersService: MembersManagerService,
    private notificator: NotificatorService,
    private translate: TranslateService,
    private guiAuthResolver: GuiAuthResolver,
    private groupsService: GroupsManagerService,
    private attributesService: AttributesManagerService,
    private formBuilder: FormBuilder,
    private sponsoredMembersPDFService: SponsoredMembersPdfService,
    private cd: ChangeDetectorRef
  ) {}

  private static didSomeGenerationFailed(resultData: { [p: string]: string }[]): boolean {
    resultData.forEach((entry: { [p: string]: string }) => {
      if (entry['status'] !== 'OK') {
        return true;
      }
    });
    return false;
  }

  ngOnInit(): void {
    this.loading = true;
    this.theme = this.data.theme;
    this.createGroupAuth = this.guiAuthResolver.isAuthorized('createGroup_Vo_Group_policy', [
      { id: this.data.voId, beanName: 'Vo' },
    ]);
    this.usersInfoFormGroup = this.formBuilder.group({
      namespace: ['', Validators.required],
      sponsoredMembers: ['', [Validators.required, this.userInputValidator()]],
    });
    this.usersInfoFormGroup.controls['namespace'].valueChanges.subscribe({
      next: () => {
        this.usersInfoFormGroup.controls['sponsoredMembers'].updateValueAndValidity();
      },
    });

    this.attributesService.getVoAttributes(this.data.voId).subscribe(
      (attributes) => {
        this.manualMemberAddingBlocked = hasBooleanAttributeEnabled(
          attributes,
          Urns.VO_BLOCK_MANUAL_MEMBER_ADDING
        );
        if (!this.manualMemberAddingBlocked) {
          this.groupsService
            .getAllRichGroupsWithAttributesByNames(this.data.voId, this.groupAttrNames)
            .subscribe(
              (grps) => {
                this.allVoGroups = grps.filter((grp) => grp.name !== 'members');
                this.assignableGroups = this.filterAssignableGroups(grps);
                this.membersService.getAllNamespacesRules().subscribe((rules) => {
                  if (this.store.get('allow_empty_sponsor_namespace')) {
                    this.namespaceRules.push({
                      namespaceName: 'No namespace',
                      csvGenHeader:
                        'firstname;lastname;urn:perun:user:attribute-def:def:preferredMail',
                      csvGenPlaceholder: 'John;Doe;john@mail.cz',
                      csvGenHeaderDescription: 'First name;Last name;Email',
                    });
                  }

                  this.namespaceRules = this.namespaceRules.concat(rules);
                  this.namespaceRules.forEach((item) =>
                    this.namespaceOptions.push(item.namespaceName)
                  );
                  if (this.namespaceOptions.length === 0) {
                    this.functionalityNotSupported = true;
                  } else {
                    this.usersInfoFormGroup.setValue({
                      namespace: this.namespaceOptions[0],
                      sponsoredMembers: '',
                    });
                  }
                  this.loading = false;
                  this.cd.detectChanges();
                });
              },
              () => (this.loading = false)
            );
        } else {
          this.loading = false;
          this.cd.detectChanges();
        }
      },
      () => (this.loading = false)
    );
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onClose(): void {
    this.dialogRef.close(true);
  }

  setExpiration(newExpiration: string): void {
    if (newExpiration === 'never') {
      this.expiration = 'never';
    } else {
      this.expiration = formatDate(newExpiration, 'yyyy-MM-dd', 'en-GB');
    }
  }

  applyFilter(filterValue: string): void {
    this.filterValue = filterValue;
  }

  groupAssigmentChanged(): void {
    this.selection.clear();

    this.name = '';
    this.description = '';
    this.asSubGroup = false;
    this.parentGroup = null;
  }

  onSubmit(): void {
    this.loading = true;
    if (this.groupAssignment === 'new') {
      if (this.asSubGroup) {
        this.groupsService
          .createGroupWithParentGroupNameDescription(
            this.parentGroup.id,
            this.name,
            this.description
          )
          .subscribe(
            (group) => {
              this.groupIds.push(group.id);
              this.onGenerate();
            },
            () => (this.loading = false)
          );
      } else {
        this.groupsService
          .createGroupWithVoNameDescription(this.data.voId, this.name, this.description)
          .subscribe(
            (group) => {
              this.groupIds.push(group.id);
              this.onGenerate();
            },
            () => (this.loading = false)
          );
      }
    } else {
      if (this.groupAssignment === 'existing') {
        this.groupIds = this.selection.selected.map((grp) => grp.id);
      }
      this.onGenerate();
    }
  }

  getSelectedNamespaceRules(): NamespaceRules {
    return this.namespaceRules.find(
      (item) => item.namespaceName === this.usersInfoFormGroup.get('namespace').value
    );
  }

  generatePdf(): void {
    if (!this.resultData) {
      throw new Error('Cannot generate pdf because there is no result');
    }

    this.loading = true;
    void this.sponsoredMembersPDFService
      .generate(this.resultData)
      .then(() => (this.loading = false));
  }

  downloadCsv(): void {
    if (!this.resultData) {
      throw new Error('Cannot generate pdf because there is no result');
    }
    downloadData(this.createOutputObjects(this.resultData), 'csv', 'member-logins');
  }

  getStepperNextConditions(): boolean {
    switch (this.stepper.selectedIndex) {
      case 0:
        return this.usersInfoFormGroup.invalid;
      case 1:
        return this.passwordReset === null;
      case 2:
        return this.expiration === null;
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

  private filterAssignableGroups(groups: RichGroup[]): RichGroup[] {
    const assignableGroups: RichGroup[] = [];
    for (const grp of groups) {
      if (
        !(
          isGroupSynchronized(grp) ||
          hasBooleanAttributeEnabled(grp.attributes, Urns.GROUP_BLOCK_MANUAL_MEMBER_ADDING)
        ) &&
        this.guiAuthResolver.isAuthorized('addMembers_Group_List<Member>_policy', [grp])
      ) {
        assignableGroups.push(grp);
      }
    }
    return assignableGroups;
  }

  private createOutputObjects(data: MemberData[]): OutputSponsoredMember[] {
    let name = '';
    let status = '';
    let login = '';
    let password = '';
    const output: OutputSponsoredMember[] = [];

    data.forEach((memberData: MemberData) => {
      name = memberData['name'].replace(';', ' ').split(';')[0];
      status = memberData['status'];
      login = memberData['login'] ? memberData['login'] : login;
      password = memberData['password'] ? memberData['password'] : password;

      const line = { name: name, status: status, login: login, password: password };

      if (memberData['note']) {
        line['note'] = memberData['note'];
      }

      output.push(line);
    });

    return output;
  }

  private onGenerate(): void {
    this.loading = true;
    const listOfMembers: string[] = (
      this.usersInfoFormGroup.get('sponsoredMembers').value as string
    ).split('\n');
    const header = this.getSelectedNamespaceRules().csvGenHeader;
    const generatedMemberNames: string[] = [];
    for (const line of listOfMembers) {
      const parsedLine = this.parseMemberLine(line);
      if (parsedLine !== 'format' && parsedLine !== 'email') {
        if (parsedLine !== '') {
          generatedMemberNames.push(parsedLine);
        }
      } else {
        this.loading = false;
        return;
      }
    }

    const inputSponsoredMembersFromCSV: InputCreateSponsoredMemberFromCSV = {
      data: generatedMemberNames,
      header: header,
      namespace: '',
      sponsor: this.store.getPerunPrincipal().userId,
      vo: this.data.voId,
      sendActivationLinks: this.passwordReset === 'reset',
    };

    if (this.groupAssignment !== 'none') {
      inputSponsoredMembersFromCSV.groups = this.groupIds;
    }

    if (this.expiration !== 'never') {
      inputSponsoredMembersFromCSV.validityTo = formatDate(this.expiration, 'yyyy-MM-dd', 'en-GB');
    }

    if (this.usersInfoFormGroup.get('namespace').value !== 'No namespace') {
      inputSponsoredMembersFromCSV.namespace = this.usersInfoFormGroup.get('namespace')
        .value as string;
    }

    this.membersService.createSponsoredMembersFromCSV(inputSponsoredMembersFromCSV).subscribe(
      (resultData) => {
        this.state = 'results';
        this.finishedWithErrors =
          GenerateSponsoredMembersDialogComponent.didSomeGenerationFailed(resultData);
        this.loading = false;
        this.resultData = resultData as unknown as MemberData[];
      },
      () => (this.loading = false)
    );
  }

  private parseMemberLine(line: string): string {
    const trimLine = line.trim();
    if (trimLine === '') {
      return '';
    }
    const memberAttributes = trimLine.split(';');
    const arrayOfAttributes = this.getSelectedNamespaceRules().csvGenHeader.split(';');
    if (memberAttributes.length !== arrayOfAttributes.length) {
      //check if all attributes are filled
      return 'format';
    }
    //now we expect that mail is always on the same index - third position
    if (arrayOfAttributes[2].slice(arrayOfAttributes[2].length - 4).toLowerCase() === 'mail') {
      //check if the third attribute is mail
      if (!memberAttributes[2].trim().match(emailRegexString)) {
        //check if the email is valid email
        return 'email';
      }
    }
    //login must be non empty and we are expecting him in forth position
    if (arrayOfAttributes[3] === 'login') {
      //check if the forth attribute is login
      if (memberAttributes[3].trim() === '') {
        //check if login is nonempty
        return 'login';
      }
    }
    let finalString = '';
    for (const memberAttribute of memberAttributes) {
      finalString += memberAttribute.trim() + ';';
    }
    return finalString.slice(0, -1);
  }

  private userInputValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: { [key: string]: string } } | null => {
      const listOfMembers: string[] = (control.value as string).split('\n');
      for (const line of listOfMembers) {
        const parsedLine: string = this.parseMemberLine(line);
        if (parsedLine === 'format') {
          return { invalidFormat: { value: line } };
        }
        if (parsedLine === 'email') {
          return { invalidEmail: { value: line } };
        }
        if (parsedLine === 'login') {
          return { invalidLogin: { value: line } };
        }
      }

      return null;
    };
  }
}
