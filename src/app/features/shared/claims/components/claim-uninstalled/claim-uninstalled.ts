import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'xchange-claim-uninstalled',
  templateUrl: './claim-uninstalled.html',
  styleUrls: ['./claim-uninstalled.scss'],
  standalone: false
})
export class ClaimUninstalledComponent {
  constructor() {}
@Input() newClaimForm:any;
@Input() claimsService:any;
@Input() disabledMyAcc:any;

@Output() affectedQuantityChange = new EventEmitter<any>();
@Output() completeUninstallInfo = new EventEmitter<any>();
@Output() quantityChange = new EventEmitter<any>();


  get invoiceLines(): FormArray {
    return this.newClaimForm.get('invoiceLines') as FormArray;
  }

getInvoiceLineFormGroup(lineIndex: number): FormGroup | null {
    if (lineIndex >= 0 && lineIndex < this.invoiceLines?.length) {
      return this.invoiceLines.at(lineIndex) as FormGroup;
    }
    return null;
  }

    showAccordion(i: any) {
    this.claimsService.selectedInvoiceLines?.line?.forEach((ln: any) => {
      if (ln.selectedLines.length > 0) {
        ln.selectedLines.filter((inv: any) => {
          if (
            inv.component === i.component &&
            inv.invoiceSeq === i.invoiceSeq
          ) {
            inv.isOpen = !inv.isOpen;
          }
        });
      }
    });
  }
  onAffectedQuantityChange(item: any, formIndex: number) {
    const formGroup = this.getInvoiceLineFormGroup(formIndex);
    if (!formGroup) return;
    const value = formGroup.get('affectedQuantity')?.value;
    item.affectedQuantity = value;
    const amtControl = formGroup.get('amountProductAffected');
    // Reset value
    amtControl?.setValue('');
    item.amountProductAffected = '';
    // Update validators: if 'All' then clear validators, if 'Partial' then require amount
    if (value === 'All') {
      amtControl?.clearValidators();
    } else {
      amtControl?.setValidators([Validators.required]);
    }
    amtControl?.updateValueAndValidity();
    this.affectedQuantityChange.emit({ item, formIndex });

  }

   updateAmountofProduct(event: any, line: any) {
    this.claimsService.selectedInvoiceLines?.line?.forEach((inv: any) => {
      inv?.selectedLines?.filter((ln: any) => {
        if (
          ln?.component == line?.component &&
          ln?.invoiceSeq == line?.invoiceSeq &&
          event == "All"
        ) {
          ln.amountProductAffected = undefined;
          this.invoiceLines?.controls.forEach((control: any) => {
            const line = control.get("affectedQuantity").value;
            if (line != "All") {
              control.get("amountProductAffected").addValidators(Validators.required);
              control.get("amountProductAffected").updateValueAndValidity();
            } else {
              control.get("amountProductAffected").removeValidators(Validators.required);
              control.get("amountProductAffected").updateValueAndValidity();
            }
          });
        }
      });
    });
  }

  onQuantityChange(item: any, formIndex: number, fieldName: string, event: any) {
    const formGroup = this.getInvoiceLineFormGroup(formIndex);
    if (!formGroup) return;
    const value = event.target.value;
    if (fieldName === 'amountProductAffected') {
      item.amountProductAffected = value;
    }
    formGroup.get(fieldName)?.setValue(value);
    // this.checkProductAffectedSelcted();
    this.quantityChange.emit({ item, formIndex });
  }

  updateCompleteUninstallInfo(){
    this.completeUninstallInfo.emit();
  }

  quantityKey(keyEvent: any, maxVal: any, uom: any) {
    if (isNaN(keyEvent.target.value + keyEvent.key)) {
      return false;
    }
    let str = "";
    if (
      keyEvent.target.selectionStart == null ||
      keyEvent.target.selectionEnd == null
    ) {
      str = keyEvent.target.value + keyEvent.key;
    } else {
      str =
        keyEvent.target.value.slice(0, keyEvent.target.selectionStart) +
        keyEvent.key +
        keyEvent.target.value.slice(
          keyEvent.target.selectionEnd,
          keyEvent.target.value.length
        );
    }
    if (uom !== "ZCT") {
      if (
        str.indexOf(".") &&
        str.slice(str.indexOf("."), str.length).length > 3
      ) {
        return false;
      }
    } else {
      let patt = /^([0-9])$/;
      if (keyEvent.target.selectionStart != keyEvent.target.selectionEnd) {
      } else {
        str = keyEvent.target.value + keyEvent.key;
      }
      if (!patt.test(keyEvent.key) && str.indexOf(".")) {
        return false;
      }
    }
    if (Number(str) === 0 || Number(str) > maxVal) {
      return false;
    }
    return true;
  }
  
}
