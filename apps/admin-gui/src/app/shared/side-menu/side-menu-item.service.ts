import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EntityMenuLink, SideMenuItem } from './side-menu.component';
import {
  ApiRequestConfigurationService,
  GuiAuthResolver,
  NotificatorService,
  RoutePolicyService,
  StoreService,
} from '@perun-web-apps/perun/services';
import {
  AttributesManagerService,
  Facility,
  Group,
  Resource,
  RichMember,
  Service,
  User,
  Vo,
} from '@perun-web-apps/perun/openapi';
import { parseFullName } from '@perun-web-apps/perun/utils';
import { GetResourceRoutePipe } from '@perun-web-apps/perun/pipes';
import { Urns } from '@perun-web-apps/perun/urns';
import { RPCError } from '@perun-web-apps/perun/models';

@Injectable({
  providedIn: 'root',
})
export class SideMenuItemService {
  baseItemColor = this.store.get('theme', 'sidemenu_bg_color') as string;
  voBgColor = this.store.get('theme', 'sidemenu_vo_bg_color') as string;
  memberBgColor = this.store.get('theme', 'sidemenu_member_bg_color') as string;
  groupBgColor = this.store.get('theme', 'sidemenu_group_bg_color') as string;
  facilityBgColor = this.store.get('theme', 'sidemenu_facility_bg_color') as string;
  resourceBgColor = this.store.get('theme', 'sidemenu_resource_bg_color') as string;
  userBgColor = this.store.get('theme', 'sidemenu_user_bg_color') as string;
  serviceBgColor = this.store.get('theme', 'sidemenu_service_bg_color') as string;
  baseItemTextColor = this.store.get('theme', 'sidemenu_text_color') as string;
  voTextColor = this.store.get('theme', 'sidemenu_vo_text_color') as string;
  memberTextColor = this.store.get('theme', 'sidemenu_member_text_color') as string;
  groupTextColor = this.store.get('theme', 'sidemenu_group_text_color') as string;
  facilityTextColor = this.store.get('theme', 'sidemenu_facility_text_color') as string;
  resourceTextColor = this.store.get('theme', 'sidemenu_resource_text_color') as string;
  userTextColor = this.store.get('theme', 'sidemenu_user_text_color') as string;
  serviceTextColor = this.store.get('theme', 'sidemenu_service_text_color') as string;

  constructor(
    private translate: TranslateService,
    private authResolver: GuiAuthResolver,
    private store: StoreService,
    private apiRequest: ApiRequestConfigurationService,
    private attributesManager: AttributesManagerService,
    private notificator: NotificatorService,
    public guiAuthResolver: GuiAuthResolver,
    private routePolicyService: RoutePolicyService
  ) {}

  getFacilitiesManagementItem(): SideMenuItem {
    return {
      label: 'MAIN_MENU.FACILITIES',
      colorClass: 'base-item-color-activated',
      icon: 'perun-facility-white',
      baseLink: ['/facilities'],
      links: [],
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/facilities$',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
    };
  }

  getAccessManagementItem(): SideMenuItem {
    return {
      label: 'MAIN_MENU.ACCESS',
      colorClass: 'base-item-color-activated',
      icon: 'perun-vo',
      links: [],
      baseLink: ['/organizations'],
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/organizations$',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
    };
  }

  getHomeItem(): SideMenuItem {
    return {
      baseLink: ['/home'],
      label: 'MAIN_MENU.HOME',
      colorClass: 'base-item-color-activated',
      icon: 'perun-home-white',
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/home$',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
      links: [],
    };
  }

