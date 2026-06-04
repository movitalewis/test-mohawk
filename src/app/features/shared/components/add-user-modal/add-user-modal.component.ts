import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { BsModalService } from "ngx-bootstrap/modal";

@Component({
    selector: "app-add-user-modal",
    templateUrl: "./add-user-modal.component.html",
    styleUrls: ["./add-user-modal.component.scss"],
    standalone: false
})
export class AddUserModalComponent implements OnInit {
  userFrom!: FormGroup;
  @Output() formValue = new EventEmitter<string>();
  constructor(private modalService: BsModalService, private fb: FormBuilder) {}
  @Input() errorMessage = "";
  ngOnInit(): void {
    this.userFrom = this.fb.group({
      email: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          ),
        ],
      ],
      firstName: ["", [Validators.required]],
      lastName: ["", [Validators.required]],
      mobilePhone: [""],
      workPhone: ["", [Validators.required]],
      extension: [""],
    });
  }

  get hasFormValid() {
    return this.userFrom?.valid;
  }
  onHideModal() {
    this.modalService.hide();
  }
  submit() {
    this.formValue.emit(this.userFrom.value);
  }
  validateNo(e: any) {
    if (e.target.value.length >= 10) {
      return false;
    }
    const charCode = e.which ? e.which : e.keyCode;
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57)) ||
      e.target.value.length == 13
    ) {
      return false;
    }
    return true;
  }

  checkPhoneValidation(e: any, controlName: string) {
    const phoneCharLength = 10;
    let val = e?.target?.value ? e.target.value : e;
    if (
      val.length == phoneCharLength &&
      this.userFrom.controls[controlName].valid
    ) {
      this.userFrom.controls[controlName].clearValidators();
      this.userFrom.controls[controlName].updateValueAndValidity();
      this.userFrom.controls[controlName].patchValue(
        this.convertToUsPhoneFormat(val)
      );
      if (controlName != "mobilePhone") {
        this.userFrom.controls[controlName].setValidators([
          Validators.required,
        ]);
        this.userFrom.controls[controlName].updateValueAndValidity();
      }
    } else {
      let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
      if (onlyNumbers.length == phoneCharLength) {
        this.userFrom.controls[controlName].patchValue(
          this.convertToUsPhoneFormat(onlyNumbers)
        );
        if (controlName != "mobilePhone") {
          this.userFrom.controls[controlName].setValidators([
            Validators.required,
          ]);
        }
      } else {
        this.userFrom.controls[controlName].patchValue(onlyNumbers);
        if (controlName != "mobilePhone") {
          this.userFrom.controls[controlName].setValidators([
            Validators.required,
            Validators.pattern("[0-9]{10}"),
          ]);
        } else {
          this.userFrom.controls[controlName].setValidators([
            Validators.pattern("[0-9]{10}"),
          ]);
        }
      }
      this.userFrom.controls[controlName].updateValueAndValidity();
    }
  }
  clearSpeacialCharsFromPhoneNumber(val: any) {
    val = this.removeChar(val, " ");
    val = this.removeChar(val, " ");
    val = this.removeChar(val, "(");
    val = this.removeChar(val, ")");
    return val;
  }
  removeChar(val: any, char: any) {
    let index = val.indexOf(char);
    return index >= 0 ? val.slice(0, index) + val.slice(index + 1) : val;
  }

  convertToUsPhoneFormat(val: any) {
    let formatedValue = "(";
    formatedValue += val.substring(0, 3) + ") ";
    formatedValue += val.substring(3, 6) + " ";
    formatedValue += val.substring(6, 10);
    return formatedValue;
  }
}
