import { Component, input } from "@angular/core";
import { Article } from "../../shared/interfaces/article";

@Component({
  standalone: true,
  selector: "app-list",
  template: `
    <ul>
      @for (article of articles; track $index) {
        <li>
          {{ article.title }}
        </li>
      }
    </ul>
  `,
  styles: [
    `
      ul {
        padding: 0;
      }
      li {
        border: 1px solid #bdc3c7;
        list-style: none;
        margin-bottom: 1rem;
        padding: 1rem;
      }
    `,
  ],
})
export class ListComponent {
  @Input({ required: true }) articles!: Article[];
}
