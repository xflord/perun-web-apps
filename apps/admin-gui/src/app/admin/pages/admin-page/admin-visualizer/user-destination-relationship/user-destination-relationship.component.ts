import { Component, HostBinding, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { NotificatorService } from '@perun-web-apps/perun/services';
import {
  User,
  UsersManagerService,
  FacilitiesManagerService,
  ServicesManagerService,
} from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-user-destination-relationship',
  templateUrl: './user-destination-relationship.component.html',
  styleUrls: ['./user-destination-relationship.component.scss'],
})
export class UserDestinationRelationshipComponent implements OnInit {
  @HostBinding('class.router-component') true;

  searchField: FormControl = new FormControl();
  users: Observable<User[]>;
  chosenService = '';
  availableServices: string[] = [];
  noServiceText: string;
  loading = false;
  destination = '';
  selectedUser: User;

  constructor(
    private usersService: UsersManagerService,
    private translate: TranslateService,
    private facilityManager: FacilitiesManagerService,
    private serviceService: ServicesManagerService,
    private router: Router,
    private notificator: NotificatorService
  ) {}

  ngOnInit() {
    this.searchField.setValue('');
    this.users = this.searchField.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      tap(() => (this.loading = true)),
      switchMap((term) => this.usersService.findUsers(term)),
      tap(() => (this.loading = false))
    );
    this.translate.get('ADMIN.VISUALIZER.USER_DESTINATION.SELECT_NO_SERVICE').subscribe((text) => {
      this.noServiceText = text;
      this.availableServices.push(this.noServiceText);
    });
  }

  validateName(stepper: MatStepper) {
    if (this.searchField.value === '') {
      this.translate
        .get('ADMIN.VISUALIZER.USER_DESTINATION.ERROR_NO_NAME')
        .subscribe((errorMessage) => {
          this.notificator.showError(errorMessage);
        });
      return;
    }
    this.usersService.findUsers(this.searchField.value).subscribe((users) => {
      for (const user of users) {
        const u = user.firstName + ' ' + user.lastName;
        if (u.toLowerCase() === this.searchField.value.toLowerCase()) {
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
          .subscribe((errorMessage) => {
            this.notificator.showError(errorMessage);
          });
      }
    });
  }

  validateDestination(stepper: MatStepper) {
    if (this.destination === '') {
      this.translate
        .get('ADMIN.VISUALIZER.USER_DESTINATION.ERROR_NO_DESTINATION')
        .subscribe((errorMessage) => {
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
          .subscribe((errorMessage) => {
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
                if (this.availableServices.indexOf(potentialDestination.service.name) === -1) {
                  this.availableServices.push(potentialDestination.service.name);
                }
              }
            }
          });
      }
    });
  }

  getGraph() {
    if (this.chosenService === '') {
      this.translate
        .get('ADMIN.VISUALIZER.USER_DESTINATION.ERROR_NOT_CHOSEN_SERVICE')
        .subscribe((errorMessage) => {
          this.notificator.showError(errorMessage);
        });
      return;
    }
    if (this.chosenService === this.noServiceText) {
      this.router.navigate(['admin/visualizer/userDestinationRelationship/graph'], {
        queryParams: {
          user: this.selectedUser.id,
          destination: this.destination,
          service: 'noService',
        },
      });
    } else {
      this.router.navigate(['admin/visualizer/userDestinationRelationship/graph'], {
        queryParams: {
          user: this.selectedUser.id,
          destination: this.destination,
          service: this.chosenService,
        },
      });
    }
  }

  notCompleted(stepper: MatStepper) {
    stepper.selected.completed = false;
  }
}