  getUserItem(): SideMenuItem {
    return {
      baseLink: ['/myProfile'],
      expandable: false,
      label: 'MAIN_MENU.MY_PROFILE',
      colorClass: 'base-item-color-activated',
      icon: 'perun-user',
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/dont-use$',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
      links: [
        {
          label: 'MENU_ITEMS.USER.OVERVIEW',
          url: [`/myProfile`],
          activatedRegex: `^/myProfile$`,
        },
        {
          label: 'MENU_ITEMS.USER.ORGANIZATIONS',
          url: [`/myProfile/organizations`],
          activatedRegex: `^/myProfile/organizations$`,
        },
        {
          label: 'MENU_ITEMS.USER.GROUPS',
          url: [`/myProfile/groups`],
          activatedRegex: `^/myProfile/groups$`,
        },
        {
          label: 'MENU_ITEMS.USER.ATTRIBUTES',
          url: [`/myProfile/attributes`],
          activatedRegex: `^/myProfile/attributes$`,
        },
        {
          label: 'MENU_ITEMS.USER.ROLES',
          url: [`/myProfile/roles`],
          activatedRegex: `/myProfile/roles`,
        },
        {
          label: 'MENU_ITEMS.USER.SERVICE_IDENTITIES',
          url: [`/myProfile/service-identities`],
          activatedRegex: `^/myProfile/service-identities`,
        },
        {
          label: 'MENU_ITEMS.USER.SETTINGS',
          url: [`/myProfile/settings`],
          activatedRegex: `^/myProfile/settings$`,
          children: [
            {
              label: 'MENU_ITEMS.USER.PASSWORD_RESET',
              url: [`/myProfile/settings/passwordReset`],
              activatedRegex: `^/myProfile/settings/passwordReset`,
            },
            {
              label: 'MENU_ITEMS.USER.GUI_CONFIG',
              url: ['/myProfile/settings/guiConfig'],
              activatedRegex: '/myProfile/settings/guiConfig',
            },
          ],
          showChildrenRegex: `/myProfile/settings`,
        },
      ],
    };
  }

  getAdminItem(): SideMenuItem {
    return {
      baseLink: ['/admin'],
      expandable: false,
      label: 'MAIN_MENU.ADMIN',
      colorClass: 'base-item-color-activated',
      icon: 'perun-perun-admin',
      baseColorClass: 'base-item-color',
      baseColorClassRegex: '^/dont-use$',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.baseItemColor,
      textColorCss: this.baseItemTextColor,
      links: [
        {
          label: 'MENU_ITEMS.ADMIN.OVERVIEW',
          url: ['/admin'],
          activatedRegex: '^/admin$',
        },
        {
          label: 'MENU_ITEMS.ADMIN.ATTRIBUTES',
          url: ['/admin/attributes'],
          activatedRegex: '^/admin/attributes$',
        },
        {
          label: 'MENU_ITEMS.ADMIN.USERS',
          url: ['/admin/users'],
          activatedRegex: '^/admin/users$',
        },
        {
          label: 'MENU_ITEMS.ADMIN.OWNERS',
          url: ['/admin/owners'],
          activatedRegex: '^/admin/owners$',
        },
        {
          label: 'MENU_ITEMS.ADMIN.SERVICES',
          url: [`/admin/services`],
          activatedRegex: '^/admin/services$',
        },
        {
          label: 'MENU_ITEMS.ADMIN.VISUALIZER',
          url: ['/admin/visualizer'],
          activatedRegex: '^/admin/visualizer$',
          children: [
            {
              label: 'MENU_ITEMS.VISUALIZER.ATTR_DEPENDENCIES',
              url: ['/admin/visualizer/attrDependencies'],
              activatedRegex: '^/admin/visualizer/attrDependencies',
            },
            {
              label: this.translate.instant('MENU_ITEMS.VISUALIZER.USER_DESTINATION') as string,
              url: ['/admin/visualizer/userDestinationRelationship'],
              activatedRegex: '^/admin/visualizer/userDestinationRelationship',
            },
          ],
          showChildrenRegex: '/admin/visualizer',
        },
        {
          label: 'MENU_ITEMS.ADMIN.EXT_SOURCES',
          url: ['/admin/ext_sources'],
          activatedRegex: '^/admin/ext_sources$',
        },
        {
          label: 'MENU_ITEMS.ADMIN.AUDIT_LOG',
          url: ['/admin/audit_log'],
          activatedRegex: '^/admin/audit_log$',
        },
        {
          label: 'MENU_ITEMS.ADMIN.CONSENT_HUBS',
          url: ['/admin/consent_hubs'],
          activatedRegex: '^/admin/consent_hubs$',
        },
        {
          label: 'MENU_ITEMS.ADMIN.SEARCHER',
          url: ['/admin/searcher'],
          activatedRegex: '^/admin/searcher',
        },
      ],
    };
  }

  parseFacility(facility: Facility): SideMenuItem {
    return {
      label: facility.name,
      baseLink: [`/facilities/${facility.id}`],
      backgroundColorCss: this.facilityBgColor,
      textColorCss: this.facilityTextColor,
      links: this.getFacilityLinks(facility),
      colorClass: 'facility-item',
      icon: 'perun-facility-white',
      // labelClass: 'facility-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
    };
  }

