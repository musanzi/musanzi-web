import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { Media } from '@libs/core';
import { AdminSidebar } from './ui/sidebar';

@Component({
  selector: 'admin-layout',
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterOutlet,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    AdminSidebar
  ],
  templateUrl: './layout.html'
})
export class AdminLayout {
  private media = inject(Media);
  protected isMobile = computed(() => this.media.match(`(max-width: 1023px)`)());
}
