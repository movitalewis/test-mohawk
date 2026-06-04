import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { UserService } from "../../../../shared/user/services/user.service";
@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.scss"],
    standalone: false
})
export class ProfileComponent implements OnInit {
  firstName = "";
  lastName = "";
  email = "";
  mobilePhone = "";
  extension = "";
  fax = "";
  role = "";
  // location = "";
  isEditMode: boolean = false;
  phone: any;
  alertData: any = {
    message: "success",
  };

  alertType: any = "success";
  alertTrigger: any = false;
  roles: any = [
    { value: "ownergroup", name: "Owner" },
    { value: "managergroup", name: "Manager" },
    { value: "salesassociategroup", name: "Sales Associate" },
    { value: "accountgroup", name: "Accounts Payable / Receivable" },
    { value: "operationsgroup", name: "Operations" },
    { value: "purchaseinggroup", name: "Purchasing" },
    { value: "specifiergroup", name: "Specifier/Estimator" },
  ];
  constructor(private userService: UserService, private fb: FormBuilder) {}
  profile!: FormGroup;

  ngOnInit(): void {
    this.getProfileData();
    this.setStateValue();
  }
  getProfileData() {
    this.userService.getCurrentUserDetail().subscribe((response) => {
      let userDetails = response?.body;
      userDetails.workPhone = userDetails?.workPhone ? userDetails?.workPhone?.replace(/[^0-9]/g, '') : userDetails?.workPhone;
      userDetails.mobilePhone = userDetails?.mobilePhone ? userDetails?.mobilePhone?.replace(/[^0-9]/g, '') : userDetails?.mobilePhone;
      this.firstName = userDetails.firstName;
      this.firstName =
        this.firstName.charAt(0).toUpperCase() + this.firstName.slice(1);
      this.lastName = userDetails.lastName;
      this.phone = this.convertToUsPhoneFormat(userDetails.workPhone);
      this.lastName =
        this.lastName.charAt(0).toUpperCase() + this.lastName.slice(1);
      this.email = userDetails.email;
      // this.mobilePhone = this.formatPhoneNumber(
      //   userDetails.mobilePhone,
      //   userDetails.extension
      // );
      // this.mobilePhone = userDetails.mobilePhone;
      this.mobilePhone = this.convertToUsPhoneFormat(userDetails.mobilePhone);
      this.extension = userDetails?.extension;
      this.fax = "";
      this.role = userDetails.primaryRole || null;
      // this.userService.userAddress.subscribe((res) => {
      //   this.location = res.split(",")[2];
      // });
    });
  }
  setStateValue() {
    this.profile = this.fb.group({
      firstName: [
        this.firstName,
        [Validators.required, Validators.pattern(/^[a-zA-Z]*$/)],
      ],
      lastName: [
        this.lastName,
        [Validators.required, Validators.pattern(/^[a-zA-Z]*$/)],
      ],
      email: [{ value: this.email, disabled: true }, [Validators.required]],
      workPhone: [
        this.phone,
        [
          Validators.required,
          // Validators.pattern(/^[0-9]*$/),
          Validators.min(Number("9".repeat(9))),
          Validators.max(Number("9".repeat(10))),
        ],
      ],
      mobilePhone: [
        this.mobilePhone,
        [
          // Validators.pattern(/^[0-9]*$/),
          Validators.min(Number("9".repeat(9))),
          Validators.max(Number("9".repeat(10)))
        ],
      ],
      extension: [this.extension, [Validators.pattern("^(0|[1-9][0-9]*)$")]],
      // fax: [this.fax, [Validators.required,]],
      role: [this.role, [Validators.required]],
      // location: [this.location, [Validators.required]],
    });
  }
  formatPhoneNumber(mobilePhone: string, extension: string): string {
    if (mobilePhone === "" || mobilePhone == null || mobilePhone == undefined)
      return "";
    return (
      mobilePhone?.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3") +
      " " +
      (extension !== "" ? "Ext: " + extension : "")
    );
  }
  onSubmit() {
    this.userService.profileProgress('updateProfile')
    let formValues = this.profile.getRawValue();
    let payload = {
      firstName: formValues?.firstName,
      lastName: formValues?.lastName,
      email: formValues?.email,
      workPhone: this.getPhoneNumber(formValues?.workPhone),
      extension: formValues.extension,
      mobilePhone: this.getPhoneNumber(formValues?.mobilePhone),
      role: formValues?.role,
      // location: formValues?.location
    };
    this.userService.updateProfile(payload).subscribe((res: any) => {
      if (res) {
        setTimeout(() => {
          this.userService.profileProgressHide(); 
        }, 2000);
        this.alertData = {
          message: "Profile Updated successfully",
        };
        this.alertType = "success";
        this.alertTrigger = true;
        this.getProfileData();
        this.stopAlert();
        this.isEditMode = false;
      }
    },(err)=>{
      this.userService.profileProgressHide()
    });
  }
  stopAlert() {
    setTimeout(() => {
      this.alertTrigger = false;
    }, 4000);
  }

  getPhoneNumber(value: any) {
    if (value?.length) {
      if(value.slice(0,1) === '+'){
        value = value?.replace(/[^0-9+]+/ig, "");
        value = value?.length > 12 ? value.slice(-12) : value;
        return value;
      }else{
      value = value?.replace(/[^0-9]+/ig, "");
      value = value?.length > 10 ? value.slice(-10) : value;
      return value;
      }
    } else {
      return "";
    }
  }

