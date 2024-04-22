import { Component, EventEmitter, input, output } from "@angular/core";

@Component({
  standalone: true,
  selector: "app-pagination",
  template: `
    <button
      (click)="currentPage() > 1 ? pageChange.emit(currentPage() - 1) : ''"
    >
      Prev
    </button>
    {{ currentPage() }}
    <button (click)="pageChange.emit(currentPage() + 1)">Next</button>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: space-between;
      }
    `,
  ],
})
export class PaginationComponent {
  currentPage = input.required<number>();
  pageChange = output<number>();
}
