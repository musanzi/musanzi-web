import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { IProject } from '@libs/utils';
import { Observable } from 'rxjs';
import { IProjectPayload } from '../interfaces';

@Service()
export class ProjectsService {
  private readonly http = inject(HttpClient);

  create(dto: IProjectPayload): Observable<IProject> {
    return this.http.post<IProject>('/projects', dto);
  }

  delete(projectId: string): Observable<void> {
    return this.http.delete<void>(`/projects/${projectId}`);
  }

  findOne(projectId: string): Observable<IProject> {
    return this.http.get<IProject>(`/projects/${projectId}`);
  }

  update(projectId: string, dto: IProjectPayload): Observable<IProject> {
    return this.http.patch<IProject>(`/projects/${projectId}`, dto);
  }

  uploadImage(projectId: string, image: File): Observable<IProject> {
    const formData = new FormData();
    formData.append('image', image);

    return this.http.post<IProject>(`/projects/${projectId}/image`, formData);
  }
}
