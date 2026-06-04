import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { Config, Columns, DefaultConfig } from "ngx-easy-table";

@Component({
    selector: "xchange-manage-deductions",
    templateUrl: "./manage-deductions.component.html",
    styleUrls: ["./manage-deductions.component.scss"],
    standalone: false
})
export class XchangeManageDeductionsComponent implements OnInit {
  // Inputs / Outputs
  @Input() receivableData!: any;
  @Input() priceLabel!: any;
  @Output() output = new EventEmitter<any>();

  // Modal Ref
  modalRef?: BsModalRef;

  // Edit Deduction Form
  isEditApplyButtonDisabled: boolean = true;
  editIndex: number | undefined = undefined;
  editDeductionForm!: FormGroup ;

  // Add Deduction Form
  isAddNewDeductionDisabled: boolean = false;
  showAddDeduction: boolean = false;
  isApplyButtonDisabled: boolean = true;
  addDeductionForm!: FormGroup;
 
  public addDeductionData = {
    openAmount: 0,
    deductionAmount: 0,
    netChargeAmount: 0,
    deductionDescription: "",
    comments: "",
    index: 0,
  };

  // Table Configuration
  tableConfig: Config = {
    ...DefaultConfig,
    checkboxes: false,
    tableLayout: {
      ...DefaultConfig.tableLayout,
      striped: true,
      hover: false,
    },
    paginationRangeEnabled: false,
    paginationEnabled: false,
  };
  addDeductionColumns: Columns[] = [
    { key: "open", title: "Open" },
    { key: "deduction", title: "Deduction *" },
    { key: "netCharge", title: "Net Charge" },
    { key: "desciption", title: "Description *" },
    { key: "comments", title: "Comments *" },
    { key: "applyButton", title: "" },
  ];
  viewDeductionColumns: Columns[] = [
    { key: "openAmount", title: "Open" },
    { key: "deductionAmount", title: "Deduction" },
    { key: "netChargeAmount", title: "Net Charge" },
    { key: "deductionDescription", title: "Description" },
    { key: "comments", title: "Comments" },
    { key: "action", title: "" },
  ];

  // Receivable-Level Values
  public receivableTotalDiscounted: number = 0;
  public receivableNetAmount: number = 0;

  // Constants
  readonly descriptionList = [
    { label: "Advertising", value: "AD" },
    { label: "Cash discount terms", value: "DU" },
    { label: "Coupon mailed", value: "NC" },
    { label: "Defective Product", value: "QU" },
    { label: "Freight", value: "FT" },
    { label: "Fuel surcharge", value: "FL" },
    { label: "Miscellaneous", value: "MS" },
    { label: "Price Error", value: "PR" },
    { label: "Restock Charge", value: "RS" },
    { label: "Samples", value: "SP" },
    { label: "Tax", value: "TX" },
    { label: "Wrong Product Shipped", value: "AM" },
  ];

  constructor(private modalService: BsModalService, private fb: FormBuilder,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.addDeductionForm = 
    this.editDeductionForm = this.fb.group({
    openAmount: [0],
    deductionAmount: [
      0,
      [
        Validators.required,
        Validators.min(0.01),
        Validators.pattern(/^\d+(\.\d{1,2})?$/),
      ],
    ],
    deductionDescription: [null, [Validators.required]],
    comments: [
      "",
      [
        Validators.required,
        // Validators.maxLength(10)
      ],
    ],
    index: [0],
    netChargeAmount: [0],
  });
    // Add Deduction Form Validation
    this.addDeductionForm.statusChanges.subscribe((status: any) => {
      switch (status) {
        case "VALID":
          this.isApplyButtonDisabled = false;
          break;

        default:
          this.isApplyButtonDisabled = true;
          break;
      }
    });

    // Edit Deduction Form Validation
    this.editDeductionForm.statusChanges.subscribe((status: any) => {
      switch (status) {
        case "VALID":
          this.isEditApplyButtonDisabled = false;
          break;

        default:
          this.isEditApplyButtonDisabled = true;
          break;
      }
    });

    // Compute Initial Receivable-Level Values
    this.computeReceivableValues();
  }