  parseResource(resource: Resource, underVo: boolean): SideMenuItem {
    const baseUrl = new GetResourceRoutePipe().transform(resource, underVo);
    const regexStart = underVo ? '/organizations' : '/facilities';
    return {
      label: resource.name,
      baseLink: [baseUrl],
      backgroundColorCss: this.resourceBgColor,
      textColorCss: this.resourceTextColor,
      links: this.getResourceLinks(baseUrl, regexStart, resource),
      colorClass: 'resource-item',
      icon: 'perun-resource-white',
      // labelClass: 'resource-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
    };
  }

  parseGroup(group: Group): SideMenuItem {
    return {
      label: group.name,
      baseLink: [`/organizations/${group.voId}/groups/${group.id}`],
      backgroundColorCss: this.groupBgColor,
      textColorCss: this.groupTextColor,
      links: this.getGroupLinks(group),
      colorClass: 'group-item',
      icon: 'perun-group',
      // labelClass: 'group-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
    };
  }

  parseVo(vo: Vo, isHierarchical = false, isMemberVo = false): SideMenuItem {
    return {
      label: vo.name,
      baseLink: [`/organizations/${vo.id}`],
      links: this.getVoLinks(vo, isMemberVo),
      colorClass: 'vo-item',
      icon: isHierarchical ? 'perun-hierarchical-vo' : 'perun-vo',
      // labelClass: 'vo-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
      backgroundColorCss: this.voBgColor,
      textColorCss: this.voTextColor,
    };
  }

  parseMember(member: RichMember): SideMenuItem {
    return {
      label: parseFullName(member.user),
      baseLink: [`/organizations/${member.voId}/members/${member.id}`],
      backgroundColorCss: this.memberBgColor,
      textColorCss: this.memberTextColor,
      links: this.getMemberLinks(member),
      colorClass: 'member-item',
      icon: 'perun-user',
      // labelClass: 'member-text',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
    };
  }

  parseUser(user: User, path: string, regex: string): SideMenuItem {
    return {
      label: parseFullName(user),
      baseLink: [path],
      backgroundColorCss: this.userBgColor,
      textColorCss: this.userTextColor,
      links: this.getUserLinks(user, path, regex),
      colorClass: 'user-bg-color',
      icon: 'perun-user',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
    };
  }

  parseServiceIdentity(user: User): SideMenuItem {
    return {
      label: parseFullName(user),
      baseLink: [`/myProfile/service-identities/${user.id}`],
      backgroundColorCss: this.userBgColor,
      textColorCss: this.userTextColor,
      links: [
        {
          label: 'MENU_ITEMS.USER.OVERVIEW',
          url: [`/myProfile/service-identities/${user.id}`],
          activatedRegex: '/myProfile/service-identities/\\d+$',
        },
        {
          label: 'MENU_ITEMS.USER.ASSOCIATED_USERS',
          url: [`/myProfile/service-identities/${user.id}/associated-users`],
          activatedRegex: '/myProfile/service-identities/\\d+/associated-users',
        },
      ],
      colorClass: 'user-bg-color',
      icon: 'perun-service-identity',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
    };
  }

  parseService(service: Service): SideMenuItem {
    return {
      label: service.name,
      baseLink: [`/admin/services/${service.id}`],
      backgroundColorCss: this.serviceBgColor,
      textColorCss: this.serviceTextColor,
      links: [
        {
          label: 'MENU_ITEMS.SERVICE.OVERVIEW',
          url: [`/admin/services/${service.id}`],
          activatedRegex: '/admin/services/\\d+$',
        },
        {
          label: 'MENU_ITEMS.SERVICE.REQUIRED_ATTRIBUTES',
          url: [`/admin/services/${service.id}/required-attributes`],
          activatedRegex: '/admin/services/\\d+/required-attributes',
        },
        {
          label: 'MENU_ITEMS.SERVICE.DESTINATIONS',
          url: [`/admin/services/${service.id}/destinations`],
          activatedRegex: '/admin/services/\\d+/destinations',
        },
      ],
      colorClass: 'service-item',
      icon: 'perun-service',
      activatedClass: 'dark-item-activated',
      linksClass: 'dark-item-links',
    };
  }

