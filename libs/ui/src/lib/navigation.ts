import { Tree, TreeItem, TreeItemGroup } from '@angular/aria/tree';
import { CdkMonitorFocus } from '@angular/cdk/a11y';
import { NgTemplateOutlet } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { isActive, IsActiveMatchOptions, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { INavigationItem } from '@libs/utils';
import { filter, take } from 'rxjs';

@Component({
  selector: 'ui-dashboard-navigation',
  imports: [MatIcon, NgTemplateOutlet, RouterLinkActive, Tree, TreeItem, TreeItemGroup, RouterLink, CdkMonitorFocus],
  template: `
    <div class="flex flex-col gap-y-4">
      @for (section of navigation(); track section.id) {
        <div class="flex flex-col px-4">
          <div class="px-2.5 py-1.5 text-sm font-semibold text-primary-400">
            {{ section.label }}

            @if (section.description) {
              <div class="text-xs font-medium text-neutral-400">
                {{ section.description }}
              </div>
            }
          </div>

          <ul ngTree class="mt-1 flex flex-col gap-y-1" [nav]="true" #tree="ngTree">
            <ng-template
              [ngTemplateOutlet]="treeNodes"
              [ngTemplateOutletContext]="{
                nodes: section.children,
                parent: tree
              }" />
          </ul>

          <ng-template let-nodes="nodes" let-parent="parent" #treeNodes>
            @for (node of nodes; track node.id) {
              <a
                cdkMonitorElementFocus
                ngTreeItem
                routerLinkActive="bg-primary-800/60"
                class="navigation-item flex cursor-pointer items-center gap-x-2 rounded-lg px-2.5 py-2 select-none hover:bg-primary-800/60"
                [parent]="parent"
                [value]="node.id"
                [label]="node.label"
                [disabled]="node.disabled"
                [selectable]="!node.children"
                [(expanded)]="node.expanded"
                [routerLink]="node.route"
                [routerLinkActiveOptions]="node.activeOptions ?? { exact: true }"
                (click)="$event.preventDefault()"
                #rla="routerLinkActive"
                #treeItem="ngTreeItem">
                @if (node.icon) {
                  <mat-icon class="pointer-events-none size-4" [svgIcon]="node.icon" />
                }

                <div class="flex flex-auto flex-col font-medium">
                  {{ node.label }}

                  @if (node.description) {
                    <div class="text-xs">
                      {{ node.description }}
                    </div>
                  }
                </div>

                @if (node.badge) {
                  <div class="rounded bg-pink-400 px-1.5 py-0.5 text-xs font-semibold dark:bg-pink-700">
                    {{ node.badge }}
                  </div>
                }

                @if (node.children && node.children.length > 0) {
                  <mat-icon
                    svgIcon="chevron-right"
                    class="pointer-events-none size-4 transition-[rotate]"
                    [class.rotate-90]="node.expanded" />
                }
              </a>

              @if (node.children && node.children.length > 0) {
                <ul
                  class="flex flex-col gap-y-1 [&_ul>.navigation-item]:pl-14.5 [&>.navigation-item]:pl-8.5"
                  [class.hidden]="!node.expanded"
                  [class.mt-1]="node.expanded"
                  role="group">
                  <ng-template ngTreeItemGroup [ownedBy]="treeItem" #group="ngTreeItemGroup">
                    <ng-template
                      [ngTemplateOutlet]="treeNodes"
                      [ngTemplateOutletContext]="{
                        nodes: node.children,
                        parent: group
                      }" />
                  </ng-template>
                </ul>
              }
            }
          </ng-template>
        </div>
      }
    </div>
  `
})
export class DashboardNavigation {
  private router = inject(Router);
  navItems = input.required<INavigationItem[]>();

  protected navigation = signal<INavigationItem[]>([]);
  protected navigationEnd = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      take(1)
    )
  );

  constructor() {
    effect(() => {
      this.navigation.set(this.navItems());
    });
    effect(() => {
      const navigationEnd = this.navigationEnd();
      if (!navigationEnd) {
        return;
      }

      this.navigation.set(this.expandActiveRoute(this.navigation()));
    });
  }

  expandActiveRoute(items: INavigationItem[]): INavigationItem[] {
    for (const item of items) {
      if (item.children?.length) {
        item.children = this.expandActiveRoute(item.children);
        if (item.children.some((child) => child.expanded)) {
          item.expanded = true;
        }
      }
      if (
        item.route &&
        isActive(item.route, this.router, this.isActiveOption(item.activeOptions ?? { exact: true }))()
      ) {
        item.expanded = true;
      }
    }
    return items;
  }

  isActiveOption(options: { exact: boolean } | IsActiveMatchOptions): IsActiveMatchOptions {
    if ('exact' in options) {
      return options.exact
        ? {
            paths: 'exact',
            queryParams: 'exact',
            fragment: 'ignored',
            matrixParams: 'ignored'
          }
        : {
            paths: 'subset',
            queryParams: 'subset',
            fragment: 'ignored',
            matrixParams: 'ignored'
          };
    }

    return options;
  }
}