  /**
   * Saves the contents of the Add Deduction Form as a new deduction.
   *
   * @return {void}
   */
  addDeduction() {
    // Push the new deduction to the deductionEntries array
    if (this.receivableData.deductionEntries) {
      this.receivableData.deductionEntries.push({
        ...this.addDeductionForm.value,
        openAmount: this.addDeductionData.openAmount,
        netChargeAmount:
          this.addDeductionData.openAmount -
          this.addDeductionForm.value.deductionAmount,
      });
    } else {
      this.receivableData.deductionEntries = [
        {
          ...this.addDeductionForm.value,
          openAmount: this.addDeductionData.openAmount,
          netChargeAmount:
            this.addDeductionData.openAmount -
            this.addDeductionForm.value.deductionAmount,
        },
      ];
    }

    // Compute the receivable-level values after the new deduction is added
    this.computeReceivableValues();

    // Hide and Reset the Add Deduction Form
    this.showAddDeduction = false;
    if (this.receivableNetAmount > 0) {
      this.isAddNewDeductionDisabled = false;
    } else {
      this.isAddNewDeductionDisabled = true;
    }
    this.addDeductionForm.reset();

    // Reset the Add Deduction Form Data
    this.addDeductionData = {
      openAmount:
        parseFloat(this.receivableData.openAmount) -
        this.receivableTotalDiscounted,
      deductionAmount: 0,
      netChargeAmount: 0,
      deductionDescription: "",
      comments: "",
      index: 0,
    };

    // Update the Receivable Scheduled Amount
    this.receivableData.scheduledAmount =
      this.receivableData.openAmount - this.receivableTotalDiscounted;
    this.receivableData.discountAmount = this.receivableTotalDiscounted;
    // Emit the updated receivable data
    this.output.emit(this.receivableData);
  }

  /**
   * Sets the edit index to edit the specified deduction.
   *
   * @param {number} index - The index of the deduction entry to edit.
   */
  setEditIndex(index: number) {
    this.editDeductionForm.patchValue({
      deductionAmount: parseFloat(
        this.receivableData.deductionEntries[index].deductionAmount
      ),
      deductionDescription:
        this.receivableData.deductionEntries[index].deductionDescription,
      comments: this.receivableData.deductionEntries[index].comments,
      netChargeAmount:
        this.receivableData.deductionEntries[index].openAmount -
        this.editDeductionForm.value.deductionAmount,
    });
    // Sets the new maximum deduction amount of the deduction being edited
    this.editDeductionForm.controls["deductionAmount"].addValidators([
      Validators.max(
        parseFloat(
          (
            parseFloat(
              this.receivableData.deductionEntries[index].deductionAmount
            ) +
            this.receivableNetAmount -
            0.01
          ).toFixed(2)
        )
      ),
    ]);
    this.editIndex = index;
  }

  /**
   * Saves the edited data at the specified index.
   *
   * @param {number} index - The index of the data to be edited.
   * @return {void} No return value.
   */
  editDeduction(index: number) {
    // Update the deduction at the specified index
    this.receivableData.deductionEntries[index] = {
      ...this.editDeductionForm.value,
      openAmount: this.receivableData.deductionEntries[index].openAmount,
      netChargeAmount:
        this.receivableData.deductionEntries[index].openAmount -
        this.editDeductionForm.value.deductionAmount,
    };

    // Compute the receivable-level values after the deduction is edited
    this.computeReceivableValues();

    // Update the following deductions
    this.updateDeductions(index);

    // Hide and Reset the Edit Deduction Form
    this.editIndex = undefined;
    this.isEditApplyButtonDisabled = true;
    this.editDeductionForm.reset();

    // Update the Receivable Scheduled Amount
    this.receivableData.scheduledAmount =
      this.receivableData.openAmount - this.receivableTotalDiscounted;

    this.receivableData.discountAmount = this.receivableTotalDiscounted;

    // Emit the updated receivable data
    this.output.emit(this.receivableData);
  }

  /**
   * Computes the net charge amount based on the provided input.
   *
   * @param {any} value - The input value.
   * @param {number} openAmount - The open amount used for calculation.
   * @param {boolean} edit - A bbolean flag to indicate whether the deduction being updated is in editing or new.
   * @return {void}
   */
  updateNetCharge(
    { target: { value } }: any,
    openAmount: number,
    edit: boolean
  ) {
    let deductionAmount = parseFloat(parseFloat(value).toFixed(2));
    if (Number.isNaN(deductionAmount)) {
      if (edit) {
        this.editDeductionForm.patchValue({
          netChargeAmount: this.receivableNetAmount,
        });
      } else {
        this.addDeductionData.netChargeAmount = this.receivableNetAmount;
      }
    } else {
      if (edit) {
        this.editDeductionForm.patchValue({
          netChargeAmount: this.computeNetCharge(openAmount, deductionAmount),
        });
      } else {
        this.addDeductionData.netChargeAmount = this.computeNetCharge(
          openAmount,
          deductionAmount
        );
      }
    }
  }

  /**
   * Calculates the net charge by subtracting the deduction amount from the open amount.
   *
   * @param {number} openAmount - The open amount.
   * @param {number} deductionAmount - The deduction amount.
   * @return {number} The net charge.
   */
  computeNetCharge(openAmount: number, deductionAmount: number) {
    return (openAmount || 0) - deductionAmount;
  }