  getVoLinks(vo: Vo, isMemberVo: boolean): EntityMenuLink[] {
    const links: EntityMenuLink[] = [];

    // Overview
    links.push({
      label: 'MENU_ITEMS.VO.OVERVIEW',
      url: [`/organizations/${vo.id}`],
      activatedRegex: '/organizations/\\d+$',
    });

    // Members
    if (this.routePolicyService.canNavigate('organizations-members', vo)) {
      links.push({
        label: 'MENU_ITEMS.VO.MEMBERS',
        url: [`/organizations/${vo.id}/members`],
        activatedRegex: '/organizations/\\d+/members$',
      });
    }

    // Groups
    if (this.routePolicyService.canNavigate('organizations-groups', vo)) {
      links.push({
        label: 'MENU_ITEMS.VO.GROUPS',
        url: [`/organizations/${vo.id}/groups`],
        activatedRegex: '/organizations/\\d+/groups$',
      });
    }

    // Resource management
    if (this.routePolicyService.canNavigate('organizations-resources', vo)) {
      const children: EntityMenuLink[] = [];
      // Preview
      if (this.routePolicyService.canNavigate('organizations-resources-preview', vo)) {
        children.push({
          label: 'MENU_ITEMS.VO.RESOURCE_PREVIEW',
          url: [`/organizations/${vo.id}/resources/preview`],
          activatedRegex: '/organizations/\\d+/resources/preview$',
        });
      }

      // Tags
      if (this.routePolicyService.canNavigate('organizations-resources-tags', vo)) {
        children.push({
          label: 'MENU_ITEMS.VO.RESOURCE_TAGS',
          url: [`/organizations/${vo.id}/resources/tags`],
          activatedRegex: '/organizations/\\d+/resources/tags$',
        });
      }

      // States
      if (this.routePolicyService.canNavigate('organizations-resources-states', vo)) {
        children.push({
          label: 'MENU_ITEMS.VO.RESOURCE_STATES',
          url: [`/organizations/${vo.id}/resources/states`],
          activatedRegex: '/organizations/\\d+/resources/states$',
        });
      }

      links.push({
        label: 'MENU_ITEMS.VO.RESOURCES',
        url: [`/organizations/${vo.id}/resources`],
        activatedRegex: '/organizations/\\d+/resources$',
        children: children,
        showChildrenRegex: '/organizations/\\d+/resources',
      });
    }

    // Applications
    if (this.routePolicyService.canNavigate('organizations-applications', vo)) {
      links.push({
        label: 'MENU_ITEMS.VO.APPLICATIONS',
        url: [`/organizations/${vo.id}/applications`],
        activatedRegex: '/organizations/\\d+/applications',
      });
    }

    // Sponsored members
    if (this.routePolicyService.canNavigate('organizations-sponsoredMembers', vo)) {
      links.push({
        label: 'MENU_ITEMS.VO.SPONSORED_MEMBERS',
        url: [`/organizations/${vo.id}/sponsoredMembers`],
        activatedRegex: '/organizations/\\d+/sponsoredMembers$',
      });
    }

    // Service members
    if (this.routePolicyService.canNavigate('organizations-serviceAccounts', vo)) {
      links.push({
        label: 'MENU_ITEMS.VO.SERVICE_MEMBERS',
        url: [`/organizations/${vo.id}/serviceAccounts`],
        activatedRegex: '/organizations/\\d+/serviceAccounts$',
      });
    }

    //Attributes
    if (this.routePolicyService.canNavigate('organizations-attributes', vo)) {
      links.push({
        label: 'MENU_ITEMS.VO.ATTRIBUTES',
        url: [`/organizations/${vo.id}/attributes`],
        activatedRegex: '/organizations/\\d+/attributes$',
      });
    }

    // Statistics
    if (this.routePolicyService.canNavigate('organizations-statistics', vo)) {
      links.push({
        label: 'MENU_ITEMS.VO.STATISTICS',
        url: [`/organizations/${vo.id}/statistics`],
        activatedRegex: '/organizations/\\d+/statistics',
      });
    }

    // Settings
    if (this.routePolicyService.canNavigate('organizations-settings', vo)) {
      const children: SideMenuItemChild[] = [];

      // Membership
      if (this.routePolicyService.canNavigate('organizations-settings-expiration', vo)) {
        children.push({
          label: 'MENU_ITEMS.VO.EXPIRATION',
          url: [`/organizations/${vo.id}/settings/expiration`],
          activatedRegex: '/organizations/\\d+/settings/expiration$',
        });
      }

      // Managers
      if (this.routePolicyService.canNavigate('organizations-settings-managers', vo)) {
        children.push({
          label: 'MENU_ITEMS.VO.MANAGERS',
          url: [`/organizations/${vo.id}/settings/managers`],
          activatedRegex: '/organizations/\\d+/settings/managers$',
        });
      }

      // Application form
      if (this.routePolicyService.canNavigate('organizations-settings-applicationForm', vo)) {
        children.push({
          label: 'MENU_ITEMS.VO.APPLICATION_FORM',
          url: [`/organizations/${vo.id}/settings/applicationForm`],
          activatedRegex: '/organizations/\\d+/settings/applicationForm$',
        });
      }

      // Notifications
      if (this.routePolicyService.canNavigate('organizations-settings-notifications', vo)) {
        children.push({
          label: 'MENU_ITEMS.VO.NOTIFICATIONS',
          url: [`/organizations/${vo.id}/settings/notifications`],
          activatedRegex: '/organizations/\\d+/settings/notifications$',
        });
      }

      // Ext. sources
      if (this.routePolicyService.canNavigate('organizations-settings-extsources', vo)) {
        children.push({
          label: 'MENU_ITEMS.VO.EXTSOURCES',
          url: [`/organizations/${vo.id}/settings/extsources`],
          activatedRegex: '/organizations/\\d+/settings/extsources$',
        });
      }

      // Member organizations
      if (this.routePolicyService.canNavigate('organizations-settings-memberOrganizations', vo)) {
        children.push({
          label: 'MENU_ITEMS.VO.MEMBER_ORGANIZATIONS',
          url: [`/organizations/${vo.id}/settings/memberOrganizations`],
          activatedRegex: '/organizations/\\d+/settings/memberOrganizations',
        });
      }

      // Hierarchical inclusion
      if (
        this.routePolicyService.canNavigate('organizations-settings-hierarchicalInclusion', vo) &&
        isMemberVo
      ) {
        children.push({
          label: 'MENU_ITEMS.VO.HIERARCHICAL_INCLUSION',
          url: [`/organizations/${vo.id}/settings/hierarchicalInclusion`],
          activatedRegex: '/organizations/\\d+/settings/hierarchicalInclusion',
        });
      }

      links.push({
        label: 'MENU_ITEMS.VO.SETTINGS',
        url: [`/organizations/${vo.id}/settings`],
        activatedRegex: '/organizations/\\d+/settings$',
        children: children,
        showChildrenRegex: '/organizations/\\d+/settings',
      });
    }

    return links;
  }