  checkMobilePhoneValidation(e: any) {
    // const phoneCharLength = 10;
    // let val = e?.target?.value ? e.target.value : e;
    let val = e?.target?.value ? e.target.value : "";
    const phoneCharLength = val.slice(0,1) === '+' ? 12 : 10;
    this.phonePattern = val.slice(0,1) === '+' ?  /^\+?\d{11}$/ : "[0-9]{10}";
    const maxLength = val.slice(0,1) === '+' ? 17 : 14;
    if (val.length == phoneCharLength && this.profile.controls["mobilePhone"].valid) {
      this.profile.controls["mobilePhone"].clearValidators();
      this.profile.controls["mobilePhone"].updateValueAndValidity();
      this.profile.patchValue({
        mobilePhone: this.convertToUsPhoneFormat(val),
      });
      this.profile.controls["mobilePhone"].setValidators([Validators.maxLength(14)]);
      this.profile.controls["mobilePhone"].updateValueAndValidity();
    } else {
      let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
      if (onlyNumbers.length == phoneCharLength) {
        this.profile.patchValue({
          mobilePhone: this.convertToUsPhoneFormat(onlyNumbers),
        });
        this.profile.controls["mobilePhone"].setValidators([Validators.maxLength(maxLength)]);
        } else {
        this.profile.patchValue({
          mobilePhone: onlyNumbers,
        });
        this.profile.controls["mobilePhone"].setValidators([
          Validators.pattern(this.phonePattern)
        ]);
      }
      this.profile.controls["mobilePhone"].updateValueAndValidity();
    }
  }

  convertToUsPhoneFormat(val: any) {
    if(val?.slice(0,1) === '+'){
      let formatedValue =val?.substring(0, 2) + " "
      formatedValue +=  "(" + val?.substring(2, 5) + ") ";
      formatedValue += val?.substring(5, 8) + " ";
      formatedValue += val?.substring(8, 12);
      return formatedValue;
    }else
    if (val?.length) {
      let formatedValue = "(";
      formatedValue += val?.substring(0, 3) + ") ";
      formatedValue += val?.substring(3, 6) + " ";
      formatedValue += val?.substring(6, 10);
      return formatedValue;
    } else {
      return "";
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
    let index = val?.indexOf(char);
    return index >= 0 ? val?.slice(0, index) + val?.slice(index + 1) : val;
  }

  phonePattern: any = "[0-9]{10}";
  // phonePattern = /^(?:\+|\d{10})$/;
  checkWorkPhoneValidation(e: any) {
    let val = e?.target?.value ? e.target.value : "";
    const phoneCharLength = val.slice(0,1) === '+' ? 12 : 10;
    this.phonePattern = val.slice(0,1) === '+' ?  /^\+?\d{11}$/ : "[0-9]{10}";
    const maxLength = val.slice(0,1) === '+' ? 17 : 14;
    if (val.length == phoneCharLength && this.profile.controls["workPhone"].valid) {
      this.profile.controls["workPhone"].clearValidators();
      this.profile.controls["workPhone"].updateValueAndValidity();
      this.profile.patchValue({
        workPhone: this.convertToUsPhoneFormat(val),
      });
      this.profile.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(maxLength)]);
      this.profile.controls["workPhone"].updateValueAndValidity();
    } else {
      let onlyNumbers = this.clearSpeacialCharsFromPhoneNumber(val);
      if (onlyNumbers.length == phoneCharLength) {
        this.profile.patchValue({
          workPhone: this.convertToUsPhoneFormat(onlyNumbers),
        });
        this.profile.controls["workPhone"].setValidators([Validators.required, Validators.maxLength(maxLength)]);
      } else {
        this.profile.patchValue({
          workPhone: onlyNumbers,
        });
        this.profile.controls["workPhone"].setValidators([
          Validators.required,
          Validators.pattern(this.phonePattern),
          Validators.maxLength(maxLength),
        ]);
      }
      this.profile.controls["workPhone"].updateValueAndValidity();
    }
  }
  formateWorkPhone(event:any){
    let value = event.target.value;
    if(this.phonePattern != "[0-9]{10}" && !this.phonePattern.test(value)){
    value = value.replace(/[^0-9+]/g,'');
    if(value.lastIndexOf('+') > 0){
      let val = value.slice(1,value.length);
      val = val.replace(/\+/g,'');
      value = value.slice(0,1)+val;
    }
    }else if(value.slice(0,1) !== '+'){
      value = value.replace(/[^0-9]/g, '')
    }
    // value = value.replace(/[^0-9+]/g, '').replace(/(\..*)\./g, '$1').charAt(0)+value.replace(/[^0-9]/g, '').replace(/(\..*)\./g, '$1').slice(1).replace(/\s+/g, ' ')
    event.target.value = value;
  }
  onEditProfile() {
    this.isEditMode = true;
    this.markFormGroupTouched(this.profile);
  }
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  onBack() {
    this.isEditMode = false;
    this.getProfileData();
    this.setStateValue();
    this.resetFormState(this.profile);
  }
  resetFormState(formGroup: FormGroup) {
    formGroup.markAsUntouched(); 
    formGroup.markAsPristine();  
  }
}
