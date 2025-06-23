import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab<T = string> {
  id: T;
  label: string;
  icon?: string;
  disabled?: boolean;
  hidden?: boolean;
}

export type Size = 'sm' | 'md' | 'lg';
export type TabStyle = 'underline' | 'pill' | 'rounded';

@Component({
  selector: 'app-atzicay-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './atzicay-tabs.component.html',
  styleUrls: ['./atzicay-tabs.component.css'],
})
export class AtzicayTabsComponent<T = string> {
  @Input() tabs: Tab<T>[] = [];
  @Input() activeTab: T | undefined;

  @Input() tabStyle: TabStyle = 'pill';

  @Input() size: Size = 'md';
  @Input() gap: Size = 'md';
  @Input() padding: Size = 'md';

  @Input() fullWidth: boolean = false;
  @Input() wrap: boolean = false;
  @Input() roundedFull: boolean = false;

  @Input() activeColor: string = 'bg-atzicay-purple-500 text-white';
  @Input() inactiveColor: string = 'bg-purple-200 text-gray-400';
  @Input() disabledColor: string = 'opacity-50 cursor-not-allowed';

  @Output() tabChanged = new EventEmitter<T>();

  /**
   * Indicates whether the tab style is set to 'pill'.
   * Used to dynamically add the CSS class `rounded-lg` to the tab.
   */
  get pillStyle(): boolean {
    return this.tabStyle === 'pill';
  }

  /**
   * Changes the active tab based on the provided tab ID.
   * If the tab is already active or the tab is disabled, no action is taken.
   * Otherwise, the active tab is updated and an event is emitted.
   *
   * @param tabId - The ID of the tab to activate.
   */

  changeTab(tabId: T) {
    if (this.activeTab === tabId) return;

    const selectedTab = this.tabs.find((t) => t.id === tabId);
    if (selectedTab && !selectedTab.disabled) {
      this.activeTab = tabId;
      this.tabChanged.emit(tabId);
    }
  }

  /**
   * Tracking function for the ngFor directive in the template.
   * This is needed because the tabs are an array of objects and we need to tell Angular
   * how to identify each item uniquely.
   *
   * @param index The index of the item in the array.
   * @param tab The item itself.
   * @returns The unique identifier for the item, which is the id property.
   */
  trackByFn(index: number, tab: Tab<T>): T {
    return tab.id;
  }

  /**
   * Generates a string of CSS classes for a button element based on the tab's state and component settings.
   *
   * @param tab - The tab object for which the button classes are being generated.
   * @returns A string containing the CSS classes to be applied to the button element.
   *
   * The function determines the base classes based on the configured size ('sm', 'md', or others)
   * and conditionally adds classes based on the tab's active status, style (pill or full-rounded),
   * and whether the tab is disabled. It also handles styling for active/inactive states, full-width
   * buttons, and specific styles like underline depending on the component's configuration.
   */
  getButtonClasses(tab: Tab<T>): string {
    const baseClasses = [];

    if (this.size === 'sm') {
      baseClasses.push('px-3 py-1 text-xs');
    } else if (this.size === 'md') {
      baseClasses.push('px-4 py-2 text-sm');
    } else {
      baseClasses.push('px-6 py-3 text-base');
    }

    if (this.activeTab === tab.id) {
      baseClasses.push(this.activeColor);

      if (
        this.tabStyle === 'underline' &&
        !this.pillStyle &&
        !this.roundedFull
      ) {
        baseClasses.push('border-b-2 border-purple-600 rounded-none');
      }
    } else {
      baseClasses.push(this.inactiveColor);

      if (this.pillStyle) {
        baseClasses.push('hover:bg-gray-200');
      }
    }

    if (this.pillStyle) {
      baseClasses.push('rounded-lg');
    } else if (this.roundedFull) {
      baseClasses.push('rounded-full');
    }

    if (this.fullWidth) {
      baseClasses.push('flex-1 text-center');
    }

    if (tab.disabled) {
      baseClasses.push(this.disabledColor);
    }

    return baseClasses.join(' ');
  }
}
