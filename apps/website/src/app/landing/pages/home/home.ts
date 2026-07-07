import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { About } from '../../ui/about/about';
import { Contact } from '../../ui/contact/contact';
import { Footer } from '../../ui/footer/footer';
import { Hero } from '../../ui/hero/hero';
import { Projects } from '../../ui/projects/projects';
import { Services } from '../../ui/services/services';
import { Skills } from '../../ui/skills/skills';
import { WorkStyle } from '../../ui/work-style/work-style';

@Component({
  selector: 'app-home',
  imports: [
    About,
    Contact,
    Footer,
    Hero,
    MatButtonModule,
    MatIconModule,
    Projects,
    RouterLink,
    Services,
    Skills,
    WorkStyle
  ],
  templateUrl: './home.html'
})
export class Home {}
