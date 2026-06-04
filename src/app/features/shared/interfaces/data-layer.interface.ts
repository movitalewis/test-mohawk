/**
 *  @file Mohawk Xchange Data Layer Interface - Specifies the structure of all events in the Mohawk Xchange Google Analytics 4 Data Layer.
 *  @author Nate Wolfe <nate_wolfe@mohawkind.com>
 *  @see {@link https://mohawkind.atlassian.net/wiki/x/XYDFFQE}
 *  @version 0.1.0
 */

/**
 * Mohawk Xchange Events
 * @namespace
 * @see {@link https://mohawkind.atlassian.net/wiki/x/XYDFFQE}
 */
export namespace Xchange {
  /**
   * Data Layer Types
   * @description Type definitions shared between various events.
   */

  // Exports for all Data Layer Events
  export type DataLayerEvent =
    | Add_To_Cart
    | Begin_Checkout
    | Cta_Click
    | Download
    | Form_Started
    | Form_Submission
    | Login
    | Page_View
    | Purchase
    | Remove_From_Cart
    | Search
    | Sign_Up
    | View_Cart
    | View_Item
    | View_Item_List;

  // Generic Event Type Definition
  export type Event = {
    event: string;
    [propName: string]: any;
  };

  /**
   * Item Object
   * @type
   * @see {@link https://mohawkind.atlassian.net/wiki/x/D4DfGgE}
   */
  export type Item = {
    item_id: string;
    item_name: string;
    index: number;
    item_brand: string;
    item_category: string;
    item_category2: string;
    item_category3: string;
    item_category4: string;
    item_list_id: string;
    item_list_name: string;
    item_variant: string;
    price: number;
    quantity: number;
    uom: string;
    selected_uom?: string;
  };

  /**
   * Data Layer Events
   * @description Interface definitions for all events in the data Layer.
   */

  /**
   * Add To Cart Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/HYBrHAE}
   */
  export interface Add_To_Cart extends Event {
    event: "add_to_cart";
    ecommerce: {
      currency: string;
      items: Array<Item>;
    };
  }

  /**
   * Begin Checkout Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/HoByHAE}
   */
  export interface Begin_Checkout extends Event {
    event: "begin_checkout";
    ecommerce: {
      currency: string;
      value: number;
      items: Array<Item>;
    };
  }

  /**
   * CTA Click Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/FYBuHAE}
   */
  export interface Cta_Click extends Event {
    event: "cta_click";
    click_text: string;
    click_url: string;
    cta_type: string;
  }

  /**
   * Download Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/RIByHAE}
   */
  export interface Download extends Event {
    event: "download";
    file_name: string;
    file_extension: string;
    link_text: string;
    link_url: string;
    content_type: string;
    item?: Array<Item>;
  }

  /**
   * Form Started Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/GIB1HAE}
   */
  export interface Form_Started extends Event {
    event: "form_started";
    form_name: string;
  }

  /**
   * Form Submission Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/kQFtFgE}
   */
  export interface Form_Submission extends Event {
    event: "form_submission";
    form_name: string;
  }

  /**
   * Login Event
   * @interface
   * @ignore - This event is not yet in use.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/R4BuHAE}
   */
  export interface Login extends Event {
    event: "login";
    user_id: string;
    page_type: string;
    user_type: string;
    email: string;
  }

  /**
   * Page View Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/AYDkGgE}
   */
  export interface Page_View extends Event {
    event: "page_view";
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

  /**
   * Purchase Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/bwBwHAE}
   */
  export interface Purchase extends Event {
    event: "purchase";
    ecommerce: {
      transaction_id: string;
      value: number;
      tax: number;
      shipping: number;
      currency: string;
      items: Array<Item>;
    };
  }

  /**
   * Remove From Cart Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/QgB8HAE}
   */
  export interface Remove_From_Cart extends Event {
    event: "remove_from_cart";
    ecommerce: {
      currency: string;
      items: Array<Item>;
    };
  }

  /**
   * Search Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/BQCQHAE}
   */
  export interface Search extends Event {
    event: "search";
    search_term: string;
    corrected_search_term: string;
    advanced?: {
      style_code?: string;
      style_name?: string;
      color_code?: string;
      color_name?: string;
      backing_number?: string;
      part_number?: string;
    };
  }

  /**
   * Sign Up Event
   * @interface
   * @ignore - This event is not yet in use.
   * @see {@link https://mohawkind.atlassian.net/wiki/x/AoCWHAE}
   */
  export interface Sign_Up extends Event {
    event: "sign_up";
    user_id: string;
    page_type: string;
    user_type: string;
    email: string;
  }

  /**
   * View Cart Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/DgCTHAE}
   */
  export interface View_Cart extends Event {
    event: "view_cart";
    ecommerce: {
      currency: string;
      value?: number;
      items: Array<Item>;
    };
  }

  /**
   * View Item Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/AwCcHAE}
   */
  export interface View_Item extends Event {
    event: "view_item";
    ecommerce: {
      currency: string;
      items: Array<Item>;
    };
  }

  /**
   * View Item List Event
   * @interface
   * @see {@link https://mohawkind.atlassian.net/wiki/x/LQCbHAE}
   */
  export interface View_Item_List extends Event {
    event: "view_item_list";
    ecommerce: {
      item_list_id: string;
      item_list_name: string;
      items: Array<Item>;
    };
  }
}
