import { Injectable } from '@angular/core';
import {
  Facility,
  Group,
  Member,
  Resource,
  Service,
  User,
  Vo,
} from '@perun-web-apps/perun/openapi';

type Entity = Vo | Group | Facility | Resource | Service | User | Member;

@Injectable({
  providedIn: 'root',
})
/* Service to store immutable entity information such as ids and bean name. */
export class EntityStorageService {
  entity: Entity;

  setEntity(entity: Entity): void {
    this.entity = entity;
  }

  getEntity(): Entity {
    return this.entity;
  }
}
