import { Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as shape from 'd3-shape';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import {
  FacilitiesManagerService,
  Facility,
  Group,
  GroupsManagerService,
  Member,
  MembersManagerService,
  Resource,
  ResourcesManagerService,
  RichDestination,
  Service,
  ServicesManagerService,
  User,
  UsersManagerService,
  VosManagerService,
} from '@perun-web-apps/perun/openapi';

interface GraphNode {
  id: string;
  label: string;
  tooltip: string;
  color: string;
  tip: string;
}

interface Link {
  source: string;
  target: string;
}

interface HierarchicalGraph {
  nodes: GraphNode[];
  links: Link[];
}

@Component({
  selector: 'app-user-destination-graph',
  templateUrl: './user-destination-graph.component.html',
  styleUrls: ['./user-destination-graph.component.scss'],
})
export class UserDestinationGraphComponent implements OnInit {
  @HostBinding('class.router-component') true;

  user: User;
  destination: string;
  service: string;
  isConnected = false;
  loading = true;
  hierarchialGraph: HierarchicalGraph = { nodes: [], links: [] };
  curve = shape.curveBundle;
  zoomToFit$: Subject<boolean> = new Subject();
  innerWidth: number;
  innerHeight: number;
  private membership: Member[];
  private facilities: Facility[];
  private idCounter = 0;
  private localUser: string;
  private localVo: string;
  private localGroup: string;
  private localResource: string;
  private localFacility: string;
  private localService: string;
  private localDestination: string;

  constructor(
    private route: ActivatedRoute,
    private facilityManager: FacilitiesManagerService,
    private userService: UsersManagerService,
    private membersService: MembersManagerService,
    private serviceService: ServicesManagerService,
    private resourceManager: ResourcesManagerService,
    private groupService: GroupsManagerService,
    private voService: VosManagerService,
    private translate: TranslateService
  ) {}

  static findConnectedGroups(groups1: Group[], groups2: Group[]): Group[] {
    const result: Group[] = [];
    for (const item of groups1) {
      for (const item1 of groups2) {
        if (item.id === item1.id) {
          result.push(item);
        }
      }
    }
    return result;
  }

  static findConnectedResources(r1: Resource[], r2: Resource[]): Resource[] {
    const result: Resource[] = [];
    for (const item of r1) {
      for (const item1 of r2) {
        if (item.id === item1.id) {
          result.push(item);
        }
      }
    }
    return result;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (window.innerWidth < 600) {
      this.innerWidth = window.innerWidth;
    } else {
      this.innerWidth = window.innerWidth - 420;
    }
    this.innerHeight = window.innerHeight;
  }

  ngOnInit(): void {
    if (window.innerWidth < 600) {
      this.innerWidth = window.innerWidth;
    } else {
      this.innerWidth = window.innerWidth - 420;
    }
    this.innerHeight = window.innerHeight;
    this.getLocalizedNames();
    this.route.queryParams.subscribe((params) => {
      this.destination = String(params['destination']);
      this.service = String(params['service']);
      this.userService.getUserById(Number(params['user'])).subscribe((user) => {
        this.user = user;
        this.facilityManager
          .getFacilitiesByDestination(this.destination)
          .subscribe((facilities) => {
            this.facilities = facilities;
            this.membersService.getMembersByUser(this.user.id).subscribe((membership) => {
              this.membership = membership;
              if (this.membership.length === 0 || this.facilities.length === 0) {
                this.loading = false;
                this.isConnected = false;
                return;
              }
              this.showGraph();
            });
          });
      });
    });
  }

  private showGraph(): void {
    const nodeId1 = '' + this.id().toString();
    const nodeLabel1 = this.user.firstName ?? '' + ' ' + this.user.lastName ?? '';
    const nodeTooltip1 = this.localUser;
    const tip1 = 'user: ' + this.user.id.toString();
    const nodeUser: GraphNode = {
      id: nodeId1,
      label: nodeLabel1,
      tooltip: nodeTooltip1,
      color: '#FFFFCC',
      tip: tip1,
    };
    this.hierarchialGraph.nodes.push(nodeUser);

    const nodeId2 = '' + this.id().toString();
    const tip2 = 'destination no id';
    if (this.service === 'noService') {
      const nodeLabel2 = this.destination;
      const nodeTooltip2 = this.localDestination + ': ' + this.destination;
      const nodeDestination: GraphNode = {
        id: nodeId2,
        label: nodeLabel2,
        tooltip: nodeTooltip2,
        color: '#E0E0E0',
        tip: tip2,
      };
      this.hierarchialGraph.nodes.push(nodeDestination);
    } else {
      const nodeLabel2 = this.service + ': ' + this.destination;
      const nodeTooltip2 =
        this.localService +
        ': ' +
        this.service +
        ', ' +
        this.localDestination +
        ': ' +
        this.destination;
      const nodeDestination: GraphNode = {
        id: nodeId2,
        label: nodeLabel2,
        tooltip: nodeTooltip2,
        color: '#E0E0E0',
        tip: tip2,
      };
      this.hierarchialGraph.nodes.push(nodeDestination);
    }

    for (const facility of this.facilities) {
      this.serviceService
        .getAllRichDestinationsForFacility(facility.id)
        .subscribe((destinations) => {
          this.connectToService(facility, destinations);
          setTimeout(() => {
            this.zoomToFit$.next(true);
            this.loading = false;
          }, 2000);
        });
    }
  }

  private connectToService(facility: Facility, destinations: RichDestination[]): void {
    if (this.isConnectedToService(destinations)) {
      this.facilityManager
        .getAssignedResourcesForFacility(facility.id)
        .subscribe((connectedResources) => {
          for (const item of this.membership) {
            this.connectToGroups(facility, item, connectedResources);
          }
        });
    }
  }

  private connectToGroups(
    facility: Facility,
    member: Member,
    connectedResources: Resource[]
  ): void {
    this.facilityManager.getAllowedGroups(facility.id, member.voId).subscribe((allowedGroups) => {
      if (allowedGroups.length !== 0) {
        this.groupService.getMemberGroups(member.id).subscribe((memberGroups) => {
          const connectedGroups: Group[] = UserDestinationGraphComponent.findConnectedGroups(
            allowedGroups,
            memberGroups
          );
          if (connectedGroups.length !== 0) {
            for (const group of connectedGroups) {
              this.connectToResource(facility, group, connectedResources);
            }
          }
        });
      }
    });
  }

  private haveService(assignedServices: Service[]): boolean {
    if (this.service === 'noService') {
      return true;
    }
    for (const service of assignedServices) {
      if (this.service === service.name) {
        return true;
      }
    }
    return false;
  }

  private connectToResource(
    facility: Facility,
    group: Group,
    connectedResources: Resource[]
  ): void {
    this.resourceManager.getAssignedResourcesWithGroup(group.id).subscribe((assignedResources) => {
      const resources: Resource[] = UserDestinationGraphComponent.findConnectedResources(
        assignedResources,
        connectedResources
      );
      for (const resource of resources) {
        this.resourceManager
          .getAssignedServicesToResource(resource.id)
          .subscribe((assignedServices) => {
            if (this.haveService(assignedServices)) {
              this.isConnected = true;
              this.addNodesToGraph(group.voId, group, resource, facility); // add nodes and links
            }
          });
      }
    });
  }

  private addNodesToGraph(
    voId: number,
    group: Group,
    resource: Resource,
    facility: Facility
  ): void {
    if (this.findEntityInGraph('Facility: ' + facility.id.toString()) === -1) {
      const nodeId3 = '' + this.id().toString();
      const nodeLabel3 = this.localFacility + ': ' + facility.name;
      const nodeTooltip3 = facility.description;
      const tip3 = 'Facility: ' + facility.id.toString();
      const nodeFacility: GraphNode = {
        id: nodeId3,
        label: nodeLabel3,
        tooltip: nodeTooltip3,
        color: '#FFCCFF',
        tip: tip3,
      };
      this.hierarchialGraph.nodes.push(nodeFacility);

      const linkDest: Link = {
        source: nodeId3,
        target: this.hierarchialGraph.nodes[this.findEntityInGraph('destination no id')].id,
      };
      this.hierarchialGraph.links.push(linkDest);
    }

    this.voService.getVoById(voId).subscribe((vo) => {
      if (this.findEntityInGraph('Vo: ' + vo.id.toString()) === -1) {
        const nodeIdV: string = this.id().toString();
        const nodeLabelV = this.localVo + ': ' + vo.shortName;
        const nodeTooltipV = vo.name;
        const tipV = 'Vo: ' + vo.id.toString();
        const nodeV: GraphNode = {
          id: nodeIdV,
          label: nodeLabelV,
          tooltip: nodeTooltipV,
          color: '#E5FFCC',
          tip: tipV,
        };
        this.hierarchialGraph.nodes.push(nodeV);

        const linkV: Link = {
          source:
            this.hierarchialGraph.nodes[this.findEntityInGraph('user: ' + this.user.id.toString())]
              .id,
          target: nodeIdV,
        };
        this.hierarchialGraph.links.push(linkV);
      }

      if (this.findEntityInGraph('Group: ' + group.id.toString()) === -1) {
        const nodeIdG: string = this.id().toString();
        const nodeLabelG = this.localGroup + ': ' + group.name;
        const nodeTooltipG = group.description;
        const tipG = 'Group: ' + group.id.toString();
        const nodeG: GraphNode = {
          id: nodeIdG,
          label: nodeLabelG,
          tooltip: nodeTooltipG,
          color: '#CCE5FF',
          tip: tipG,
        };
        this.hierarchialGraph.nodes.push(nodeG);

        const linkG: Link = {
          source: this.hierarchialGraph.nodes[this.findEntityInGraph('Vo: ' + vo.id.toString())].id,
          target: nodeIdG,
        };
        this.hierarchialGraph.links.push(linkG);
      }

      const duplicate: number = this.findEntityInGraph('Resource: ' + resource.id.toString());
      if (duplicate !== -1) {
        const linkR: Link = {
          source:
            this.hierarchialGraph.nodes[this.findEntityInGraph('Group: ' + group.id.toString())].id,
          target: this.hierarchialGraph.nodes[duplicate].id,
        };
        this.hierarchialGraph.links.push(linkR);
      } else {
        const nodeIdR: string = this.id().toString();
        const nodeLabelR = this.localResource + ': ' + resource.name;
        const nodeTooltipR = resource.description;
        const tipR = 'Resource: ' + resource.id.toString();
        const nodeR: GraphNode = {
          id: nodeIdR,
          label: nodeLabelR,
          tooltip: nodeTooltipR,
          color: '#FFCCCC',
          tip: tipR,
        };

        this.hierarchialGraph.nodes.push(nodeR);

        const linkR: Link = {
          source:
            this.hierarchialGraph.nodes[this.findEntityInGraph('Group: ' + group.id.toString())].id,
          target: nodeIdR,
        };
        this.hierarchialGraph.links.push(linkR);

        const linkF: Link = {
          source: nodeIdR,
          target:
            this.hierarchialGraph.nodes[
              this.findEntityInGraph('Facility: ' + facility.id.toString())
            ].id,
        };
        this.hierarchialGraph.links.push(linkF);
      }
    });
  }

  private findEntityInGraph(id: string): number {
    for (let i = 0; i < this.hierarchialGraph.nodes.length; i++) {
      if (this.hierarchialGraph.nodes[i].tip === id) {
        return i;
      }
    }
    return -1;
  }

  private isConnectedToService(destinations: RichDestination[]): boolean {
    for (const potentialDestination of destinations) {
      if (potentialDestination.destination === this.destination) {
        if (potentialDestination.service.name === this.service || this.service === 'noService') {
          return true;
        }
      }
    }
    return false;
  }

  private id(): number {
    this.idCounter++;
    return this.idCounter;
  }

  private getLocalizedNames(): void {
    this.translate.get('ADMIN.VISUALIZER.USER_DESTINATION.USER').subscribe((text: string) => {
      this.localUser = text;
    });
    this.translate.get('ADMIN.VISUALIZER.USER_DESTINATION.VO').subscribe((text: string) => {
      this.localVo = text;
    });
    this.translate.get('ADMIN.VISUALIZER.USER_DESTINATION.GROUP').subscribe((text: string) => {
      this.localGroup = text;
    });
    this.translate.get('ADMIN.VISUALIZER.USER_DESTINATION.RESOURCE').subscribe((text: string) => {
      this.localResource = text;
    });
    this.translate.get('ADMIN.VISUALIZER.USER_DESTINATION.FACILITY').subscribe((text: string) => {
      this.localFacility = text;
    });
    this.translate.get('ADMIN.VISUALIZER.USER_DESTINATION.SERVICE').subscribe((text: string) => {
      this.localService = text;
    });
    this.translate
      .get('ADMIN.VISUALIZER.USER_DESTINATION.DESTINATION')
      .subscribe((text: string) => {
        this.localDestination = text;
      });
  }
}
