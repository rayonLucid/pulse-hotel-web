import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[renderAmenities]',
  standalone: true // Use if you are using modern Angular standalone components
})
export class RenderAmenitiesDirective {
  @Input() set renderAmenities(amenities: any[] | undefined) {
    // Clear out any old content first
    this.el.nativeElement.innerHTML = '';

    if (!amenities) return;

    // We do the looping inside TypeScript, completely hidden from the HTML
    amenities.forEach(amenity => {
      // 1. Create the span container
      const span = this.renderer.createElement('span');
      this.renderer.addClass(span, 'amenity-tag');

      // 2. Create the FontAwesome icon element
      const icon = this.renderer.createElement('i');
      this.renderer.addClass(icon, 'fas');
      this.renderer.addClass(icon, `fa-${amenity.icon}`);

      // 3. Create the text node
      const text = this.renderer.createText(` ${amenity.amenityName}`);

      // 4. Assemble the pieces
      this.renderer.appendChild(span, icon);
      this.renderer.appendChild(span, text);
      this.renderer.appendChild(this.el.nativeElement, span);
    });
  }

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}
}
