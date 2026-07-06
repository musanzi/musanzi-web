import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { skillGroups } from '../../data';

@Component({
  selector: 'skills',
  imports: [MatIcon],
  templateUrl: './skills.html'
})
export class Skills {
  readonly skillGroups = skillGroups;
}
