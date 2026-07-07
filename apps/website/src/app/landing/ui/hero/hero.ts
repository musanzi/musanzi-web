import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'hero',
  imports: [MatIcon, RouterLink],
  templateUrl: './hero.html'
})
export class Hero {}
