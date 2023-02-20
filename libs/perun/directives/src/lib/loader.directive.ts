import {
  Directive,
  EmbeddedViewRef,
  Input,
  OnChanges,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[perunWebAppsLoader]',
})
/**
 * Similar to `ngIf` but instead of hiding the template
 * shows provided loading indicator.
 *
 * Can be applied to any component.
 */
export class LoaderDirective<T> implements OnInit, OnChanges {
  @Input('perunWebAppsLoader') loading = false;
  /* eslint-disable @angular-eslint/no-input-rename */
  @Input('perunWebAppsLoaderIndicator') loadingIndicator: TemplateRef<Element>;
  loadingIndicatorRef: EmbeddedViewRef<Element> = null;

  constructor(private viewContainerRef: ViewContainerRef, private template: TemplateRef<T>) {}

  ngOnInit(): void {
    // Templates are not rendered by default
    this.viewContainerRef.createEmbeddedView(this.template);
  }

  ngOnChanges(): void {
    if (this.loading) {
      this.loadingIndicatorRef = this.viewContainerRef.createEmbeddedView(this.loadingIndicator);
    }

    if (!this.loading && this.loadingIndicatorRef) {
      this.loadingIndicatorRef.destroy();
    }
  }
}
