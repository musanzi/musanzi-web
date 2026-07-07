import { Component } from '@angular/core';

@Component({
  selector: 'landing-footer',
  templateUrl: './footer.html'
})
export class Footer {
  readonly year = new Date().getFullYear();
}
