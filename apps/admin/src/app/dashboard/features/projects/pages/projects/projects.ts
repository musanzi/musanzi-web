import { DatePipe } from '@angular/common';
import { Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
import { DEFAULT_LIMIT, IProject, MAX_LIMIT } from '@libs/utils';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProjectsStore } from '../../data-access';
import { IProjectQuery } from '../../interfaces';
import { getProjectImageUrl } from '../../utils';

@Component({
  selector: 'admin-projects',
  providers: [ProjectsStore],
  imports: [
    DatePipe,
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatFormFieldModule,
    MatIconButton,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatTableModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './projects.html'
})
export class Projects {
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly displayedColumns = ['project', 'summary', 'links', 'updatedAt', 'actions'];
  protected readonly projectsStore = inject(ProjectsStore);
  protected readonly query = {
    limit: DEFAULT_LIMIT,
    page: 1,
    q: ''
  } satisfies IProjectQuery;
  protected readonly searchControl = new FormControl('', { nonNullable: true });

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.query.page = 1;
        this.query.q = this.searchControl.value.trim();
        this.loadProjects();
      });

    this.loadProjects();

    effect(() => {
      const error = this.projectsStore.error();
      const success = this.projectsStore.success();

      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
        queueMicrotask(() => this.projectsStore.clearMessages());
      }

      if (success) {
        this.snackBar.open(success, 'Close', { duration: 3000 });
        queueMicrotask(() => this.projectsStore.clearMessages());
      }
    });
  }

  protected deleteProject(project: IProject): void {
    this.dialog
      .open<ConfirmDialog, unknown, boolean>(ConfirmDialog, {
        data: {
          title: 'Delete project',
          message: `Do you want to delete the project "${project.name}"?`
        },
        width: '420px'
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.projectsStore.deleteProject({ projectId: project.id });
      });
  }

  protected imageUrl(project: IProject): string | null {
    return getProjectImageUrl(project.image);
  }

  protected loadProjects(): void {
    this.query.limit = Math.min(Number(this.query.limit), MAX_LIMIT);
    this.projectsStore.loadProjects(this.query);
  }

  protected pageChanged(event: PageEvent): void {
    this.query.page = event.pageIndex + 1;
    this.query.limit = Math.min(event.pageSize, MAX_LIMIT);
    this.loadProjects();
  }

  protected trackBy(_: number, project: IProject): string {
    return project.id;
  }
}
