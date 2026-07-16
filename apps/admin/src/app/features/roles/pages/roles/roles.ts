import { httpResource } from '@angular/common/http';
import { Component, debounced, DestroyRef, effect, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DEFAULT_LIMIT, IRole, MAX_LIMIT } from '@libs/utils';
import { RolesStore } from '../../data-access';
import { IRolePayload } from '../../interfaces';
import { RoleFormDialog } from '../../ui/role-form-dialog/role-form-dialog';
import { ConfirmDialog } from '@admin/app/shared/ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'admin-roles',
  providers: [RolesStore],
  imports: [
    FormsModule,
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatFormFieldModule,
    MatIconModule,
    MatIconButton,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule
  ],
  templateUrl: './roles.html'
})
export class Roles {
  protected readonly rolesStore = inject(RolesStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  protected readonly displayedColumns = signal<string[]>(['name', 'actions']);
  query = signal('');
  debouncedQuery = debounced(this.query, 300);
  protected readonly params = linkedSignal(() => ({
    limit: DEFAULT_LIMIT,
    page: 1,
    q: this.debouncedQuery.value()
  }));

  protected readonly rolesResource = httpResource<[IRole[], number]>(() => ({
    url: '/roles',
    params: this.params()
  }));

  constructor() {
    effect(() => {
      if (this.rolesStore.success()) {
        this.rolesResource.reload();
      }
    });
  }

  protected createRole(): void {
    this.dialog
      .open<RoleFormDialog, undefined, IRolePayload>(RoleFormDialog, { width: '420px' })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => {
        if (!payload) {
          return;
        }

        this.rolesStore.saveRole({ payload });
      });
  }

  protected deleteRole(role: IRole): void {
    this.dialog
      .open<ConfirmDialog, unknown, boolean>(ConfirmDialog, {
        data: {
          title: 'Delete role',
          message: `Do you want to delete the role "${role.name}"?`
        },
        width: '420px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.rolesStore.deleteRole({ roleId: role.id });
      });
  }

  protected editRole(role: IRole): void {
    this.dialog
      .open<RoleFormDialog, { role: IRole }, IRolePayload>(RoleFormDialog, {
        data: { role },
        width: '420px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => {
        if (!payload) {
          return;
        }

        this.rolesStore.saveRole({ payload, roleId: role.id });
      });
  }

  protected pageChanged(event: PageEvent): void {
    this.params.update((p) => ({ ...p, page: event.pageIndex + 1, limit: Math.min(event.pageSize, MAX_LIMIT) }));
  }
}
