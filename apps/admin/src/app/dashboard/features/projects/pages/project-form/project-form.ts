import { Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IProject, IProjectLink } from '@libs/utils';
import { ProjectsStore } from '../../data-access';
import { IProjectForm, IProjectPayload } from '../../interfaces';
import { getProjectImageUrl } from '../../utils';

@Component({
  selector: 'admin-project-form',
  providers: [ProjectsStore],
  imports: [
    MatButtonModule,
    MatCard,
    MatCardContent,
    MatCardHeader,
    FormsModule,
    MatDivider,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    RouterLink
  ],
  templateUrl: './project-form.html'
})
export class ProjectForm {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly projectsStore = inject(ProjectsStore);
  protected readonly projectId = this.route.snapshot.paramMap.get('id');
  protected readonly isEdit = computed(() => Boolean(this.projectId));
  protected readonly imagePreviewUrl = signal<string | null>(null);
  protected readonly imageFile = signal<File | null>(null);
  protected readonly projectModel = signal<IProjectForm>({
    name: '',
    summary: '',
    links: []
  });
  protected readonly existingImageUrl = computed(() => getProjectImageUrl(this.projectsStore.project()?.image ?? null));
  protected readonly displayImageUrl = computed(() => this.imagePreviewUrl() ?? this.existingImageUrl());
  protected readonly formInvalid = computed(() => {
    const value = this.projectModel();

    return !value.name.trim() || !value.summary.trim() || value.links.some((link) => !this.isValidLink(link));
  });

  constructor() {
    if (this.projectId) {
      this.projectsStore.loadProject(this.projectId);
    } else {
      this.projectsStore.clearProject();
    }

    effect(() => {
      const project = this.projectsStore.project();

      if (project) {
        this.projectModel.set(this.createFormValue(project));
      }
    });

    effect(() => {
      const error = this.projectsStore.error();
      const success = this.projectsStore.success();

      if (error) {
        this.snackBar.open(error, 'Close', { duration: 5000 });
        queueMicrotask(() => this.projectsStore.clearMessages());
      }

      if (success) {
        this.snackBar.open(success, 'Close', { duration: 3000 });
        queueMicrotask(() => {
          this.projectsStore.clearMessages();
          this.router.navigateByUrl('/projects');
        });
      }
    });

    this.destroyRef.onDestroy(() => this.revokeImagePreview());
  }

  protected addLink(): void {
    this.projectModel.update((value) => ({
      ...value,
      links: [...value.links, { label: '', href: '' }]
    }));
  }

  protected chooseImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';

    this.revokeImagePreview();
    this.imageFile.set(file);

    if (file) {
      this.imagePreviewUrl.set(URL.createObjectURL(file));
    }
  }

  protected linkHrefError(link: IProjectLink): string | null {
    const href = link.href.trim();

    if (!href) {
      return 'Enter a link URL.';
    }

    if (!this.hasHttpProtocol(href)) {
      return 'Enter a URL that starts with http:// or https://.';
    }

    return null;
  }

  protected removeLink(index: number): void {
    this.projectModel.update((value) => ({
      ...value,
      links: value.links.filter((_, currentIndex) => currentIndex !== index)
    }));
  }

  protected save(event: Event): void {
    event.preventDefault();

    if (this.formInvalid()) {
      return;
    }

    const value = this.projectModel();
    const payload: IProjectPayload = {
      name: value.name.trim(),
      summary: value.summary.trim(),
      links: value.links.map((link) => ({
        label: link.label.trim(),
        href: link.href.trim()
      }))
    };

    this.projectsStore.saveProject({
      payload,
      image: this.imageFile(),
      projectId: this.projectId ?? undefined
    });
  }

  protected trackLink(index: number): number {
    return index;
  }

  protected updateLinkHref(index: number, href: string): void {
    this.updateLink(index, { href });
  }

  protected updateLinkLabel(index: number, label: string): void {
    this.updateLink(index, { label });
  }

  protected updateName(name: string): void {
    this.projectModel.update((value) => ({ ...value, name }));
  }

  protected updateSummary(summary: string): void {
    this.projectModel.update((value) => ({ ...value, summary }));
  }

  private createFormValue(project: IProject): IProjectForm {
    return {
      name: project.name,
      summary: project.summary,
      links: project.links.map((link) => ({ ...link }))
    };
  }

  private hasHttpProtocol(value: string): boolean {
    return /^https?:\/\//i.test(value);
  }

  private isValidLink(link: IProjectLink): boolean {
    return Boolean(link.label.trim()) && this.hasHttpProtocol(link.href.trim());
  }

  private revokeImagePreview(): void {
    const previewUrl = this.imagePreviewUrl();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      this.imagePreviewUrl.set(null);
    }
  }

  private updateLink(index: number, patch: Partial<IProjectLink>): void {
    this.projectModel.update((value) => ({
      ...value,
      links: value.links.map((link, currentIndex) => (currentIndex === index ? { ...link, ...patch } : link))
    }));
  }
}
