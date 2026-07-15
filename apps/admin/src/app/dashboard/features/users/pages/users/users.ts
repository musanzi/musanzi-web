import { httpResource } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, ElementRef, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardHeader, MatCardContent } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialog } from '@admin/app/dashboard/ui/confirm-dialog/confirm-dialog';
import { getProfileAvatarUrl } from '@admin/app/dashboard/utils';
import { DEFAULT_LIMIT, IRole, IUser, MAX_LIMIT } from '@libs/utils';
import { UsersStore } from '../../data-access';
import { IUserPayload } from '../../interfaces';
import { UserFormDialog } from '../../ui/user-form-dialog/user-form-dialog';

@Component({
  selector: 'admin-users',
  providers: [UsersStore],
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatPaginatorModule,
    MatTableModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatIconButton
  ],
  templateUrl: './users.html'
})
export class Users {
  protected readonly usersStore = inject(UsersStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  protected readonly displayedColumns = signal<string[]>(['name', 'email', 'roles', 'actions']);
  protected readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  protected readonly params = linkedSignal(() => ({
    limit: DEFAULT_LIMIT,
    page: 1
  }));

  protected readonly usersResource = httpResource<[IUser[], number]>(() => ({
    url: '/users',
    params: this.params()
  }));

  protected readonly rolesResource = httpResource<[IRole[], number]>(() => ({
    url: '/roles',
    params: { limit: MAX_LIMIT, page: 1 }
  }));
  protected readonly roles = computed(() => this.rolesResource.value()?.[0] ?? []);
  protected readonly rolesById = computed(() => new Map(this.roles().map((role) => [role.id, role.name])));

  constructor() {
    effect(() => {
      if (this.usersStore.success()) {
        this.usersResource.reload();
      }
    });
  }

  protected createUser(): void {
    this.openUserDialog();
  }

  protected deleteUser(user: IUser): void {
    this.dialog
      .open<ConfirmDialog, unknown, boolean>(ConfirmDialog, {
        data: {
          title: 'Delete user',
          message: `Do you want to delete the user "${user.name}"?`
        },
        width: '420px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.usersStore.deleteUser({ userId: user.id });
      });
  }

  protected editUser(user: IUser): void {
    this.openUserDialog(user);
  }

  protected openFilePicker(): void {
    this.fileInput()?.nativeElement.click();
  }

  protected pageChanged(event: PageEvent): void {
    this.params.update((p) => ({ ...p, page: event.pageIndex + 1, limit: Math.min(event.pageSize, MAX_LIMIT) }));
  }

  protected roleLabel(role: string): string {
    return this.rolesById().get(role) ?? role;
  }

  protected userAvatarUrl(user: IUser): string | null {
    return getProfileAvatarUrl(user.avatar);
  }

  protected userInitials(user: IUser): string {
    const source = user.name || user.email;
    const initials = source
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('');

    return initials.toUpperCase() || '?';
  }

  private openUserDialog(user?: IUser): void {
    this.dialog
      .open<UserFormDialog, { user?: IUser }, IUserPayload>(UserFormDialog, {
        data: { user },
        width: '560px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => {
        if (!payload || !user) return;

        this.usersStore.updatedUser({ userId: user.id, payload });
      });
  }
}