  /**
   * Computes the receivable-level values based on the new deductions data.
   *
   * @return {void} This function does not return anything.
   */
  computeReceivableValues() {
    // Computes the total discounted amount, and shows the add deduction form if there are no deductions
    if (this.receivableData?.deductionEntries?.length > 0) {
      if (this.receivableData.deductionEntries.length > 1) {
        this.receivableTotalDiscounted =
          this.receivableData.deductionEntries.reduce(function (
            accumulator: any,
            item: any
          ) {
            return (accumulator || 0) + item.deductionAmount;
          },
          0) || 0;
      } else {
        this.receivableTotalDiscounted =
          this.receivableData.deductionEntries[0].deductionAmount;
      }
    } else {
      this.receivableTotalDiscounted = 0;
      this.showAddDeduction = true;
    }

    // Updates the receivable net amount
    this.receivableNetAmount = parseFloat(
      (this.receivableData.openAmount - this.receivableTotalDiscounted).toFixed(
        2
      )
    );

    // Sets the maximum amount for the next deduction to the new open amount
    this.addDeductionForm.controls["deductionAmount"].addValidators([
      Validators.max(this.receivableNetAmount),
    ]);

    // Updates the add deduction form
    this.addDeductionData.openAmount = this.receivableNetAmount;
    this.addDeductionForm.patchValue({ openAmount: this.receivableNetAmount });

    // Updates the receivable scheduled amount
    this.receivableData.scheduledAmount = this.receivableNetAmount;
    this.receivableData.discountAmount = this.receivableTotalDiscounted;
  }

  /**
   * Updates all consecutive deductions after a deduction entry is updated.
   *
   * @param {number} index - The index of the deduction entry to update.
   */
  updateDeductions(index: number) {
    this.receivableData.deductionEntries =
      this.receivableData.deductionEntries.map((deduction: any, i: number) => {
        if (i < index) {
          return deduction;
        } else {
          return {
            ...deduction,
            openAmount:
              this.receivableData.deductionEntries[i - 1]?.netChargeAmount ||
              this.receivableData?.openAmount,
            netChargeAmount: this.computeNetCharge(
              this.receivableData.deductionEntries[i - 1]?.netChargeAmount ||
                this.receivableData?.openAmount,
              deduction.deductionAmount
            ),
          };
        }
      });
  }

  /**
   * Deletes a deduction entry based on index.
   *
   * @param {number} deductionIndex - The index of the deduction entry to delete.
   * @return {void} This function does not return anything.
   */
  deleteDeduction(index: number) {
    this.receivableData.deductionEntries.splice(index, 1);
    this.computeReceivableValues();
    this.updateDeductions(index);
    this.output.emit(this.receivableData);
  }

  /**
   * Retrieves the expanded label for a given description value.
   *
   * @param {string} value - The value to search for in the description list.
   * @return {string} The expanded description if found, otherwise an empty string.
   */
  expandDescription(value: string, reverse?: boolean) {
    if (reverse) {
      return (
        this.descriptionList.find((description) => description.label === value)
          ?.value || ""
      );
    } else {
      return (
        this.descriptionList.find((description) => description.value === value)
          ?.label || ""
      );
    }
  }

  /**
   * Closes the modal.
   *
   * @param {type} - No parameters.
   * @return {type} - No return value.
   */
  closeModal() {
    this.modalService.hide(this.modalService.config.id);
  }
  avoidSpaces(e: any) {
    //avoiding first space and double space
    let value: any = e?.target?.value; // e?.key;
    // return /^[a-z,A-Z, ,0-9]$/i.test(e.key);
    // return value.split(" ").length < 3 && value !== " ";
    return !(value.charAt(value.length - 1) == " " && e.key == " ");
  }

  deductionAmountKey(e: any) {
    let returnVal = true;
    if (e.key == "e") {
      returnVal = false;
    }
    return returnVal;
  }
  alertData: any = {
    message: "Schedule amount should be greater than 0.",
  };
  alertType: any = "danger";
  showAlert: any = false


  checkDeductionAmount(event: any, openAmount: number) {
  const deductionAmount = parseFloat(event.target.value);
  
  if (deductionAmount >= parseFloat(openAmount.toFixed(2))) {
    this.showAlert = true;
    this.isApplyButtonDisabled = true;
    this.isEditApplyButtonDisabled = true;
    this.stopAlert(); 
  } 
  this.cdr.detectChanges(); 
}

  stopAlert() {
    setTimeout(() => {
      this.showAlert = false;
    }, 4000);
  }

  
  handlePaste(event: ClipboardEvent) {
    if (event.clipboardData) {
      const pastedData = event.clipboardData.getData("text"); 
      if (pastedData.length > 50) {
        event.preventDefault();
        return;
      }
    }
  }
}
