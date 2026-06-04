/**
 *  @file Data Layer Service - Creates and Populates the Google Analytics 4 Data Layer.
 *  @author Nate Wolfe <nate_wolfe@mohawkind.com>
 *  @see {@link https://mohawkind.atlassian.net/wiki/x/XYDFFQE}
 *  @version 0.1.0
 */

// Angular Imports
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";

// Residential B2C Imports
import { WINDOW } from "../shared/utilities/window";
import { Xchange } from "../shared/interfaces/data-layer.interface";

// Development Imports
// import { Xchange } from "./data-layer.interface";

/**
 * Xchange Data Layer Service
 * @class
 */
@Injectable({
  providedIn: "root",
})
export class XchangeDataLayerService {
  /**
   * Data Layer Helpers
   * @description Variables and functions which don't correspond to specific events, but are useful across multiple events.
   */

  /**
   * Enable / Disable Debugging Mode to log events as they fire.
   * @private
   */
  protected debug: boolean = true;

  /**
   * The user's cart, as last seen.
   * @protected
   */
  protected cart:
    | {
        currency?: string;
        value?: number;
        items?: Array<Xchange.Item>;
      }
    | undefined;

  /**
   * The user's data, as last seen.
   * @protected
   */
  protected user:
    | {
        page_type: string;
        user: {
          user_id: string;
          email: string;
          user_type: string;
        };
        account: {
          account_id: string;
          account_type: string;
        };
      }
    | undefined;

  constructor(
    @Inject(WINDOW) readonly windowRef: Window & { dataLayer?: any[] },
    protected router: Router
  ) {}

  /**
   * Clears the ecommerce object.
   */
  protected clearEcommerce(): void {
    this.windowRef["dataLayer"] = this.windowRef["dataLayer"] || [];
    this.windowRef["dataLayer"].push({ ecommerce: null });
    if (this.debug) {
      console.log("Data Layer | Cleared ecommerce Object");
    }
  }

  /**
   * Pushes a valid event to the data layer.
   * @param event - A valid event to push to the data layer.
   */
  protected pushToDataLayer(event: any): void {
    if (this.windowRef["self"] !== this.windowRef["top"]) {
      if (this.debug) {
        console.log("Data Layer | iFrame Event Pushed: ", event);
      }
    } else {
      this.windowRef["dataLayer"] = this.windowRef["dataLayer"] || [];
      this.windowRef["dataLayer"].push(event);
      if (this.debug) {
        console.log("Data Layer | Event Pushed: ", event);
      }
    }
  }

  /**
   * Data Layer Events
   * @description Functions which push specific events to the Data Layer.
   */

  /**
   * Add To Cart Event
   * @event
   * @param {string} currency - The currency code associated with the payment info added.
   * @param {Array<Xchange.Item>} items - An array of the items included in the order, with Item Object entries.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/HYBrHAE}
   */
  public addToCart(currency: string, items: Array<Xchange.Item>): void {
    const event: Xchange.Add_To_Cart = {
      event: "add_to_cart",
      ecommerce: {
        currency,
        items,
      },
    };
    this.clearEcommerce();
    this.pushToDataLayer(event);
  }

  /**
   * Begin Checkout Event
   * @event
   * @param {number} value - The value of the order being placed.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/HoByHAE}
   */
  public beginCheckout(value: number): void {
    this.cart = {
      ...this.cart,
      value,
    };
    const event: Xchange.Begin_Checkout = {
      event: "begin_checkout",
      ecommerce: {
        currency: this.cart?.currency || "",
        value: value || 0,
        items: this.cart?.items || [],
      },
    };
    this.clearEcommerce();
    this.pushToDataLayer(event);
  }

