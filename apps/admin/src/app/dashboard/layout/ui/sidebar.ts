import { Component, computed, inject } from '@angular/core';
import { AuthStore } from '@admin/app/auth/data-access';
import { DashboardNavigation, User } from '@libs/ui';
import { NAVIGATION } from '../data/navigation.data';
import { getProfileAvatarUrl } from '../../utils';

@Component({
  selector: 'admin-sidebar',
  imports: [DashboardNavigation, User],
  host: {
    class: 'flex w-full flex-auto flex-col'
  },
  template: `
    <div class="relative flex items-center gap-x-2.5 pt-5 pr-4 pb-0 pl-6">
      <div class="flex flex-col">
        <div class="text-on-surface text-lg leading-none font-bold tracking-wider">ADMIN - MUSANZI</div>
      </div>
    </div>

    <ui-dashboard-navigation class="mt-8 mb-4 flex-auto" [navItems]="navItems()" />

    <ui-user
      class="mx-4 mb-4"
      [user]="authStore.user()"
      [avatarUrl]="avatarUrl()"
      appearanceLabel="Appearance"
      signOutLabel="Sign out"
      [schemeLabels]="{
        light: 'Light',
        dark: 'Dark',
        system: 'System'
      }"
      (signOut)="authStore.signOut()" />
  `
})
export class AdminSidebar {
  authStore = inject(AuthStore);
  protected readonly avatarUrl = computed(() => getProfileAvatarUrl(this.authStore.user()?.avatar ?? null));
  protected readonly navItems = computed(() => NAVIGATION);
}
