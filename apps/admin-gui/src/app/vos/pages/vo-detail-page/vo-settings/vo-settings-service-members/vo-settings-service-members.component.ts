import { Component, OnInit } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { MembersManagerService, RichMember, Vo } from '@perun-web-apps/perun/openapi';
import {
  TABLE_SERVICE_MEMBERS
} from '@perun-web-apps/config/table-config';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { GuiAuthResolver } from '@perun-web-apps/perun/services';
import { getDefaultDialogConfig } from '@perun-web-apps/perun/utils';
import { CreateServiceMemberDialogComponent } from '../../../../../shared/components/create-service-member-dialog/create-service-member-dialog.component';
import { RemoveMembersDialogComponent } from '../../../../../shared/components/dialogs/remove-members-dialog/remove-members-dialog.component';

@Component({
  selector: 'app-vo-settings-service-members',
  templateUrl: './vo-settings-service-members.component.html',
  styleUrls: ['./vo-settings-service-members.component.scss']
})
export class VoSettingsServiceMembersComponent implements OnInit {

  voId: number;
  members: RichMember[] = [];
  selection = new SelectionModel<RichMember>(true, []);
  searchString = '';
  loading = false;
  tableId = TABLE_SERVICE_MEMBERS;
  removeAuth: boolean;

  constructor(private membersManager: MembersManagerService,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private authResolver: GuiAuthResolver,
              private authzService: GuiAuthResolver) {
  }

  ngOnInit(): void {
    this.loading = true;
    this.route.parent.params.subscribe(parentParentParams => {
      this.voId = parentParentParams ['voId'];
      this.refresh();
    });
    const vo: Vo = {
      beanName: '', id: this.voId
    }
    this.removeAuth = this.authzService.isAuthorized('deleteMembers_List<Member>_policy', [vo]);
  }

  createServiceMember() {
    const config = getDefaultDialogConfig();
    config.width = '750px';
    config.data = {
      voId: this.voId
    };

    const dialogRef = this.dialog.open(CreateServiceMemberDialogComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if(result){
       this.refresh();
      }
    });
  }

  onRemoveMembers() {
    const config = getDefaultDialogConfig();
    config.width = '450px';
    config.data = {
      members: this.selection.selected,
      theme: 'vo-theme'
    };

    const dialogRef = this.dialog.open(RemoveMembersDialogComponent, config);

    dialogRef.afterClosed().subscribe(wereMembersDeleted => {
      if (wereMembersDeleted) {
        this.refresh()
        this.selection.clear();
      }
    });
  }

  applyFilter(filterValue: string) {
    this.searchString = filterValue;
  }


  refresh() {
    this.loading = true;
    this.membersManager.findCompleteRichMembersForVo(this.voId, [null], '(Service)').subscribe(members => {
      this.members = members;
      this.loading = false;
    });
  }
}
