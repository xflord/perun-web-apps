import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'app-admin-visualizer',
  templateUrl: './admin-visualizer.component.html',
  styleUrls: ['./admin-visualizer.component.scss'],
})
export class AdminVisualizerComponent {
  @HostBinding('class.router-component') true;
}
