import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../presentation';
import { SidebarComponent } from '../../presentation';
import {CommonModule} from '@angular/common';
import { Subscription } from 'rxjs';
import {SidebarService} from '../../core/infrastructure/api/sidebar/sidebar.service';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  sidebarCollapsed = false;

  private sidebarService = inject(SidebarService);
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(
      this.sidebarService.isCollapsed$.subscribe(collapsed => {
        this.sidebarCollapsed = collapsed;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