  /**
   * CTA Click Event
   * @event
   * @param {string} click_text - Text of the CTA being clicked.
   * @param {string} click_url - URL associated with the CTA being clicked.
   * @param {string} cta_type - The type of CTA (determined by placement - “Navigation”, “Button”, or “Link”).
   * @see {@link https://mohawkind.atlassian.net/wiki/x/FYBuHAE}
   */
  public ctaClick(
    click_text: string,
    click_url: string,
    cta_type: string
  ): void {
    if (
      click_url.indexOf("scene7") !== -1 ||
      click_url.indexOf("mohawk.blob.core.windows.net") !== -1 ||
      click_url.indexOf(".pdf") !== -1
    ) {
      const file_name = click_url.substring(click_url.lastIndexOf("/") + 1);
      this.download(
        file_name,
        file_name.indexOf(".") === -1
          ? "pdf"
          : file_name.substring(file_name.lastIndexOf(".") + 1),
        click_text,
        click_url,
        "application/pdf"
      );
    } else {
      const event: Xchange.Cta_Click = {
        event: "cta_click",
        click_text,
        click_url,
        cta_type,
      };
      this.pushToDataLayer(event);
    }
  }

  /**
   * Download Event
   * @event
   * @param {string} file_name - Name of the file being downloaded.
   * @param {string} file_extension - The extension / file type of the file being downloaded.
   * @param {string} link_text - The text of the link clicked to download the file.
   * @param {string} link_url - The URL of the file being downloaded.
   * @param {string} content_type - The type of content being downloaded.
   * @param {Array<Xchange.Item>} item - An array of associated item data, in Item Object format. Optional.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/RIByHAE}
   */
  public download(
    file_name: string,
    file_extension: string,
    link_text: string,
    link_url: string,
    content_type: string,
    item?: Array<Xchange.Item>
  ): void {
    const event: Xchange.Download = {
      event: "download",
      file_name,
      file_extension,
      link_text,
      link_url,
      content_type,
      item,
    };
    this.pushToDataLayer(event);
  }

  /**
   * Form Started Event
   * @event
   * @param {string} form_name - Name of the form being started.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/X4ByHAE}
   */
  public formStarted(form_name: string): void {
    const event: Xchange.Form_Started = {
      event: "form_started",
      form_name,
    };
    this.pushToDataLayer(event);
  }

  /**
   * Form Submission Event
   * @event
   * @param {string} form_name - Name of the form being submitted.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/GIB1HAE}
   */
  public formSubmission(form_name: string): void {
    const event: Xchange.Form_Submission = {
      event: "form_submission",
      form_name,
    };
    this.pushToDataLayer(event);
  }

  /**
   * Login Event
   * @event
   * @ignore - This event is not yet in use.
   * @param {string} user_id - The id of the user logged in.
   * @param {string} page_type - The type of page the user lands on after login.
   * @param {string} user_type - Type of user (“Employee” or “Customer”).
   * @param {string} email - Email associated with the user.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/R4BuHAE}
   */
  public login(
    user_id: string,
    page_type: string,
    user_type: string,
    email: string
  ): void {
    const event: Xchange.Login = {
      event: "login",
      user_id,
      page_type,
      user_type,
      email,
    };
    this.pushToDataLayer(event);
  }

  /**
   * Page View Event
   * @event
   * @param {string} page_type - The type of page.
   * @param {string} user.user_id - The id of the user on login. Leave blank for now (Checking hashing possibilities).
   * @param {string} user.email - Email associated with the user.
   * @param {string} user.user_type - A pipe-delimited list of user roles.
   * @param {string} account.account_id - The id of the account. (uid / customerNumber).
   * @param {string} account.account_type - Type of account (accountType in orgUnit).
   * @see {@link https://mohawkind.atlassian.net/wiki/x/AYDkGgE}
   */
  public pageView(
    page_type: string,
    user: {
      user_id: string;
      email: string;
      user_type: string;
    },
    account: {
      account_id: string;
      account_type: string;
    }
  ): void {
    const event: Xchange.Page_View = {
      event: "page_view",
      page_type,
      user,
      account,
    };
    this.pushToDataLayer(event);
  }

  /**
   * Purchase Event
   * @event
   * @param {string} transaction_id - The ID of the confirmed transaction.
   * @param {number} tax - The amount of tax on the order placed.
   * @param {number} shipping - The amount paid for shipping. Include any Misc. Charges as well.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/bwBwHAE}
   */
  public purchase(transaction_id: string, tax: number, shipping: number): void {
    const event: Xchange.Purchase = {
      event: "purchase",
      ecommerce: {
        transaction_id,
        value: this.cart?.value || 0,
        tax,
        shipping,
        currency: this.cart?.currency || "",
        items: this.cart?.items || [],
      },
    };
    this.clearEcommerce();
    this.pushToDataLayer(event);
  }

