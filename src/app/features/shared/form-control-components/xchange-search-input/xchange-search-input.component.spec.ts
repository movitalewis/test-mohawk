import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { XchangeSearchInputComponent } from "./xchange-search-input.component";
import { ElementRef } from "@angular/core";
import { FormsModule } from "@angular/forms";

describe("XchangeSearchInputComponent", () => {
  let component: XchangeSearchInputComponent;
  let fixture: ComponentFixture<XchangeSearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [XchangeSearchInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(XchangeSearchInputComponent);
    component = fixture.componentInstance;

    // Mock ElementRefs
    component.searchBoxInput = new ElementRef(document.createElement("input"));
    component.suggestionBox = new ElementRef(document.createElement("div"));
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("onDocumentClick", () => {
    it("should close suggestion box if click is outside", () => {
      const event = { target: document.createElement("div") } as any;
      component.isSuggestionBoxOpen = true;
      component.onDocumentClick(event);
      expect(component.isSuggestionBoxOpen).toBeFalse();
    });

    it("should open suggestion box if click is inside input", () => {
      const event = { target: component.searchBoxInput.nativeElement } as any;
      component.isSuggestionBoxOpen = false;
      component.onDocumentClick(event);
      expect(component.isSuggestionBoxOpen).toBeTrue();
    });
  });

  it("should emit suggestionClick and close suggestion box on onSuggestionClick", () => {
    spyOn(component.suggestionClick, "emit");
    component.isSuggestionBoxOpen = true;
    component.onSuggestionClick("test");
    expect(component.suggestionClick.emit).toHaveBeenCalledWith("test");
    expect(component.isSuggestionBoxOpen).toBeFalse();
  });

  it("should handle onInputEvent", () => {
    spyOn(component.input, "emit");
    const event = { target: { value: "abc" } } as any;
    spyOn(component, "enableShowNoResult");
    component.onInputEvent(event);
    expect(component.searchDefaultValue).toBe("abc");
    expect(component.input.emit).toHaveBeenCalledWith("abc");
    expect(component.enableShowNoResult).toHaveBeenCalled();
  });

  it("should handle onKeypress", () => {
    spyOn(component.keypress, "emit");
    component.searchByIcon = false;
    const event = { target: { value: "xyz" } } as any;
    component.onKeypress(event);
    expect(component.showSpinner).toBeTrue();
    expect(component.searchDefaultValue).toBe("xyz");
    expect(component.keypress.emit).toHaveBeenCalledWith("xyz");
  });

  it("should not emit keypress onKeypress if searchByIcon is true", () => {
    spyOn(component.keypress, "emit");
    component.searchByIcon = true;
    const event = { target: { value: "xyz" } } as any;
    component.onKeypress(event);
    expect(component.keypress.emit).not.toHaveBeenCalled();
  });

  it("should handle onKeydown", () => {
    spyOn(component.keypress, "emit");
    component.searchByIcon = false;
    const event = { target: { value: "down" } } as any;
    component.onKeydown(event);
    expect(component.searchDefaultValue).toBe("down");
    expect(component.keypress.emit).toHaveBeenCalledWith("down");
  });

  it("should not emit keypress onKeydown if searchByIcon is true", () => {
    spyOn(component.keypress, "emit");
    component.searchByIcon = true;
    const event = { target: { value: "down" } } as any;
    component.onKeydown(event);
    expect(component.keypress.emit).not.toHaveBeenCalled();
  });

  it("should handle onKeyup", () => {
    spyOn(component.keyup, "emit");
    spyOn(component, "enableShowNoResult");
    component.searchByIcon = false;
    const event = { target: { value: "up" } } as any;
    component.onKeyup(event);
    expect(component.searchDefaultValue).toBe("up");
    expect(component.enableShowNoResult).toHaveBeenCalled();
    expect(component.keyup.emit).toHaveBeenCalledWith("up");
  });

  it("should not emit keyup onKeyup if searchByIcon is true", () => {
    spyOn(component.keyup, "emit");
    component.searchByIcon = true;
    const event = { target: { value: "up" } } as any;
    component.onKeyup(event);
    expect(component.keyup.emit).not.toHaveBeenCalled();
  });

  it("should handle onBlurEvent", () => {
    spyOn(component.blur, "emit");
    component.searchByIcon = false;
    const event = { target: { value: "blur" } } as any;
    component.onBlurEvent(event);
    expect(component.searchDefaultValue).toBe("blur");
    expect(component.blur.emit).toHaveBeenCalledWith("blur");
  });

  it("should not emit blur onBlurEvent if searchByIcon is true", () => {
    spyOn(component.blur, "emit");
    component.searchByIcon = true;
    const event = { target: { value: "blur" } } as any;
    component.onBlurEvent(event);
    expect(component.blur.emit).not.toHaveBeenCalled();
  });

  it("should handle onEnter", () => {
    spyOn(component, "enableShowNoResult");
    spyOn(component.sendValue, "emit");
    component.searchKey = "enterKey";
    component.onEnter();
    expect(component.enableShowNoResult).toHaveBeenCalled();
    expect(component.sendValue.emit).toHaveBeenCalledWith("enterKey");
  });

  it("should handle onFocus", () => {
    spyOn(component.focus, "emit");
    component.clearFlag = true;
    component.onFocus();
    expect(component.focus.emit).toHaveBeenCalledWith("");
    expect(component.clearFlag).toBeFalse();
  });

  it("should handle onSearch", () => {
    spyOn(component.focus, "emit");
    spyOn(component, "enableShowNoResult");
    spyOn(component.sendValue, "emit");
    component.searchKey = "searchKey";
    component.clearFlag = false;
    component.onSearch();
    expect(component.focus.emit).toHaveBeenCalledWith("");
    expect(component.enableShowNoResult).toHaveBeenCalled();
    expect(component.sendValue.emit).toHaveBeenCalledWith("searchKey");
    expect(component.clearFlag).toBeTrue();
  });

  it("should handle onClearInput", () => {
    spyOn(component.clearBtnClick, "emit");
    spyOn(component.input, "emit");
    spyOn(component, "enableShowNoResult");
    spyOn(component.sendValue, "emit");
    spyOn(component.focus, "emit");
    component.searchKey = "something";
    component.searchDefaultValue = "default";
    component.searchBoxInput.nativeElement.value = "default";
    component.clearFlag = true;
    component.onClearInput();
    expect(component.clearBtnClick.emit).toHaveBeenCalledWith("");
    expect(component.searchKey).toBe("");
    expect(component.input.emit).toHaveBeenCalledWith("");
    expect(component.searchDefaultValue).toBe("");
    expect(component.searchBoxInput.nativeElement.value).toBe("");
    expect(component.enableShowNoResult).toHaveBeenCalled();
    expect(component.sendValue.emit).toHaveBeenCalledWith("");
    expect(component.focus.emit).toHaveBeenCalledWith("");
    expect(component.clearFlag).toBeFalse();
  });

  it("should handle enableShowNoResult", fakeAsync(() => {
    component.showNoResult = false;
    component.enableShowNoResult();
    expect(component.showNoResult).toBeFalse();
    tick(1000);
    expect(component.showNoResult).toBeTrue();
  }));
});
