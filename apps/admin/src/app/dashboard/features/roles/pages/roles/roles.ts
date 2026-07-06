import { Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialog } from '@admin/app/dashboard/ui/confirm-dialog/confirm-dialog';
import { DEFAULT_LIMIT, IRole, MAX_LIMIT } from '@libs/utils';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { RolesStore } from '../../data-access';
import { IRoleQuery, IRolePayload } from '../../interfaces';
import { RoleFormDialog } from '../../ui/role-form-dialog/role-form-dialog';

@Component({
  selector: 'admin-roles',
  providers: [RolesStore],
  imports: [
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatFormFieldModule,
    MatIconModule,
    MatIconButton,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    ReactiveFormsModule
  ],
  templateUrl: './roles.html'
})
export class Roles {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly displayedColumns = ['name', 'actions'];
  protected readonly query = {
    limit: DEFAULT_LIMIT,
    page: 1,
    q: ''
  } satisfies IRoleQuery;
  protected readonly rolesStore = inject(RolesStore);
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.query.page = 1;
        this.query.q = this.searchControl.value.trim();
        this.loadRoles();
      });

    this.loadRoles();

    effect(() => {
      const error = this.rolesStore.error();
      const success = this.rolesStore.success();

      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
        queueMicrotask(() => this.rolesStore.clearMessages());
      }

      if (success) {
        this.snackBar.open(success, 'Close', { duration: 3000 });
        queueMicrotask(() => this.rolesStore.clearMessages());
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

  protected loadRoles(): void {
    this.query.limit = Math.min(Number(this.query.limit), MAX_LIMIT);
    this.rolesStore.loadRoles(this.query);
  }

  protected pageChanged(event: PageEvent): void {
    this.query.page = event.pageIndex + 1;
    this.query.limit = Math.min(event.pageSize, MAX_LIMIT);
    this.loadRoles();
  }

  protected trackBy(_: number, role: IRole): string {
    return role.id;
  }
}
