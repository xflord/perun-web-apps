export * from './attributesManager.service';
import { AttributesManagerService } from './attributesManager.service';
export * from './auditMessagesManager.service';
import { AuditMessagesManagerService } from './auditMessagesManager.service';
export * from './authzResolver.service';
import { AuthzResolverService } from './authzResolver.service';
export * from './cabinetManager.service';
import { CabinetManagerService } from './cabinetManager.service';
export * from './consentsManager.service';
import { ConsentsManagerService } from './consentsManager.service';
export * from './databaseManager.service';
import { DatabaseManagerService } from './databaseManager.service';
export * from './extSourcesManager.service';
import { ExtSourcesManagerService } from './extSourcesManager.service';
export * from './facilitiesManager.service';
import { FacilitiesManagerService } from './facilitiesManager.service';
export * from './facilitiesManagerByFacilityName.service';
import { FacilitiesManagerByFacilityNameService } from './facilitiesManagerByFacilityName.service';
export * from './groupsManager.service';
import { GroupsManagerService } from './groupsManager.service';
export * from './integrationManager.service';
import { IntegrationManagerService } from './integrationManager.service';
export * from './membersManager.service';
import { MembersManagerService } from './membersManager.service';
export * from './ownersManager.service';
import { OwnersManagerService } from './ownersManager.service';
export * from './rTMessagesManager.service';
import { RTMessagesManagerService } from './rTMessagesManager.service';
export * from './registrarManager.service';
import { RegistrarManagerService } from './registrarManager.service';
export * from './resourcesManager.service';
import { ResourcesManagerService } from './resourcesManager.service';
export * from './searcher.service';
import { SearcherService } from './searcher.service';
export * from './servicesManager.service';
import { ServicesManagerService } from './servicesManager.service';
export * from './tasksManager.service';
import { TasksManagerService } from './tasksManager.service';
export * from './usersManager.service';
import { UsersManagerService } from './usersManager.service';
export * from './utils.service';
import { UtilsService } from './utils.service';
export * from './vosManager.service';
import { VosManagerService } from './vosManager.service';
export const APIS = [
  AttributesManagerService,
  AuditMessagesManagerService,
  AuthzResolverService,
  CabinetManagerService,
  ConsentsManagerService,
  DatabaseManagerService,
  ExtSourcesManagerService,
  FacilitiesManagerService,
  FacilitiesManagerByFacilityNameService,
  GroupsManagerService,
  IntegrationManagerService,
  MembersManagerService,
  OwnersManagerService,
  RTMessagesManagerService,
  RegistrarManagerService,
  ResourcesManagerService,
  SearcherService,
  ServicesManagerService,
  TasksManagerService,
  UsersManagerService,
  UtilsService,
  VosManagerService,
];
