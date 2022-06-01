import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Role } from '@perun-web-apps/perun/models';
import { AttributePolicy, RoleObject } from '@perun-web-apps/perun/openapi';
import { BehaviorSubject, Observable } from 'rxjs';
import { AttributeRightsService } from '@perun-web-apps/perun/services';
import { switchMap } from 'rxjs/operators';
import { MatSelectChange } from '@angular/material/select';

@Component({
  selector: 'perun-web-apps-attribute-rights-item',
  templateUrl: './attribute-rights-item.component.html',
  styleUrls: ['./attribute-rights-item.component.scss'],
})
export class AttributeRightsItemComponent implements OnInit {
  @Input() policy: AttributePolicy;
  @Output() policyRemoved = new EventEmitter<void>();
  selectedRole: BehaviorSubject<Role>;
  roles: Observable<Role[]> = this.attrRightsService.getRoles();
  objects: Observable<RoleObject[]>;

  constructor(private attrRightsService: AttributeRightsService) {}

  ngOnInit(): void {
    this.selectedRole = new BehaviorSubject<Role>(this.policy.role as Role);
    this.objects = this.selectedRole.pipe(
      switchMap((role: Role) => this.attrRightsService.getObjects(role))
    );
  }

  changeRole(event: MatSelectChange): void {
    this.selectedRole.next(event.value as Role);
    this.policy.object = 'None';
  }

  remove(): void {
    this.policyRemoved.emit();
  }
}
