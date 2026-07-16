import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Loader } from '@libs/ui';

@Component({
  selector: 'landing-layout',
  imports: [RouterOutlet, Loader],
  templateUrl: './layout.html'
})
export class LandingLayout {}
