import { NgClass } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { IProject } from '@libs/utils';
import { getPorjectCoverUrl } from '../../utils/project-cover-url';

@Component({
  selector: 'projects',
  imports: [MatCard, MatCardContent, MatIcon, NgClass],
  templateUrl: './projects.html'
})
export class Projects {
  readonly skeletonProjects = [0, 1];
  readonly projects = httpResource<[IProject[], number]>(() => '/projects');
  coverUrl = getPorjectCoverUrl;
}