  getUserLinks(user: User, path: string, regex: string): EntityMenuLink[] {
    const links: EntityMenuLink[] = [];

    // Overview
    links.push({
      label: 'MENU_ITEMS.USER.OVERVIEW',
      url: [path],
      activatedRegex: `${regex}$`,
    });

    // Organizations
    links.push({
      label: 'MENU_ITEMS.ADMIN.ORGANIZATIONS',
      url: [`${path}/organizations`],
      activatedRegex: `${regex}/organizations`,
    });

    // Groups
    links.push({
      label: 'MENU_ITEMS.ADMIN.GROUPS',
      url: [`${path}/groups`],
      activatedRegex: `${regex}/groups`,
    });

    // Accounts
    links.push({
      label: 'MENU_ITEMS.USER.ACCOUNTS',
      url: [`${path}/accounts`],
      activatedRegex: `${regex}/accounts`,
    });

    // Identities
    links.push({
      label: 'MENU_ITEMS.USER.IDENTITIES',
      url: [`${path}/identities`],
      activatedRegex: `${regex}/identities`,
    });

    // Facilities
    links.push({
      label: 'MENU_ITEMS.USER.FACILITIES',
      url: [`${path}/facilities`],
      activatedRegex: `${regex}/facilities`,
    });

    // Resources
    links.push({
      label: 'MENU_ITEMS.USER.RESOURCES',
      url: [`${path}/resources`],
      activatedRegex: `${regex}/resources`,
    });

    // Attributes
    links.push({
      label: 'MENU_ITEMS.MEMBER.ATTRIBUTES',
      url: [`${path}/attributes`],
      activatedRegex: `${regex}/attributes`,
    });

    // Roles
    links.push({
      label: 'MENU_ITEMS.USER.ROLES',
      url: [`${path}/roles`],
      activatedRegex: `^${path}/roles`,
    });

    // Settings associated users if user is service
    // Settings service identities if user is person
    if (user.serviceUser) {
      links.push({
        label: 'MENU_ITEMS.USER.ASSOCIATED_USERS',
        url: [`${path}/associated-users`],
        activatedRegex: `^${path}/associated-users`,
      });
    } else {
      links.push({
        label: 'MENU_ITEMS.USER.SERVICE_IDENTITIES',
        url: [`${path}/service-identities`],
        activatedRegex: `^${path}/service-identities`,
      });
    }

    // Settings
    // links.push({
    //   label: 'MENU_ITEMS.ADMIN.SETTINGS',
    //   url: [`${path}/settings`],
    //   activatedRegex: `${regex}/settings$`,
    //   children: [],
    //   showChildrenRegex: `${regex}/settings`
    // });
    return links;
  }

