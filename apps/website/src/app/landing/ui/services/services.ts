import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { services } from '../../data';

@Component({
  selector: 'services',
  imports: [MatIcon],
  templateUrl: './services.html'
})
export class Services {
  readonly services = services;
}
