import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './auth/data-access';
import { Loader } from '@libs/ui';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Loader],
  host: {
    class: 'flex min-h-full w-full flex-auto flex-col'
  },
  templateUrl: './app.html'
})
export class App {
  protected authStore = inject(AuthStore);
}
