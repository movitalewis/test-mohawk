import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { PostModificationRoutingModule } from "./post-modification-routing.module";
@NgModule({
  declarations: [],
  imports: [CommonModule, PostModificationRoutingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe],
})
export class PostModificationModule {}