  getMemberLinks(member: RichMember): EntityMenuLink[] {
    // Overview
    const links: EntityMenuLink[] = [
      {
        label: 'MENU_ITEMS.MEMBER.OVERVIEW',
        url: [`/organizations/${member.voId}/members/${member.id}`],
        activatedRegex: '/organizations/\\d+/members/\\d+$',
      },
    ];

    // Groups
    if (this.routePolicyService.canNavigate('members-groups', member)) {
      links.push({
        label: 'MENU_ITEMS.MEMBER.GROUPS',
        url: [`//organizations/${member.voId}/members/${member.id}/groups`],
        activatedRegex: '/organizations/\\d+/members/\\d+/groups',
      });
    }
    // Applications
    if (this.routePolicyService.canNavigate('members-applications', member)) {
      links.push({
        label: 'MENU_ITEMS.MEMBER.APPLICATIONS',
        url: [`//organizations/${member.voId}/members/${member.id}/applications`],
        activatedRegex: '/organizations/\\d+/members/\\d+/applications',
      });
    }
    // Resources
    if (this.routePolicyService.canNavigate('members-resources', member)) {
      links.push({
        label: 'MENU_ITEMS.MEMBER.RESOURCES',
        url: [`/organizations/${member.voId}/members/${member.id}/resources`],
        activatedRegex: '/organizations/\\d+/members/\\d+/resources',
      });
    }

    // Attributes
    if (this.routePolicyService.canNavigate('members-attributes', member)) {
      links.push({
        label: 'MENU_ITEMS.MEMBER.ATTRIBUTES',
        url: [`/organizations/${member.voId}/members/${member.id}/attributes`],
        activatedRegex: '/organizations/\\d+/members/\\d+/attributes$',
      });
    }

    //Settings
    // const children = [];
    //
    // links.push({
    //   label: 'MENU_ITEMS.MEMBER.SETTINGS',
    //   url: [`/organizations/${member.voId}/members/${member.id}/settings`],
    //   activatedRegex: '/organizations/\\d+/members/\\d+/settings$',
    //   children: children,
    //   showChildrenRegex: '/organizations/\\d+/members/\\d+/settings'
    // });

    return links;
  }