  /**
   * Remove From Cart Event
   * @event
   * @param {string} currency - The currency code associated with the user’s cart.
   * @param {Array<Xchange.Item>} items - An array of the items removed from the cart, with Item Object entries.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/QgB8HAE}
   */
  public removeFromCart(currency: string, items: Array<Xchange.Item>): void {
    const event: Xchange.Remove_From_Cart = {
      event: "remove_from_cart",
      ecommerce: {
        currency,
        items,
      },
    };
    this.clearEcommerce();
    this.pushToDataLayer(event);
  }

  /**
   * Search Event
   * @event
   * @param {string} search_term - The search term after correction / suggestion.
   * @param {string} corrected_search_term - The search term as typed by the user before correction / suggestion.
   * @param {string} advanced.style_code - The style code input into Advanced Search. Optional.
   * @param {string} advanced.style_name - The style name input into Advanced Search. Optional.
   * @param {string} advanced.color_code - The color code input into Advanced Search. Optional.
   * @param {string} advanced.color_name - The color name input into Advanced Search. Optional.
   * @param {string} advanced.backing_number - The backing number input into Advanced Search. Optional.
   * @param {string} advanced.part_number - The part number input into Advanced Search. Optional.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/BQCQHAE}
   */
  public search(
    search_term: string,
    corrected_search_term: string,
    advanced?: {
      style_code?: string;
      style_name?: string;
      color_code?: string;
      color_name?: string;
      backing_number?: string;
      part_number?: string;
    }
  ): void {
    const event: Xchange.Search = {
      event: "search",
      search_term,
      corrected_search_term,
      advanced,
    };
    this.pushToDataLayer(event);
  }

  /**
   * Sign Up Event
   * @event
   * @ignore - This event is not yet in use.
   * @param {string} user_id - The id of the user on login.
   * @param {string} page_type - The type of page the user lands on after submission.
   * @param {string} user_type - Type of user (“Employee” or “Customer”).
   * @param {string} email - Email associated with the user.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/AoCWHAE}
   */
  public signUp(
    user_id: string,
    page_type: string,
    user_type: string,
    email: string
  ): void {
    const event: Xchange.Sign_Up = {
      event: "sign_up",
      user_id,
      page_type,
      user_type,
      email,
    };
    this.pushToDataLayer(event);
  }

  /**
   * View Cart Event
   * @event
   * @param {string} currency - The currency code associated with the cart.
   * @param {Array<Xchange.Item>} items - An array of items in the cart, with Item Object entries.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/DgCTHAE}
   */
  public viewCart(currency: string, items: Array<Xchange.Item>): void {
    const event: Xchange.View_Cart = {
      event: "view_cart",
      ecommerce: {
        currency,
        value: undefined,
        items,
      },
    };
    this.cart = {
      currency,
      value: undefined,
      items,
    };
    this.clearEcommerce();
    this.pushToDataLayer(event);
  }

  /**
   * View Item Event
   * @event
   * @param {string} currency - The relevant currency code.
   * @param {Array<Xchange.Item>} items - An array of associated item data, with entries in Item Object form.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/AwCcHAE}
   */
  public viewItem(
    currency: string,
    value: number,
    items: Array<Xchange.Item>
  ): void {
    const event: Xchange.View_Item = {
      event: "view_item",
      ecommerce: {
        currency,
        items,
      },
    };
    this.clearEcommerce();
    this.pushToDataLayer(event);
  }

  /**
   * View Item List Event
   * @event
   * @param {string} item_list_id - URL segment corresponding to the list shown.
   * @param {string} item_list_name - Name of the list shown.
   * @param {Array<Xchange.Item>} items - An array of associated item data, with Item Object entries.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/LQCbHAE}
   */
  public viewItemList(
    item_list_id: string,
    item_list_name: string,
    items: Array<Xchange.Item>
  ): void {
    const event: Xchange.View_Item_List = {
      event: "view_item_list",
      ecommerce: {
        item_list_id,
        item_list_name,
        items,
      },
    };
    this.clearEcommerce();
    this.pushToDataLayer(event);
  }
}
