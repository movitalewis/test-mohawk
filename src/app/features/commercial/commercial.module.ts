import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CommercialRoutingModule } from "./commercial-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/features/shared/shared.module";
import { CxoneChatService } from "./services/cxone-chat.service";
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    CommercialRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  providers: [CxoneChatService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommercialModule {
  constructor(private cxoneChatService: CxoneChatService) {
    this.cxoneChatService.init();
  }
}