  getFacilityLinks(facility: Facility): EntityMenuLink[] {
    const links: EntityMenuLink[] = [
      {
        label: 'MENU_ITEMS.FACILITY.OVERVIEW',
        url: [`/facilities/${facility.id}`],
        activatedRegex: '/facilities/\\d+$',
      },
    ];

    // Resources
    if (this.routePolicyService.canNavigate('facilities-resources', facility)) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.RESOURCES',
        url: [`/facilities/${facility.id}/resources`],
        activatedRegex: '/facilities/\\d+/resources$',
      });
    }
    // Allowed users
    if (this.routePolicyService.canNavigate('facilities-allowed-users', facility)) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.ALLOWED_USERS',
        url: [`/facilities/${facility.id}/allowed-users`],
        activatedRegex: '/facilities/\\d+/allowed-users',
      });
    }
    // Allowed groups
    if (this.routePolicyService.canNavigate('facilities-allowed-groups', facility)) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.ALLOWED_GROUPS',
        url: [`/facilities/${facility.id}/allowed-groups`],
        activatedRegex: '/facilities/\\d+/allowed-groups',
      });
    }
    // Service state
    if (this.routePolicyService.canNavigate('facilities-services-status', facility)) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.SERVICES_STATUS',
        url: [`/facilities/${facility.id}/services-status`],
        activatedRegex: '/facilities/\\d+/services-status',
      });
    }
    // Service destination
    if (this.routePolicyService.canNavigate('facilities-services-destinations', facility)) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.SERVICES_DESTINATIONS',
        url: [`/facilities/${facility.id}/services-destinations`],
        activatedRegex: 'facilities/\\d+/services-destinations',
      });
    }
    // Hosts
    if (this.routePolicyService.canNavigate('facilities-hosts', facility)) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.HOSTS',
        url: [`/facilities/${facility.id}/hosts`],
        activatedRegex: 'facilities/\\d+/hosts',
      });
    }
    if (this.routePolicyService.canNavigate('facilities-attributes', facility)) {
      links.push({
        label: 'MENU_ITEMS.FACILITY.ATTRIBUTES',
        url: ['/facilities', facility.id.toString(), 'attributes'],
        activatedRegex: '/facilities/\\d+/attributes$',
      });
    }

    // Settings
    if (this.routePolicyService.canNavigate('facilities-settings', facility)) {
      const children: EntityMenuLink[] = [];

      // Owners
      if (this.routePolicyService.canNavigate('facilities-settings-owners', facility)) {
        children.push({
          label: 'MENU_ITEMS.FACILITY.OWNERS',
          url: ['/facilities', facility.id.toString(), 'settings', 'owners'],
          activatedRegex: '/facilities/\\d+/settings/owners$',
        });
      }
      // Managers
      if (this.routePolicyService.canNavigate('facilities-settings-managers', facility)) {
        children.push({
          label: 'MENU_ITEMS.FACILITY.MANAGERS',
          url: ['/facilities', facility.id.toString(), 'settings', 'managers'],
          activatedRegex: '/facilities/\\d+/settings/managers$',
        });
      }
      // Security teams
      if (this.routePolicyService.canNavigate('facilities-settings-security-teams', facility)) {
        children.push({
          label: 'MENU_ITEMS.FACILITY.SECURITY_TEAMS',
          url: [`/facilities/${facility.id}/settings/security-teams`],
          activatedRegex: 'facilities/\\d+/settings/security-teams',
        });
      }

      // Blacklist
      if (this.routePolicyService.canNavigate('facilities-settings-blacklist', facility)) {
        children.push({
          label: 'MENU_ITEMS.FACILITY.BLACKLIST',
          url: ['facilities', facility.id.toString(), 'settings', 'blacklist'],
          activatedRegex: '/facilities/\\d+/settings/blacklist',
        });
      }

      links.push({
        label: 'MENU_ITEMS.FACILITY.SETTINGS',
        url: ['/facilities', facility.id.toString(), 'settings'],
        activatedRegex: '/facilities/\\d+/settings$',
        children: children,
        showChildrenRegex: '/facilities/\\d+/settings',
      });
    }
    return links;
  }

  getGroupLinks(group: Group): EntityMenuLink[] {
    const links: EntityMenuLink[] = [];
    const settingsChildrenLinks: EntityMenuLink[] = [];

    //Overview
    links.push({
      label: 'MENU_ITEMS.GROUP.OVERVIEW',
      url: [`/organizations/${group.voId}/groups/${group.id}`],
      activatedRegex: '/organizations/\\d+/groups/\\d+$',
    });

    //Members
    if (this.routePolicyService.canNavigate('groups-members', group)) {
      links.push({
        label: 'MENU_ITEMS.GROUP.MEMBERS',
        url: [`/organizations/${group.voId}/groups/${group.id}/members`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/members$',
      });
    }

    //Subgroups
    if (
      this.routePolicyService.canNavigate('groups-subgroups', group) &&
      group.name !== 'members'
    ) {
      links.push({
        label: 'MENU_ITEMS.GROUP.SUBGROUPS',
        url: [`/organizations/${group.voId}/groups/${group.id}/subgroups`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/subgroups$',
      });
    }

    //Resources
    if (this.routePolicyService.canNavigate('groups-resources', group)) {
      links.push({
        label: 'MENU_ITEMS.GROUP.RESOURCES',
        url: [`/organizations/${group.voId}/groups/${group.id}/resources`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/resources$',
      });
    }

    //Applications
    if (this.routePolicyService.canNavigate('groups-applications', group)) {
      links.push({
        label: 'MENU_ITEMS.GROUP.APPLICATIONS',
        url: [`/organizations/${group.voId}/groups/${group.id}/applications`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/applications$',
      });
    }

    //Attributes
    if (this.routePolicyService.canNavigate('groups-attributes', group)) {
      links.push({
        label: 'MENU_ITEMS.GROUP.ATTRIBUTES',
        url: [`/organizations/${group.voId}/groups/${group.id}/attributes`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/attributes$',
      });
    }

    //Statistics
    if (this.routePolicyService.canNavigate('groups-statistics', group)) {
      links.push({
        label: 'MENU_ITEMS.GROUP.STATISTICS',
        url: [`/organizations/${group.voId}/groups/${group.id}/statistics`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/statistics',
      });
    }

    // FIXME - manage via canNavigate - problem with async call in route-policy.service.ts
    //SettingsMembership
    //not implemented in authorization....probably must be hardcoded
    this.apiRequest.dontHandleErrorForNext();
    this.attributesManager
      .getGroupAttributeByName(group.id, Urns.GROUP_DEF_EXPIRATION_RULES)
      .subscribe(
        () => {
          settingsChildrenLinks.push({
            label: 'MENU_ITEMS.GROUP.EXPIRATION',
            url: [`/organizations/${group.voId}/groups/${group.id}/settings/expiration`],
            activatedRegex: '/organizations/\\d+/groups/\\d+/settings/expiration$',
          });
        },
        (error: RPCError) => {
          if (error.name !== 'HttpErrorResponse') {
            this.notificator.showRPCError(error);
          }
        }
      );

    //SettingsManagers
    if (this.routePolicyService.canNavigate('groups-settings-managers', group)) {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.MANAGERS',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/managers`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/managers$',
      });
    }

    //SettingsApplicationForm
    if (this.routePolicyService.canNavigate('groups-settings-applicationForm', group)) {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.APPLICATION_FORM',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/applicationForm`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/applicationForm$',
      });
    }

    //SettingsNotifications
    if (this.routePolicyService.canNavigate('groups-settings-notifications', group)) {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.NOTIFICATIONS',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/notifications`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/notifications$',
      });
    }

    //SettingsRelations
    if (this.routePolicyService.canNavigate('groups-settings-relations', group)) {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.RELATIONS',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/relations`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/relations$',
      });
    }

    //SettingsExtSources
    if (this.routePolicyService.canNavigate('groups-settings-extsources', group)) {
      settingsChildrenLinks.push({
        label: 'MENU_ITEMS.GROUP.EXTSOURCES',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings/extsources`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings/extsources$',
      });
    }

    //SettingsWithChildrenLinks
    if (settingsChildrenLinks.length !== 0) {
      links.push({
        label: 'MENU_ITEMS.GROUP.SETTINGS',
        url: [`/organizations/${group.voId}/groups/${group.id}/settings`],
        activatedRegex: '/organizations/\\d+/groups/\\d+/settings$',
        children: settingsChildrenLinks,
        showChildrenRegex: '/organizations/\\d+/groups/\\d+/settings',
      });
    }

    return links;
  }

  private getResourceLinks(
    baseUrl: string,
    regexStart: string,
    resource: Resource
  ): EntityMenuLink[] {
    const links: EntityMenuLink[] = [
      {
        label: 'MENU_ITEMS.RESOURCE.OVERVIEW',
        url: [baseUrl],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+$`,
      },
    ];

    if (this.routePolicyService.canNavigate('resources-groups', resource)) {
      links.push({
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_GROUPS',
        url: [baseUrl, 'groups'],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/groups$`,
      });
    }
    if (this.routePolicyService.canNavigate('resources-services', resource)) {
      links.push({
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_SERVICES',
        url: [baseUrl, 'services'],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/services$`,
      });
    }
    if (this.routePolicyService.canNavigate('resources-members', resource)) {
      links.push({
        label: 'MENU_ITEMS.RESOURCE.ASSIGNED_MEMBERS',
        url: [baseUrl, 'members'],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/members$`,
      });
    }
    if (this.routePolicyService.canNavigate('resources-tags', resource)) {
      links.push({
        label: 'MENU_ITEMS.RESOURCE.RESOURCE_TAGS',
        url: [baseUrl, 'tags'],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/tags$`,
      });
    }
    if (this.routePolicyService.canNavigate('resources-attributes', resource)) {
      links.push({
        label: 'MENU_ITEMS.RESOURCE.ATTRIBUTES',
        url: [baseUrl, `attributes`],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/attributes$`,
      });
    }

    if (this.routePolicyService.canNavigate('resources-settings', resource)) {
      links.push({
        label: 'MENU_ITEMS.RESOURCE.SETTINGS',
        url: [baseUrl, `settings`],
        activatedRegex: `${regexStart}/\\d+/resources/\\d+/settings$`,
        children: [
          {
            label: 'MENU_ITEMS.RESOURCE.MANAGERS',
            url: [baseUrl, `settings`, `managers`],
            activatedRegex: `${regexStart}/\\d+/resources/\\d+/settings/managers$`,
          },
        ],
        showChildrenRegex: `${regexStart}/\\d+/resources/\\d+/settings`,
      });
    }

    return links;
  }
}

interface SideMenuItemChild {
  label: string;
  url: string[];
  activatedRegex: string;
}
