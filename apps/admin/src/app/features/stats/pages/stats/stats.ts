import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';
import { DecimalPipe } from '@angular/common';
import { IStat } from '../../interfaces';
import { httpResource } from '@angular/common/http';

@Component({
  selector: 'admin-stats',
  imports: [DecimalPipe, MatCard, MatCardContent, MatCardHeader],
  templateUrl: './stats.html'
})
export class Stats {
  protected readonly statsResource = httpResource<IStat[]>(() => '/stats');
}
