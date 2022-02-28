import { Component, HostBinding, OnInit } from '@angular/core';

import { graphviz } from 'd3-graphviz';
import { AttributesManagerService } from '@perun-web-apps/perun/openapi';

@Component({
  selector: 'app-visualizer-attr-modules',
  templateUrl: './visualizer-attr-modules.component.html',
  styleUrls: ['./visualizer-attr-modules.component.scss'],
})
export class VisualizerAttrModulesComponent implements OnInit {
  @HostBinding('class.router-component') true;

  constructor(private attributesManager: AttributesManagerService) {}

  ngOnInit(): void {
    this.attributesManager.getAttributeModulesDependenciesGraphText('DOT').subscribe((data) => {
      const graphData = data.graph.replace('\\t', '').replace('\\n', '').replace('\\', '');
      // eslint-disable-next-line
      graphviz('#dependenciesGraph', { zoom: false }).renderDot(graphData);
    });
  }
}
