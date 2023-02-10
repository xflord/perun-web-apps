import { Component, EventEmitter, Output } from '@angular/core';
import { AppState } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'perun-web-apps-application-state-selector',
  templateUrl: './application-state-selector.component.html',
  styleUrls: ['./application-state-selector.component.scss'],
})
export class ApplicationStateSelectorComponent {
  @Output() stateChanged = new EventEmitter<AppState[]>();
  state = 'pending';

  select(): void {
    switch (this.state) {
      case 'approved': {
        this.stateChanged.emit(['APPROVED']);
        break;
      }
      case 'rejected': {
        this.stateChanged.emit(['REJECTED']);
        break;
      }
      case 'wfmv': {
        this.stateChanged.emit(['NEW']);
        break;
      }
      case 'submitted': {
        this.stateChanged.emit(['VERIFIED']);
        break;
      }
      case 'pending': {
        this.stateChanged.emit(['NEW', 'VERIFIED']);
        break;
      }
      case 'all': {
        this.stateChanged.emit(null);
        break;
      }
      default: {
        break;
      }
    }
  }
}
