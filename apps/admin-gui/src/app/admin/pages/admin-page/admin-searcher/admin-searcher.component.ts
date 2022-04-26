import { Component, HostBinding, OnInit } from '@angular/core';
import {
  AttributeDefinition,
  AttributesManagerService,
  EnrichedFacility,
  RichMember,
  RichUser,
  SearcherService,
  Vo,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';
import {
  TABLE_SEARCHER_FACILITIES,
  TABLE_SEARCHER_MEMBERS,
  TABLE_SEARCHER_RESOURCES,
  TABLE_SEARCHER_USERS,
} from '@perun-web-apps/config/table-config';
import { ResourceWithStatus } from '@perun-web-apps/perun/models';

@Component({
  selector: 'app-admin-searcher',
  templateUrl: './admin-searcher.component.html',
  styleUrls: ['./admin-searcher.component.scss'],
})
export class AdminSearcherComponent implements OnInit {
  static id = 'AdminSearcherComponent';

  @HostBinding('class.router-component') true;

  constructor(
    private attributesManager: AttributesManagerService,
    private searcher: SearcherService,
    private voService: VosManagerService
  ) {}

  loading: boolean;
  loadingEntityData = false;
  allAttrDefinitions: AttributeDefinition[] = [];
  searchInput: { [p: string]: string };
  tableId = TABLE_SEARCHER_USERS;
  entities: RichUser[] | RichMember[] | EnrichedFacility[] | ResourceWithStatus[] = [];
  vos: Vo[] = [];
  selectedVo: Vo;

  ngOnInit(): void {
    this.loading = true;
    this.attributesManager.getAllAttributeDefinitions().subscribe((attrDefs) => {
      this.allAttrDefinitions = attrDefs;
      this.loading = false;
    });
  }

  tabChanged(indexChangeEvent: number): void {
    this.entities = [];
    switch (indexChangeEvent) {
      case 0:
        this.tableId = TABLE_SEARCHER_USERS;
        break;
      case 1:
        this.loadingEntityData = true;
        this.loadAllVos();
        this.tableId = TABLE_SEARCHER_MEMBERS;
        break;
      case 2:
        this.tableId = TABLE_SEARCHER_FACILITIES;
        break;
      case 3:
        this.tableId = TABLE_SEARCHER_RESOURCES;
        break;
      default:
        break;
    }
  }

  loadAllVos(): void {
    this.loadingEntityData = true;
    this.voService.getAllVos().subscribe((vos) => {
      this.vos = vos;
      this.selectedVo = vos[0];
      this.loadingEntityData = false;
    });
  }

  voSelected(vo: Vo): void {
    if (vo !== undefined) {
      this.selectedVo = vo;
    }
  }

  searchEntities(event: { [p: string]: string }, entity: string): void {
    this.searchInput = event;
    this.loadingEntityData = true;
    switch (entity) {
      case 'user':
        this.getUsers();
        break;
      case 'member':
        this.getMembers();
        break;
      case 'facility':
        this.getFacilities();
        break;
      case 'resource':
        this.getResources();
        break;
      default:
        break;
    }
  }

  getUsers(): void {
    this.searcher
      .getUsersSearcher({
        attributesWithSearchingValues: this.searchInput,
      })
      .subscribe((users) => {
        this.entities = users as RichUser[];
        this.loadingEntityData = false;
      });
  }

  getMembers(): void {
    this.searcher
      .getMembersByUserAttributes({
        vo: this.selectedVo.id,
        userAttributesWithSearchingValues: this.searchInput,
      })
      .subscribe((members) => {
        this.entities = members as RichMember[];
        this.loadingEntityData = false;
      });
  }

  getFacilities(): void {
    this.searcher
      .getFacilities({
        attributesWithSearchingValues: this.searchInput,
      })
      .subscribe((facilities) => {
        this.entities = facilities.map((f) => ({ facility: f })) as EnrichedFacility[];
        this.loadingEntityData = false;
      });
  }

  getResources(): void {
    this.searcher
      .getAttributesResources({
        attributesWithSearchingValues: this.searchInput,
      })
      .subscribe((resources) => {
        this.entities = resources as ResourceWithStatus[];
        this.loadingEntityData = false;
      });
  }
}
