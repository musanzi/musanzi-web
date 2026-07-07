import { Component, computed, inject, input, output } from '@angular/core';
import { MatPseudoCheckbox } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/list';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Scheme, Theming } from '@libs/core';
import { IUser } from '@libs/utils';

@Component({
  selector: 'ui-user',
  imports: [MatDivider, MatIcon, MatMenu, MatMenuItem, MatPseudoCheckbox, MatMenuTrigger],
  template: `
    <button
      class="flex w-full cursor-pointer items-center gap-x-3 rounded-xl p-2 text-left hover:bg-neutral-700/10 dark:hover:bg-neutral-300/10"
      [matMenuTriggerFor]="userMenu">
      <div
        class="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        @if (avatarUrl(); as avatar) {
          <img class="size-full object-cover" [src]="avatar" alt="Photo de profil" />
        } @else {
          <mat-icon svgIcon="user"></mat-icon>
        }
      </div>
      <div class="flex min-w-0 flex-auto flex-col select-none">
        <div class="truncate font-medium">{{ user()?.name }}</div>
        <div class="text-on-surface-variant truncate text-sm">{{ user()?.email }}</div>
      </div>
      <mat-icon class="size-4" svgIcon="ellipsis-vertical" />
    </button>

    <mat-menu class="min-w-60" xPosition="before" yPosition="above" #userMenu="matMenu">
      @if (showAppearance()) {
      <button mat-menu-item [matMenuTriggerFor]="appearanceMenu">
        <mat-icon svgIcon="sun-moon" />
        {{ appearanceLabel() }}
      </button>
      <mat-divider />
      }
      <button mat-menu-item (click)="handleSignOut()">
        <mat-icon svgIcon="log-out" />
        {{ signOutLabel() }}
      </button>
    </mat-menu>

    <mat-menu #appearanceMenu="matMenu">
      @for (item of schemes(); track item.value) {
        <button mat-menu-item (click)="updateScheme(item.value)">
          <mat-pseudo-checkbox
            appearance="minimal"
            class="mr-2"
            [state]="scheme() === item.value ? 'checked' : 'unchecked'" />
          <span>{{ item.label }}</span>
        </button>
      }
    </mat-menu>
  `
})
export class User {
  user = input.required<IUser | null>();
  avatarUrl = input.required<string | null>();
  signOut = output();
  appearanceLabel = input('Apparence');
  showAppearance = input(true);
  signOutLabel = input('Se déconnecter');
  schemeLabels = input({
    dark: 'Sombre',
    light: 'Clair',
    system: 'Systeme'
  });

  private theming = inject(Theming);

  protected scheme = computed(() => this.theming.scheme());
  protected schemes = computed<{ label: string; value: Scheme }[]>(() => [
    { label: this.schemeLabels().light, value: 'light' },
    { label: this.schemeLabels().dark, value: 'dark' },
    { label: this.schemeLabels().system, value: 'system' }
  ]);

  updateScheme(scheme: Scheme) {
    this.theming.scheme.set(scheme);
  }

  handleSignOut(): void {
    this.signOut.emit();
  }
}
