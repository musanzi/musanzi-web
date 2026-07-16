import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, debounced, DestroyRef, effect, inject, linkedSignal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { DEFAULT_LIMIT, IProject, MAX_LIMIT } from '@libs/utils';
import { ProjectsStore } from '../../data-access';
import { getProjectImageUrl } from '../../utils';
import { ConfirmDialog } from '@admin/app/shared/ui/confirm-dialog/confirm-dialog';

@Component({
  selector: 'admin-projects',
  providers: [ProjectsStore],
  imports: [
    DatePipe,
    FormsModule,
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
    RouterLink
  ],
  templateUrl: './projects.html'
})
export class Projects {
  protected readonly projectsStore = inject(ProjectsStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);

  protected readonly imageUrl = getProjectImageUrl;
  protected readonly displayedColumns = signal<string[]>(['project', 'summary', 'links', 'updatedAt', 'actions']);
  query = signal('');
  debouncedQuery = debounced(this.query, 300);
  protected readonly params = linkedSignal(() => ({
    limit: DEFAULT_LIMIT,
    page: 1,
    q: this.debouncedQuery.value()
  }));

  protected readonly projectsResource = httpResource<[IProject[], number]>(() => ({
    url: '/projects',
    params: this.params()
  }));

  constructor() {
    effect(() => {
      if (this.projectsStore.success()) {
        this.projectsResource.reload();
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

  protected pageChanged(event: PageEvent): void {
    this.params.update((p) => ({ ...p, page: event.pageIndex + 1, limit: Math.min(event.pageSize, MAX_LIMIT) }));
  }
}
