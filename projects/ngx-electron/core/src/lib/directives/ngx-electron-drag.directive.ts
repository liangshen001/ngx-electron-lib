import {Directive, ElementRef, Input, OnInit, Renderer2} from '@angular/core';

/**
 * 无素可否tuo动应用
 */
@Directive({
  selector: '[ngxElectronDrag]'
})
export class NgxElectronDragDirective implements OnInit {

  @Input()
  set ngxElectronDrag(ngxElectronDrag: boolean) {
    if (ngxElectronDrag === false) {
      this.renderer2.setStyle(this.element.nativeElement, '-webkit-app-region', 'no-drag');
    } else {
      this.renderer2.setStyle(this.element.nativeElement, '-webkit-app-region', 'drag');
    }
  }

  constructor(private element: ElementRef,
              private renderer2: Renderer2) {
  }

  ngOnInit(): void {
  }
}
