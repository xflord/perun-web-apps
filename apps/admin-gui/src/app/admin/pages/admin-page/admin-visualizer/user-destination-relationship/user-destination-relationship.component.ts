import { Component, HostBinding, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { NotificatorService } from '@perun-web-apps/perun/services';
import {
  FacilitiesManagerService,
  ServicesManagerService,
  User,
  UsersManagerService,
} from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-user-destination-relationship',
  templateUrl: './user-destination-relationship.component.html',
  styleUrls: ['./user-destination-relationship.component.scss'],
})
export class UserDestinationRelationshipComponent implements OnInit {
  @HostBinding('class.router-component') true;

  searchField: UntypedFormControl = new UntypedFormControl();
  users: Observable<User[]>;
  chosenService = '';
  availableServices: string[] = [];
  loading = false;
  destination = '';
  private noServiceText: string;
  private selectedUser: User;

  constructor(
    private usersService: UsersManagerService,
    private translate: TranslateService,
    private facilityManager: FacilitiesManagerService,
    private serviceService: ServicesManagerService,
    private router: Router,
    private notificator: NotificatorService
  ) {}

  ngOnInit(): void {
    this.searchField.setValue('');
    this.users = this.searchField.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap((term: string) => this.usersService.findUsers(term)),
      tap(() => (this.loading = false))
    );
    this.translate
      .get('ADMIN.VISUALIZER.USER_DESTINATION.SELECT_NO_SERVICE')
      .subscribe((text: string) => {
        this.noServiceText = text;
        this.availableServices.push(this.noServiceText);
      });
  }

  validateName(stepper: MatStepper): void {
    if (this.searchField.value === '') {
      this.translate
        .get('ADMIN.VISUALIZER.USER_DESTINATION.ERROR_NO_NAME')
        .subscribe((errorMessage: string) => {
          this.notificator.showError(errorMessage);
        });
      return;
    }
    this.usersService.findUsers(this.searchField.value as string).subscribe((users) => {
      for (const user of users) {
        const u = user.firstName + ' ' + user.lastName;
        if (u.toLowerCase() === (this.searchField.value as string).toLowerCase()) {
          this.selectedUser = user;
          stepper.selected.completed = true;
          stepper.next();
          break;
        }
        this.selectedUser = null;
      }
      if (!this.selectedUser) {
        this.translate
          .get('ADMIN.VISUALIZER.USER_DESTINATION.ERROR_WRONG_NAME')
          .subscribe((errorMessage: string) => {
            this.notificator.showError(errorMessage);
          });
      }
    });
  }

  validateDestination(stepper: MatStepper): void {
    if (this.destination === '') {
      this.translate
        .get('ADMIN.VISUALIZER.USER_DESTINATION.ERROR_NO_DESTINATION')
        .subscribe((errorMessage: string) => {
          this.notificator.showError(errorMessage);
        });
      return;
    }
    this.availableServices = [];
    this.availableServices.push(this.noServiceText);
    this.chosenService = '';
    this.facilityManager.getFacilitiesByDestination(this.destination).subscribe((facilities) => {
      if (facilities.length === 0) {
        this.translate
          .get('ADMIN.VISUALIZER.USER_DESTINATION.ERROR_WRONG_DESTINATION')
          .subscribe((errorMessage: string) => {
            this.notificator.showError(errorMessage);
          });
        return;
      }
      stepper.selected.completed = true;
      stepper.next();
      for (const facility of facilities) {
        this.serviceService
          .getAllRichDestinationsForFacility(facility.id)
          .subscribe((destination) => {
            for (const potentialDestination of destination) {
              if (potentialDestination.destination === this.destination) {
                if (!this.availableServices.includes(potentialDestination.service.name)) {
                  this.availableServices.push(potentialDestination.service.name);
                }
              }
            }
          });
      }
    });
  }

  getGraph(): void {
    if (this.chosenService === '') {
      this.translate
        .get('ADMIN.VISUALIZER.USER_DESTINATION.ERROR_NOT_CHOSEN_SERVICE')
        .subscribe((errorMessage: string) => {
          this.notificator.showError(errorMessage);
        });
      return;
    }
    if (this.chosenService === this.noServiceText) {
      void this.router.navigate(['admin/visualizer/userDestinationRelationship/graph'], {
        queryParams: {
          user: this.selectedUser.id,
          destination: this.destination,
          service: 'noService',
        },
      });
    } else {
      void this.router.navigate(['admin/visualizer/userDestinationRelationship/graph'], {
        queryParams: {
          user: this.selectedUser.id,
          destination: this.destination,
          service: this.chosenService,
        },
      });
    }
  }

  notCompleted(stepper: MatStepper): void {
    stepper.selected.completed = false;
  }
}
