import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { workPrinciples } from '../../data';

@Component({
  selector: 'work-style',
  imports: [MatIcon],
  templateUrl: './work-style.html'
})
export class WorkStyle {
  readonly workPrinciples = workPrinciples;
}
