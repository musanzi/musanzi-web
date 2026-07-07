import { Component } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { tools } from '../../data';

@Component({
  selector: 'services',
  imports: [MatChipsModule, MatIcon],
  templateUrl: './services.html'
})
export class Services {
  readonly tools = tools;
}
