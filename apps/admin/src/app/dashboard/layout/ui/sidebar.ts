import { Component, computed, inject } from '@angular/core';
import { AuthStore } from '@admin/app/auth/data-access';
import { DashboardNavigation, User } from '@libs/ui';
import { NAVIGATION } from '../data/navigation.data';
import { getProfileAvatarUrl } from '../../utils';

@Component({
  selector: 'admin-sidebar',
  imports: [DashboardNavigation, User],
  host: {
    class: 'flex w-full flex-auto flex-col text-white'
  },
  template: `
    <div class="relative flex items-center gap-x-2.5 pt-5 pr-4 pb-0 pl-6">
      <img src="/favicon.svg" alt="Musanzi" class="size-10 rounded-lg" />
    </div>

    <ui-dashboard-navigation class="mt-8 mb-4 flex-auto" [navItems]="navItems()" />

    <ui-user class="mx-4 mb-4" [user]="authStore.user()" [avatarUrl]="avatarUrl()" (signOut)="authStore.signOut()" />
  `
})
export class AdminSidebar {
  authStore = inject(AuthStore);
  protected readonly avatarUrl = computed(() => getProfileAvatarUrl(this.authStore.user()?.avatar ?? null));
  protected readonly navItems = computed(() => NAVIGATION);
}
