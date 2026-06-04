export const residentialMenuIsCSR = [
  {
    name: "Products",
    path: "",
    iconClass: "products-icon",
    subNav: [
      {
        name: "Soft Surface",
        path: "",
        imgUrl:
          "https://mohawk.scene7.com/is/image/MohawkResidential/RMC992T62?wid=400&hei=400&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",
        subNav: [
          {
            name: "Residential Broadloom",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Soft Surface&page=Residential Broadloom&type=RESIDENTIAL_BROADLOOM",
            path: "residential/products?name=Soft Surface&page=Residential Broadloom&type=RESIDENTIAL_BROADLOOM",
          },
          {
            name: "Commercial Broadloom",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Soft Surface&page=Commercial Broadloom&type=COMMERCIAL_BROADLOOM",
            path: "residential/products?name=Soft Surface&page=Commercial Broadloom&type=COMMERCIAL_BROADLOOM",
          },
          {
            name: "Carpet Tile",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Soft Surface&page=Soft Surface Tile&type=CARPET_TILE",
            path: "residential/products?name=Soft Surface&page=Soft Surface Tile&type=CARPET_TILE",
          },
          {
            name: "Pad & Cushion",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Soft Surface&page=" +
              encodeURIComponent("Pad & Cushion") +
              "&type=PAD_CUSHION",
            path:
              "residential/products?name=Soft Surface&page=" +
              encodeURIComponent("Pad & Cushion") +
              "&type=PAD_CUSHION",
          },
          {
            name: "Adhesives",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Soft Surface&page=Adhesives&type=ADHESIVES",
            path: "residential/products?name=Soft Surface&page=Adhesives&type=ADHESIVES",
          },
          {
            name: "View All",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Soft Surface&page=View All &type=SOFTSURFACE",
            path: "residential/products?name=Soft Surface&page=View All &type=SOFTSURFACE",
          },
        ],
      },
      /*    {
        name: "Cushion",
        path: "",
        subNav: [
          {
            name: "Rebond",
            path: "residential/products?name=Cushion&page=Rebond&type=cushionproduct_rebond",
          },
          {
            name: "Memory Foam",
            path: "residential/products?name=Cushion&page=Memory Foam&type=cushionproduct_memory_foam",
          },
          {
            name: "Synthetic",
            path: "residential/products?name=Cushion&page=Synthetic&type=cushionproduct_synthetic",
          },
          {
            name: "Rug Assist",
            path: "residential/products?name=Cushion&page=Rug Assist&type=cushionproduct_rug_assist",
          },
          {
            name: "View All Cushion",
            path: "residential/products?name=Cushion&page=View All Cushion&type=cushionproduct",
          },
        ],
      },*/
      {
        name: "Hard Surface",
        path: "",
        imgUrl:
          "https://mohawk.scene7.com/is/image/MohawkResidential/RMHWSC65_62?wid=600&hei=600&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",

        subNav: [
          {
            name: "Resilient Vinyl",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Hard Surface&page=Resilient Vinyl&type=RESILIENT_VINYL",
            path: "residential/products?name=Hard Surface&page=Resilient Vinyl&type=RESILIENT_VINYL",
          },
          {
            name: "Wood & Laminate",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Hard Surface&page=" +
              encodeURIComponent("Wood & Laminate") +
              "&type=WOOD_LAMINATE",
            path:
              "residential/products?name=Hard Surface&page=" +
              encodeURIComponent("Wood & Laminate") +
              "&type=WOOD_LAMINATE",
          },
          {
            name: "Underlayment",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Hard Surface&page=Underlayment&type=UNDERLAYMENT",
            path: "residential/products?name=Hard Surface&page=Underlayment&type=UNDERLAYMENT",
          },
          {
            name: "Adhesives",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Hard Surface&page=Adhesives&type=ADHESIVES",
            path: "residential/products?name=Hard Surface&page=Adhesives&type=ADHESIVES",
          },
          {
            name: "Care & Maintenance",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Hard Surface&page=" +
              encodeURIComponent("Care & Maintenance") +
              "&type=CARE_MAINTENANCE",
            path:
              "residential/products?name=Hard Surface&page=" +
              encodeURIComponent("Care & Maintenance") +
              "&type=CARE_MAINTENANCE",
          },
          {
            name: "View All Hard Surface",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE",
            path: "residential/products?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE",
          },
        ],
      },
      {
        name: "Tile",
        path: "",
        imgUrl:
          "https://mohawk.scene7.com/is/image/MohawkResidential/T838_DV01_00?wid=600&hei=600&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",

        subNav: [
          {
            name: "Ceramic",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Tile&page=Ceramic&type=CERAMIC",
            path: "residential/products?name=Tile&page=Ceramic&type=CERAMIC",
          },
          {
            name: "Mosaics",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Tile&page=Mosaics&type=MOSAICS",
            path: "residential/products?name=Tile&page=Mosaics&type=MOSAICS",
          },
          {
            name: "Porcelain",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Tile&page=Porcelain&type=PORCELAIN",
            path: "residential/products?name=Tile&page=Porcelain&type=PORCELAIN",
          },
          {
            name: "Trim and Accents",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Tile&page=and Accents&type=TRIM_ACCENTS",
            path: "residential/products?name=Tile&page=Trim and Accents&type=TRIM_ACCENTS",
          },
          {
            name: "Natural Stone",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Tile&page=Natural Stone&type=NATURAL_STONE",
            path: "residential/products?name=Tile&page=Natural Stone&type=NATURAL_STONE",
          },
          {
            name: "Decorative Accessories",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Tile&page=Decorative Accessories&type=DECORATIVE_ACCESSORIES",
            path: "residential/products?name=Tile&page=Decorative Accessories&type=DECORATIVE_ACCESSORIES",
          },
          /* {
            name: "Mosaics",
            path: "residential/products?name=Tile&page=Mosaics&type=tile_mosaics",
          },*/
          {
            name: "View All Tile",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Tile&page=View All Tile&type=TILE",
            path: "residential/products?name=Tile&page=View All Tile&type=TILE",
          },
        ],
      },
      /* {
        name: "Resilient/Vinyl",
        path: "",
        subNav: [
          {
            name: "Luxury Vinyl Tile & Plank",
            path: "residential/products?name=Resilient/Vinyl&page=Luxury Vinyl Tile & Plank&type=resilient_vinyl_solidtech",
          },
          {
            name: "Vinyl - Sheet",
            path: "residential/products?name=Resilient/Vinyl&page=Vinyl - Sheet&type=resilient_vinyl_pergo_extreme",
          },
          {
            name: "Trim and Moldings",
            path: "residential/products?name=Resilient/Vinyl&page=Trim and Moldings&type=resilient_vinyl_trim_and_moldings",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Resilient/Vinyl&page=Adhesives&type=resilient_vinyl_adhesives",
          },
          {
            name: "Care & Maintenance",
            path: "residential/products?name=Resilient/Vinyl&page=Care & Maintenance&type=resilient_vinyl_care_and_maintenance",
          },
          {
            name: "Underlayments",
            path: "residential/products?name=Resilient/Vinyl&page=Underlayments&type=resilient_vinyl_underlaymen",
          },
          {
            name: "View All Resilient/Vinyl",
            path: "residential/products?name=Resilient/Vinyl&page=View All Resilient/Vinyl&type=resilient_vinyl",
          },
        ],
      },*/
      {
        name: "Merchandising",
        path: "",
        imgUrl:
          "https://mohawk.scene7.com/is/image/MohawkResidential/RMVRVL44_20?wid=600&hei=600&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",
        subNav: [
          {
            name: "Display",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Merchandising&page=Display&type=DISPLAY",
            path: "residential/products?name=Merchandising&page=Display&type=DISPLAY",
          },
          {
            name: "Display Updates",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Merchandising&page=Display Updates&type=DISPLAY_UPDATE",
            path: "residential/products?name=Merchandising&page=Display Updates&type=DISPLAY_UPDATE",
          },
          {
            name: "Sales Tools",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Merchandising&page=Sales Tools&type=SALES_TOOLS",
            path: "residential/products?name=Merchandising&page=Sales Tools&type=SALES_TOOLS",
          },
          {
            name: "Graphics and Stickers",
            pathForOrder:
              "residential/products?name=Merchandising&page=Graphics and Stickers&type=GRAPHICS_AND_STICKERS",
            path: "residential/products?name=Merchandising&page=Graphics and Stickers&type=GRAPHICS_AND_STICKERS",
          },
          /*  {
            name: "Racks",
            path: "residential/products?name=Merchandising&page=Racks&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Literature",
            path: "residential/products?name=Merchandising&page=Literature&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Graphics",
            path: "residential/products?name=Merchandising&page=Graphics&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Kits",
            path: "residential/products?name=Merchandising&page=Kits&type=merchandising_sales_tools",
          },
          {
            name: "Stickers & Labels",
            path: "residential/products?name=Merchandising&page=Stickers & Labels&type=merchandising_graphics_and_stickers",
          },*/
          {
            name: "View All Merchandising",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Merchandising&page=View All Merchandising&type=MERCHANDISING",
            path: "residential/products?name=Merchandising&page=View All Merchandising&type=MERCHANDISING",
          },
        ],
      },
      {
        name: "Accessories",
        path: "",
        imgUrl:
          "https://s7d4.scene7.com/is/image/MohawkResidential/spray-bottle-no-logo",
        subNav: [
          {
            name: "Trim and Moldings",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=Trim and Moldings&type=TRIM_AND_MOLDINGS",
            path: "residential/products?name=Accessories&page=Trim and Moldings&type=TRIM_AND_MOLDINGS",
          },
          {
            name: "Tools",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=Tools&type=TOOLS",
            path: "residential/products?name=Accessories&page=Tools&type=TOOLS",
          },
           {
            name: "Powders",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=Powders&type=POWDERS",
            path: "residential/products?name=Accessories&page=Powders&type=POWDERS",
          },
          {
            name: "Wall Base & Stair Solutions",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=AccessoAccessoriesres&page=" +
              encodeURIComponent("Wall Base & Stair Solutions") +
              "&type=WALL_BASE_AND_STAIR_SOLUTIONS",
            path:
              "residential/products?name=Accessories&page=" +
              encodeURIComponent("Wall Base & Stair Solutions") +
              "&type=WALL_BASE_AND_STAIR_SOLUTIONS",
          },
          /*  {
            name: "Adhesives",
            path: "residential/products?name=Installation Accessories&page=Adhesives&type=accessories_adhesives",
          },
          {
            name: "Care & Maintenance",
            path: "residential/products?name=Installation Accessories&page=Care & Maintenance&type=accessories_care_and_maintenance",
          },
          {
            name: "Underlayments",
            path: "residential/products?name=Installation Accessories&page=Underlayments&type=accessories_underlayment",
          },*/
          {
            name: "Installation Kits & Tools",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=" +
              encodeURIComponent("Installation Kits & Tools") +
              "&type=INSTALLATION_KITS_AND_TOOLS",
            path:
              "residential/products?name=Accessories&page=" +
              encodeURIComponent("Installation Kits & Tools") +
              "&type=INSTALLATION_KITS_AND_TOOLS",
          },
          {
            name: "View All Accessories",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=View All Accessories&type=ACCESSORIES",
            path: "residential/products?name=Accessories&page=View All Accessories&type=ACCESSORIES",
          },
        ],
      },
      {
        name: "Sample",
        path: "",
        imgUrl:
          "https://mohawk.scene7.com/is/image/MohawkResidential/RMC992T62?wid=400&hei=400&fit=crop%2c1&fmt=png8-alpha&op_sharpen=1",
        subNav: [
          {
            name: "Default Sample",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Sample&page=Default Sample&type=DEFAULT_SAMPLE",
            path: "residential/products?name=Sample&page=Default Sample&type=DEFAULT_SAMPLE",
          },
          {
            name: "View All Sample",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Sample&page=View All Sample&type=SAMPLE",
            path: "residential/products?name=Sample&page=View All Sample&type=SAMPLE",
          },
        ],
      },
    ],
  },
  {
    name: "Orders",
    path: "",
    iconClass: "orders-icon",
    subNav: [
      {
        name: "Order History",
        path: "residential/orders",
      },
      {
        name: "Reserves",
        path: "residential/orders/reserves",
      },
    ],
  },
  {
    name: "Pricing",
    path: "",
    iconClass: "price-icon",
    subNav: [
      {
        name: "Search & Download Pricing",
        path: " ",
      },
      {
        name: "Download Price Catalog",
        path: " ",
      },
    ],
  },
];
export const residentialMenuIsProductManager = [
  {
    name: "Products",
    path: "",
    iconClass: "products-icon",
    subNav: [
      {
        name: "Soft Surface",
        path: "",
        subNav: [
          {
            name: "Residential Broadloom",
            path: "residential/products?name=Soft Surface&page=Residential Broadloom&type=RESIDENTIAL_BROADLOOM",
          },
          {
            name: "Commercial Broadloom",
            path: "residential/products?name=Soft Surface&page=Commercial Broadloom&type=COMMERCIAL_BROADLOOM",
          },
          {
            name: "Carpet Tile",
            path: "residential/products?name=Soft Surface&page=Soft Surface Tile&type=CARPET_TILE",
          },
          {
            name: "Pad & Cushion",
            path:
              "residential/products?name=Soft Surface&page=" +
              encodeURIComponent("Pad & Cushion") +
              "&type=PAD_CUSHION",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Soft Surface&page=Adhesives&type=ADHESIVES",
          },
          {
            name: "View All Soft Surface",
            path: "residential/products?name=Soft Surface&page=View All Soft Surface&type=SOFTSURFACE",
          },
        ],
      },
      /*    {
        name: "Cushion",
        path: "",
        subNav: [
          {
            name: "Rebond",
            path: "residential/products?name=Cushion&page=Rebond&type=cushionproduct_rebond",
          },
          {
            name: "Memory Foam",
            path: "residential/products?name=Cushion&page=Memory Foam&type=cushionproduct_memory_foam",
          },
          {
            name: "Synthetic",
            path: "residential/products?name=Cushion&page=Synthetic&type=cushionproduct_synthetic",
          },
          {
            name: "Rug Assist",
            path: "residential/products?name=Cushion&page=Rug Assist&type=cushionproduct_rug_assist",
          },
          {
            name: "View All Cushion",
            path: "residential/products?name=Cushion&page=View All Cushion&type=cushionproduct",
          },
        ],
      },*/
      {
        name: "Hard Surface",
        path: "",
        subNav: [
          {
            name: "Resilient Vinyl",
            path: "residential/products?name=Hard Surface&page=Resilient Vinyl&type=RESILIENT_VINYL",
          },
          {
            name: "Wood & Laminate",
            path:
              "residential/products?name=Hard Surface&page=" +
              encodeURIComponent("Wood & Laminate") +
              "&type=WOOD_LAMINATE",
          },
          {
            name: "Underlayment",
            path: "residential/products?name=Hard Surface&page=Underlayment&type=UNDERLAYMENT",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Hard Surface&page=Adhesives&type=ADHESIVES",
          },
          {
            name: "Care & Maintenance",
            path:
              "residential/products?name=Hard Surface&page=" +
              encodeURIComponent("Care & Maintenance") +
              "&type=CARE_MAINTENANCE",
          },
          {
            name: "View All Hard Surface",
            path: "residential/products?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE",
          },
        ],
      },
      {
        name: "Tile",
        path: "",
        subNav: [
          {
            name: "Ceramic",
            path: "residential/products?name=Tile&page=Ceramic&type=CERAMIC",
          },
          {
            name: "Mosaics",
            path: "residential/products?name=Tile&page=Mosaics&type=MOSAICS",
          },
          {
            name: "Porcelain",
            path: "residential/products?name=Tile&page=Porcelain&type=PORCELAIN",
          },
          {
            name: "Trim and Accents",
            path: "residential/products?name=Tile&page=Trim and Accents&type=TRIM_ACCENTS",
          },
          {
            name: "Natural Stone",
            path: "residential/products?name=Tile&page=Natural Stone&type=NATURAL_STONE",
          },
          {
            name: "Decorative Accessories",
            path: "residential/products?name=Tile&page=Decorative Accessories&type=DECORATIVE_ACCESSORIES",
          },
          /* {
            name: "Mosaics",
            path: "residential/products?name=Tile&page=Mosaics&type=tile_mosaics",
          },*/
          {
            name: "View All Tile",
            path: "residential/products?name=Tile&page=View All Tile&type=TILE",
          },
        ],
      },
      /* {
        name: "Resilient/Vinyl",
        path: "",
        subNav: [
          {
            name: "Luxury Vinyl Tile & Plank",
            path: "residential/products?name=Resilient/Vinyl&page=Luxury Vinyl Tile & Plank&type=resilient_vinyl_solidtech",
          },
          {
            name: "Vinyl - Sheet",
            path: "residential/products?name=Resilient/Vinyl&page=Vinyl - Sheet&type=resilient_vinyl_pergo_extreme",
          },
          {
            name: "Trim and Moldings",
            path: "residential/products?name=Resilient/Vinyl&page=Trim and Moldings&type=resilient_vinyl_trim_and_moldings",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Resilient/Vinyl&page=Adhesives&type=resilient_vinyl_adhesives",
          },
          {
            name: "Care & Maintenance",
            path: "residential/products?name=Resilient/Vinyl&page=Care & Maintenance&type=resilient_vinyl_care_and_maintenance",
          },
          {
            name: "Underlayments",
            path: "residential/products?name=Resilient/Vinyl&page=Underlayments&type=resilient_vinyl_underlaymen",
          },
          {
            name: "View All Resilient/Vinyl",
            path: "residential/products?name=Resilient/Vinyl&page=View All Resilient/Vinyl&type=resilient_vinyl",
          },
        ],
      },*/
      {
        name: "Merchandising",
        path: "",
        subNav: [
          {
            name: "Display",
            path: "residential/products?name=Merchandising&page=Display&type=DISPLAY",
          },
          {
            name: "Display Updates",
            path: "residential/products?name=Merchandising&page=Display Updates&type=DISPLAY_UPDATE",
          },
          {
            name: "Sales Tools",
            path: "residential/products?name=Merchandising&page=Sales Tools&type=SALES_TOOLS",
          },
          {
            name: "Graphics and Stickers",
            path: "residential/products?name=Merchandising&page=Graphics and Stickers&type=GRAPHICS_AND_STICKERS",
          },
          /*  {
            name: "Racks",
            path: "residential/products?name=Merchandising&page=Racks&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Literature",
            path: "residential/products?name=Merchandising&page=Literature&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Graphics",
            path: "residential/products?name=Merchandising&page=Graphics&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Kits",
            path: "residential/products?name=Merchandising&page=Kits&type=merchandising_sales_tools",
          },
          {
            name: "Stickers & Labels",
            path: "residential/products?name=Merchandising&page=Stickers & Labels&type=merchandising_graphics_and_stickers",
          },*/
          {
            name: "View All Merchandising",
            path: "residential/products?name=Merchandising&page=View All Merchandising&type=MERCHANDISING",
          },
        ],
      },
      {
        name: "Accessories",
        path: "",
        subNav: [
          {
            name: "Trim and Moldings",
            path:
              "residential/products?name=Accessories&page=" +
              encodeURIComponent("Trim & Moldings") +
              "&type=TRIM_AND_MOLDINGS",
          },
          {
            name: "Tools",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=Tools&type=TOOLS",
            path: "residential/products?name=Accessories&page=Tools&type=TOOLS",
          },
           {
            name: "Powders",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=Powders&type=POWDERS",
            path: "residential/products?name=Accessories&page=Powders&type=POWDERS",
          },
          {
            name: "Wall Base & Stair Solutions",
            path:
              "residential/products?name=Accessories&page=" +
              encodeURIComponent("Wall Base & Stair Solutions") +
              "&type=WALL_BASE_AND_STAIR_SOLUTIONS",
          },
          /*  {
            name: "Adhesives",
            path: "residential/products?name=Installation Accessories&page=Adhesives&type=accessories_adhesives",
          },
          {
            name: "Care & Maintenance",
            path: "residential/products?name=Installation Accessories&page=Care & Maintenance&type=accessories_care_and_maintenance",
          },
          {
            name: "Underlayments",
            path: "residential/products?name=Installation Accessories&page=Underlayments&type=accessories_underlayment",
          },*/
          {
            name: "Installation Kits & Tools",
            path:
              "residential/products?name=Accessories&page=" +
              encodeURIComponent("Installation Kits & Tools") +
              "&type=INSTALLATION_KITS_AND_TOOLS",
          },
          {
            name: "View All Accessories",
            path: "residential/products?name=Accessories&page=View All Accessories&type=ACCESSORIES",
          },
        ],
      },
      {
        name: "Sample",
        path: "",
        subNav: [
          {
            name: "Default Sample",
            path: "residential/products?name=Sample&page=Default Sample&type=DEFAULT_SAMPLE",
          },
          {
            name: "View All Sample",
            path: "residential/products?name=Sample&page=View All Sample&type=SAMPLE",
          },
        ],
      },
    ],
  },
  {
    name: "Orders",
    path: "",
    iconClass: "orders-icon",
    subNav: [
      {
        name: "Order History",
        path: "residential/orders",
      },
      {
        name: "Reserves",
        path: "residential/orders/reserves",
      },
    ],
  },
  {
    name: "Pricing",
    path: "",
    iconClass: "price-icon",
    subNav: [
      {
        name: "Search & Download Pricing",
        path: " ",
      },
      {
        name: "Download Price Catalog",
        path: " ",
      },
    ],
  },
  {
    name: "Finance",
    path: "",
    iconClass: "finance-icon",
    subNav: [
      {
        name: "Account Statements",
        path: "residential/finance/bank/account-statements",
      },
      {
        name: "Bank Accounts",
        path: "residential/finance/bank/accounts-list",
      },
      // {
      //   name: "Earning Statements",
      //   path: "residential/finance/bank/earning-statements",
      // },
      {
        name: "Invoices",
        path: "residential/finance/invoices",
      },
      {
        name: "Make A Payment / Receivables",
        path: "residential/finance/payments/receivables",
      },
      {
        name: "Scheduled Payments",
        path: "residential/finance/payments/online-payment-history",
      },
      {
        name: "Recent Payments",
        path: "residential/finance/payments/recent-payments",
      },
      {
        name: "Change Receiver email",
        path: "residential/finance/payments/receivables/select-users",
      }
    ],
  },
  {
    name: "Claims",
    path: "",
    iconClass: "claims-icon",
    subNav: [
      {
        name: "Create A New Claim",
        path: "residential/claims/createclaim",
      },
      {
        name: "Claims History",
        path: "residential/claims/history",
      },
    ],
  },
  {
    name: "Edit Setup",
    path: "",
    iconClass: "setup-icon",
  },
  {
    name: "Special Goods",
    isExternal: true,
    path: "https://www.mohawknet.com/mnet/login.jsp",
    iconClass: "goods-icon",
  },
];
export const residentialMenuIsSalesOp = [
  {
    name: "Products",
    path: "",
    iconClass: "products-icon",
    subNav: [
      {
        name: "Soft Surface",
        path: "",
        subNav: [
          {
            name: "Residential Broadloom",
            path: "residential/products?name=Soft Surface&page=Residential Broadloom&type=RESIDENTIAL_BROADLOOM",
          },
          {
            name: "Commercial Broadloom",
            path: "residential/products?name=Soft Surface&page=Commercial Broadloom&type=COMMERCIAL_BROADLOOM",
          },
          {
            name: "Carpet Tile",
            path: "residential/products?name=Soft Surface&page=Soft Surface Tile&type=CARPET_TILE",
          },
          {
            name: "Pad & Cushion",
            path:
              "residential/products?name=Soft Surface&page=" +
              encodeURIComponent("Pad & Cushion") +
              "&type=PAD_CUSHION",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Soft Surface&page=Adhesives&type=ADHESIVES",
          },
          {
            name: "View All Soft Surface",
            path: "residential/products?name=Soft Surface&page=View All Soft Surface&type=SOFTSURFACE",
          },
        ],
      },
      /*    {
        name: "Cushion",
        path: "",
        subNav: [
          {
            name: "Rebond",
            path: "residential/products?name=Cushion&page=Rebond&type=cushionproduct_rebond",
          },
          {
            name: "Memory Foam",
            path: "residential/products?name=Cushion&page=Memory Foam&type=cushionproduct_memory_foam",
          },
          {
            name: "Synthetic",
            path: "residential/products?name=Cushion&page=Synthetic&type=cushionproduct_synthetic",
          },
          {
            name: "Rug Assist",
            path: "residential/products?name=Cushion&page=Rug Assist&type=cushionproduct_rug_assist",
          },
          {
            name: "View All Cushion",
            path: "residential/products?name=Cushion&page=View All Cushion&type=cushionproduct",
          },
        ],
      },*/
      {
        name: "Hard Surface",
        path: "",
        subNav: [
          {
            name: "Resilient Vinyl",
            path: "residential/products?name=Hard Surface&page=Resilient Vinyl&type=RESILIENT_VINYL",
          },
          {
            name: "Wood & Laminate",
            path:
              "residential/products?name=Hard Surface&page=" +
              encodeURIComponent("Wood & Laminate") +
              "&type=WOOD_LAMINATE",
          },
          {
            name: "Underlayment",
            path: "residential/products?name=Hard Surface&page=Underlayment&type=UNDERLAYMENT",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Hard Surface&page=Adhesives&type=ADHESIVES",
          },
          {
            name: "Care & Maintenance",
            path:
              "residential/products?name=Hard Surface&page=" +
              encodeURIComponent("Care & Maintenance") +
              "&type=CARE_MAINTENANCE",
          },
          {
            name: "View All Hard Surface",
            path: "residential/products?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE",
          },
        ],
      },
      {
        name: "Tile",
        path: "",
        subNav: [
          {
            name: "Ceramic",
            path: "residential/products?name=Tile&page=Ceramic&type=CERAMIC",
          },
          {
            name: "Mosaics",
            path: "residential/products?name=Tile&page=Mosaics&type=MOSAICS",
          },
          {
            name: "Porcelain",
            path: "residential/products?name=Tile&page=Porcelain&type=PORCELAIN",
          },
          {
            name: "Trim and Accents",
            path: "residential/products?name=Tile&page=Trim and Accents&type=TRIM_ACCENTS",
          },
          {
            name: "Natural Stone",
            path: "residential/products?name=Tile&page=Natural Stone&type=NATURAL_STONE",
          },
          {
            name: "Decorative Accessories",
            path: "residential/products?name=Tile&page=Decorative Accessories&type=DECORATIVE_ACCESSORIES",
          },
          /* {
            name: "Mosaics",
            path: "residential/products?name=Tile&page=Mosaics&type=tile_mosaics",
          },*/
          {
            name: "View All Tile",
            path: "residential/products?name=Tile&page=View All Tile&type=TILE",
          },
        ],
      },
      /* {
        name: "Resilient/Vinyl",
        path: "",
        subNav: [
          {
            name: "Luxury Vinyl Tile & Plank",
            path: "residential/products?name=Resilient/Vinyl&page=Luxury Vinyl Tile & Plank&type=resilient_vinyl_solidtech",
          },
          {
            name: "Vinyl - Sheet",
            path: "residential/products?name=Resilient/Vinyl&page=Vinyl - Sheet&type=resilient_vinyl_pergo_extreme",
          },
          {
            name: "Trim and Moldings",
            path: "residential/products?name=Resilient/Vinyl&page=Trim and Moldings&type=resilient_vinyl_trim_and_moldings",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Resilient/Vinyl&page=Adhesives&type=resilient_vinyl_adhesives",
          },
          {
            name: "Care & Maintenance",
            path: "residential/products?name=Resilient/Vinyl&page=Care & Maintenance&type=resilient_vinyl_care_and_maintenance",
          },
          {
            name: "Underlayments",
            path: "residential/products?name=Resilient/Vinyl&page=Underlayments&type=resilient_vinyl_underlaymen",
          },
          {
            name: "View All Resilient/Vinyl",
            path: "residential/products?name=Resilient/Vinyl&page=View All Resilient/Vinyl&type=resilient_vinyl",
          },
        ],
      },*/
      {
        name: "Merchandising",
        path: "",
        subNav: [
          {
            name: "Display",
            path: "residential/products?name=Merchandising&page=Display&type=DISPLAY",
          },
          {
            name: "Display Updates",
            path: "residential/products?name=Merchandising&page=Display Updates&type=DISPLAY_UPDATE",
          },
          {
            name: "Sales Tools",
            path: "residential/products?name=Merchandising&page=Sales Tools&type=SALES_TOOLS",
          },
          {
            name: "Graphics and Stickers",
            path: "residential/products?name=Merchandising&page=Graphics and Stickers&type=GRAPHICS_AND_STICKERS",
          },
          /*  {
            name: "Racks",
            path: "residential/products?name=Merchandising&page=Racks&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Literature",
            path: "residential/products?name=Merchandising&page=Literature&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Graphics",
            path: "residential/products?name=Merchandising&page=Graphics&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Kits",
            path: "residential/products?name=Merchandising&page=Kits&type=merchandising_sales_tools",
          },
          {
            name: "Stickers & Labels",
            path: "residential/products?name=Merchandising&page=Stickers & Labels&type=merchandising_graphics_and_stickers",
          },*/
          {
            name: "View All Merchandising",
            path: "residential/products?name=Merchandising&page=View All Merchandising&type=MERCHANDISING",
          },
        ],
      },
      {
        name: "Accessories",
        path: "",
        subNav: [
          {
            name: "Trim and Moldings",
            path: "residential/products?name=Accessories&page=Trim and Moldings&type=TRIM_AND_MOLDINGS",
          },
          {
            name: "Tools",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=Tools&type=TOOLS",
            path: "residential/products?name=Accessories&page=Tools&type=TOOLS",
          },
           {
            name: "Powders",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=Powders&type=POWDERS",
            path: "residential/products?name=Accessories&page=Powders&type=POWDERS",
          },
          {
            name: "Wall Base & Stair Solutions",
            path:
              "residential/products?name=Accessories&page=" +
              encodeURIComponent("Wall Base & Stair Solutions") +
              "&type=WALL_BASE_AND_STAIR_SOLUTIONS",
          },
          /*  {
            name: "Adhesives",
            path: "residential/products?name=Installation Accessories&page=Adhesives&type=accessories_adhesives",
          },
          {
            name: "Care & Maintenance",
            path: "residential/products?name=Installation Accessories&page=Care & Maintenance&type=accessories_care_and_maintenance",
          },
          {
            name: "Underlayments",
            path: "residential/products?name=Installation Accessories&page=Underlayments&type=accessories_underlayment",
          },*/
          {
            name: "Installation Kits & Tools",
            path:
              "residential/products?name=Accessories&page=" +
              encodeURIComponent("Installation Kits & Tools") +
              "&type=INSTALLATION_KITS_AND_TOOLS",
          },
          {
            name: "View All Accessories",
            path: "residential/products?name=Accessories&page=View All Accessories&type=ACCESSORIES",
          },
        ],
      },
      {
        name: "Sample",
        path: "",
        subNav: [
          {
            name: "Default Sample",
            path: "residential/products?name=Sample&page=Default Sample&type=DEFAULT_SAMPLE",
          },
          {
            name: "View All Sample",
            path: "residential/products?name=Sample&page=View All Sample&type=SAMPLE",
          },
        ],
      },
    ],
  },
  {
    name: "Orders",
    path: "",
    iconClass: "orders-icon",
    subNav: [
      {
        name: "Order History",
        path: "residential/orders",
      },
      {
        name: "Reserves",
        path: "residential/orders/reserves",
      },
    ],
  },
  {
    name: "Pricing",
    path: "",
    iconClass: "price-icon",
    subNav: [
      {
        name: "Search & Download Pricing",
        path: " ",
      },
      {
        name: "Download Price Catalog",
        path: " ",
      },
    ],
  },
  {
    name: "Finance",
    path: "",
    iconClass: "finance-icon",
    subNav: [
      {
        name: "Account Statements",
        path: "residential/finance/bank/account-statements",
      },
      {
        name: "Bank Accounts",
        path: "residential/finance/bank/accounts-list",
      },
      // {
      //   name: "Earning Statements",
      //   path: "residential/finance/bank/earning-statements",
      // },
      {
        name: "Invoices",
        path: "residential/finance/invoices",
      },
      {
        name: "Make A Payment / Receivables",
        path: "residential/finance/payments/receivables",
      },
      {
        name: "Scheduled Payments",
        path: "residential/finance/payments/online-payment-history",
      },
      {
        name: "Recent Payments",
        path: "residential/finance/payments/recent-payments",
      },
      {
        name: "Change Receiver email",
        path: "residential/finance/payments/receivables/select-users",
      }
    ],
  },
  {
    name: "Claims",
    path: "",
    iconClass: "claims-icon",
    subNav: [
      {
        name: "Create A New Claim",
        path: "residential/claims/createclaim",
      },
      {
        name: "Claims History",
        path: "residential/claims/history",
      },
    ],
  },
  {
    name: "Edit Setup",
    path: "",
    iconClass: "setup-icon",
  },
  {
    name: "Special Goods",
    isExternal: true,
    path: "https://www.mohawknet.com/mnet/login.jsp",
    iconClass: "goods-icon",
  },
];
export const residentialMenuIsSalesPerson = [
  {
    name: "Products",
    path: "",
    iconClass: "products-icon",
    subNav: [
      {
        name: "Soft Surface",
        path: "",
        subNav: [
          {
            name: "Residential Broadloom",
            path: "residential/products?name=Soft Surface&page=Residential Broadloom&type=RESIDENTIAL_BROADLOOM",
          },
          {
            name: "Commercial Broadloom",
            path: "residential/products?name=Soft Surface&page=Commercial Broadloom&type=COMMERCIAL_BROADLOOM",
          },
          {
            name: "Carpet Tile",
            path: "residential/products?name=Soft Surface&page=Soft Surface Tile&type=CARPET_TILE",
          },
          {
            name: "Pad & Cushion",
            path:
              "residential/products?name=Soft Surface&page=" +
              encodeURIComponent("Pad & Cushion") +
              "&type=PAD_CUSHION",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Soft Surface&page=Adhesives&type=ADHESIVES",
          },
          {
            name: "View All Soft Surface",
            path: "residential/products?name=Soft Surface&page=View All Soft Surface&type=SOFTSURFACE",
          },
        ],
      },
      /*    {
        name: "Cushion",
        path: "",
        subNav: [
          {
            name: "Rebond",
            path: "residential/products?name=Cushion&page=Rebond&type=cushionproduct_rebond",
          },
          {
            name: "Memory Foam",
            path: "residential/products?name=Cushion&page=Memory Foam&type=cushionproduct_memory_foam",
          },
          {
            name: "Synthetic",
            path: "residential/products?name=Cushion&page=Synthetic&type=cushionproduct_synthetic",
          },
          {
            name: "Rug Assist",
            path: "residential/products?name=Cushion&page=Rug Assist&type=cushionproduct_rug_assist",
          },
          {
            name: "View All Cushion",
            path: "residential/products?name=Cushion&page=View All Cushion&type=cushionproduct",
          },
        ],
      },*/
      {
        name: "Hard Surface",
        path: "",
        subNav: [
          {
            name: "Resilient Vinyl",
            path: "residential/products?name=Hard Surface&page=Resilient Vinyl&type=RESILIENT_VINYL",
          },
          {
            name: "Wood & Laminate",
            path:
              "residential/products?name=Hard Surface&page=" +
              encodeURIComponent("Wood & Laminate") +
              "&type=WOOD_LAMINATE",
          },
          {
            name: "Underlayment",
            path: "residential/products?name=Hard Surface&page=Underlayment&type=UNDERLAYMENT",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Hard Surface&page=Adhesives&type=ADHESIVES",
          },
          {
            name: "Care & Maintenance",
            path:
              "residential/products?name=Hard Surface&page=" +
              encodeURIComponent("Care & Maintenance") +
              "&type=CARE_MAINTENANCE",
          },
          {
            name: "View All Hard Surface",
            path: "residential/products?name=Hard Surface&page=View All Hard Surface&type=HARDSURFACE",
          },
        ],
      },
      {
        name: "Tile",
        path: "",
        subNav: [
          {
            name: "Ceramic",
            path: "residential/products?name=Tile&page=Ceramic&type=CERAMIC",
          },
          {
            name: "Mosaics",
            path: "residential/products?name=Tile&page=Mosaics&type=MOSAICS",
          },
          {
            name: "Porcelain",
            path: "residential/products?name=Tile&page=Porcelain&type=PORCELAIN",
          },
          {
            name: "Trim and Accents",
            path: "residential/products?name=Tile&page=Trim and Accents&type=TRIM_ACCENTS",
          },
          {
            name: "Natural Stone",
            path: "residential/products?name=Tile&page=Natural Stone&type=NATURAL_STONE",
          },
          {
            name: "Decorative Accessories",
            path: "residential/products?name=Tile&page=Decorative Accessories&type=DECORATIVE_ACCESSORIES",
          },
          /* {
            name: "Mosaics",
            path: "residential/products?name=Tile&page=Mosaics&type=tile_mosaics",
          },*/
          {
            name: "View All Tile",
            path: "residential/products?name=Tile&page=View All Tile&type=TILE",
          },
        ],
      },
      /* {
        name: "Resilient/Vinyl",
        path: "",
        subNav: [
          {
            name: "Luxury Vinyl Tile & Plank",
            path: "residential/products?name=Resilient/Vinyl&page=Luxury Vinyl Tile & Plank&type=resilient_vinyl_solidtech",
          },
          {
            name: "Vinyl - Sheet",
            path: "residential/products?name=Resilient/Vinyl&page=Vinyl - Sheet&type=resilient_vinyl_pergo_extreme",
          },
          {
            name: "Trim and Moldings",
            path: "residential/products?name=Resilient/Vinyl&page=Trim and Moldings&type=resilient_vinyl_trim_and_moldings",
          },
          {
            name: "Adhesives",
            path: "residential/products?name=Resilient/Vinyl&page=Adhesives&type=resilient_vinyl_adhesives",
          },
          {
            name: "Care & Maintenance",
            path: "residential/products?name=Resilient/Vinyl&page=Care & Maintenance&type=resilient_vinyl_care_and_maintenance",
          },
          {
            name: "Underlayments",
            path: "residential/products?name=Resilient/Vinyl&page=Underlayments&type=resilient_vinyl_underlaymen",
          },
          {
            name: "View All Resilient/Vinyl",
            path: "residential/products?name=Resilient/Vinyl&page=View All Resilient/Vinyl&type=resilient_vinyl",
          },
        ],
      },*/
      {
        name: "Merchandising",
        path: "",
        subNav: [
          {
            name: "Display",
            path: "residential/products?name=Merchandising&page=Display&type=DISPLAY",
          },
          {
            name: "Display Updates",
            path: "residential/products?name=Merchandising&page=Display Updates&type=DISPLAY_UPDATE",
          },
          {
            name: "Sales Tools",
            path: "residential/products?name=Merchandising&page=Sales Tools&type=SALES_TOOLS",
          },
          {
            name: "Graphics and Stickers",
            path: "residential/products?name=Merchandising&page=Graphics and Stickers&type=GRAPHICS_AND_STICKERS",
          },
          /*  {
            name: "Racks",
            path: "residential/products?name=Merchandising&page=Racks&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Literature",
            path: "residential/products?name=Merchandising&page=Literature&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Graphics",
            path: "residential/products?name=Merchandising&page=Graphics&type=merchandising_graphics_and_stickers",
          },
          {
            name: "Kits",
            path: "residential/products?name=Merchandising&page=Kits&type=merchandising_sales_tools",
          },
          {
            name: "Stickers & Labels",
            path: "residential/products?name=Merchandising&page=Stickers & Labels&type=merchandising_graphics_and_stickers",
          },*/
          {
            name: "View All Merchandising",
            path: "residential/products?name=Merchandising&page=View All Merchandising&type=MERCHANDISING",
          },
        ],
      },
      {
        name: "Accessories",
        path: "",
        subNav: [
          {
            name: "Trim and Moldings",
            path: "residential/products?name=Accessories&page=Trim and Moldings&type=TRIM_AND_MOLDINGS",
          },
           {
            name: "Tools",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=Tools&type=TOOLS",
            path: "residential/products?name=Accessories&page=Tools&type=TOOLS",
          },
           {
            name: "Powders",
            pathForOrder:
              "residential/post-modification/products/{order_number}?name=Accessories&page=Powders&type=POWDERS",
            path: "residential/products?name=Accessories&page=Powders&type=POWDERS",
          },
          {
            name: "Wall Base & Stair Solutions",
            path:
              "residential/products?name=Accessories&page=" +
              encodeURIComponent("Wall Base & Stair Solutions") +
              "&type=WALL_BASE_AND_STAIR_SOLUTIONS",
          },
          /*  {
            name: "Adhesives",
            path: "residential/products?name=Installation Accessories&page=Adhesives&type=accessories_adhesives",
          },
          {
            name: "Care & Maintenance",
            path: "residential/products?name=Installation Accessories&page=Care & Maintenance&type=accessories_care_and_maintenance",
          },
          {
            name: "Underlayments",
            path: "residential/products?name=Installation Accessories&page=Underlayments&type=accessories_underlayment",
          },*/
          {
            name: "Installation Kits & Tools",
            path:
              "residential/products?name=Accessories&page=" +
              encodeURIComponent("Installation Kits & Tools") +
              "&type=INSTALLATION_KITS_AND_TOOLS",
          },
          {
            name: "View All Accessories",
            path: "residential/products?name=Accessories&page=View All Accessories&type=ACCESSORIES",
          },
        ],
      },
      {
        name: "Sample",
        path: "",
        subNav: [
          {
            name: "Default Sample",
            path: "residential/products?name=Sample&page=Default Sample&type=DEFAULT_SAMPLE",
          },
          {
            name: "View All Sample",
            path: "residential/products?name=Sample&page=View All Sample&type=SAMPLE",
          },
        ],
      },
    ],
  },
  {
    name: "Orders",
    path: "",
    iconClass: "orders-icon",
    subNav: [
      {
        name: "Order History",
        path: "residential/orders",
      },
      {
        name: "Reserves",
        path: "residential/orders/reserves",
      },
    ],
  },
  {
    name: "Pricing",
    path: "",
    iconClass: "price-icon",
    subNav: [
      {
        name: "Search & Download Pricing",
        path: " ",
      },
      {
        name: "Download Price Catalog",
        path: " ",
      },
    ],
  },
  {
    name: "Finance",
    path: "",
    iconClass: "finance-icon",
    subNav: [
      {
        name: "Account Statements",
        path: "residential/finance/bank/account-statements",
      },
      {
        name: "Bank Accounts",
        path: "residential/finance/bank/accounts-list",
      },
      // {
      //   name: "Earning Statements",
      //   path: "residential/finance/bank/earning-statements",
      // },
      {
        name: "Invoices",
        path: "residential/finance/invoices",
      },
      {
        name: "Make A Payment / Receivables",
        path: "residential/finance/payments/receivables",
      },
      {
        name: "Scheduled Payments",
        path: "residential/finance/payments/online-payment-history",
      },
      {
        name: "Recent Payments",
        path: "residential/finance/payments/recent-payments",
      },
      {
        name: "Change Receiver email",
        path: "residential/finance/payments/receivables/select-users",
      }
    ],
  },
  {
    name: "Claims",
    path: "",
    iconClass: "claims-icon",
    subNav: [
      {
        name: "Create A New Claim",
        path: "residential/claims/createclaim",
      },
      {
        name: "Claims History",
        path: "residential/claims/history",
      },
    ],
  },
  {
    name: "Edit Setup",
    path: "",
    iconClass: "setup-icon",
  },
  {
    name: "Special Goods",
    isExternal: true,
    path: "https://www.mohawknet.com/mnet/login.jsp",
    iconClass: "goods-icon",
  },
];
export enum ResidentialPlpTypes {
  carpetproduct = "carpetproduct",
  carpetproduct_airo = "airo",
  carpetproduct_smartstrand = "smartstrand",
  carpetproduct_everstrand = "everstrand",
  carpetproduct_ultrastrand = "ultrastrand",
  carpetproduct_commercial_broadloom = "commercial_broadloom",
  carpetproduct_residential_broadloom = "residential_broadloom",
  carpetproduct_carpet_tile = "carpet_tile",
  carpetproduct_woven = "woven",
  carpetproduct_wool = "wool",
  carpet_wall_base_and_stair_solutions = "carpet_wall_base_and_stair_solutions",
  carpet_care_and_maintenance = "carpet_care_and_maintenance",
  cushionproduct = "cushionproduct",
  cushionproduct_rebond = "cushionproduct_rebond",
  cushionproduct_memory_foam = "cushionproduct_memory_foam",
  cushionproduct_synthetic = "cushionproduct_synthetic",
  cushionproduct_rug_assist = "cushionproduct_rug_assist",
  wood = "wood",
  wood_tecwood = "wood_tecwood",
  wood_belleluxe = "wood_belleluxe",
  wood_revwood = "wood_revwood",
  wood_pergo_elements = "wood_pergo_elements",
  wood_ultrawood = "wood_ultrawood",
  wood_underlayment = "wood_underlayment",
  wood_trim_and_moldings = "smartstrand",
  wood_adhesives = "wood_adhesives",
  wood_wall_base_and_stair_solutions = "wood_wall_base_and_stair_solutions",
  wood_care_and_maintenance = "wood_care_and_maintenance",
  resilient_vinyl = "resilient_vinyl",
  resilient_vinyl_solidtech = "resilient_vinyl_solidtech",
  resilient_vinyl_pergo_extreme = "resilient_vinyl_pergo_extreme",
  resilient_vinyl_luxecraft = "resilient_vinyl_luxecraft",
  resilient_vinyl_versatech = "resilient_vinyl_versatech",
  resilient_vinyl_aladdin_commercial = "resilient_vinyl_aladdin_commercial",
  resilient_vinyl_underlaymen = "resilient_vinyl_underlaymen",
  resilient_vinyl_trim_and_moldings = "resilient_vinyl_trim_and_moldings",
  resilient_vinyl_adhesives = "resilient_vinyl_adhesives",
  resilient_vinyl_care_and_maintenance = "resilient_vinyl_care_and_maintenance",
  resilient_vinyl_wall_base_and_stair_solutions = "resilient_vinyl_wall_base_and_stair_solutions",
  tile = "tile",
  tile_ceramic = "tile_ceramic",
  tile_mosaics = "  tile_mosaics",
  tile_porcelain = "tile_porcelain",
  tile_natural_stone = "tile_natural_stone",
  tile_decorative_accessories = "tile_decorative_accessories",
  tile_trim_and_accents = "tile_trim_accents",
  merchandising = "merchandising",
  merchandising_display = "merchandising_display",
  merchandising_display_update = "merchandising_display_update",
  merchandising_graphics_and_stickers = "merchandising_graphics_and_stickers",
  merchandising_sales_tools = "merchandising_sales_tools",
  accessories = "accessories",
  accessories_wall_base_and_stair_solutions = "accessories_wall_base_and_stair_solutions",
  accessories_care_and_maintenance = "accessories_care_and_maintenance",
  accessories_underlayment = "accessories_underlayment",
  accessories_trim_and_moldings = "accessories_trim_and_moldings",
  accessories_adhesives = "accessories_adhesives",
  accessories_trim_and_accents = "accessories_trim_accents",
  accessories_installation_kits_and_tools = "accessories_installation_kits_and_tools",
  accessories_powders = "accessories_powders",
  atpCheckProductTypes = '["COMMERCIAL_BROADLOOM","RESIDENTIAL_BROADLOOM","WOVEN","PRODUCT_SHEET","EVERSTRAND","RESILIENT_VINYL","NEEDLEPUNCH_BROADLOOM","NEEDLEPUNCH_TILE","WOOD_LAMINATE","PAD_CUSHION","CARPET_TILE","CERAMIC","PORCELAIN","TRIM_ACCENTS"]',
  account_sample_order_restriction = '["DISPLAY","DISPLAY_UPDATE","GRAPHICS_AND_STICKERS"]',
}

export const PdpPfxPriceFields: any = {
  RESIDENTIAL_BROADLOOM: [
    { fieldName: "Roll Price (USD)", key: "rollPriceSY", type: "sq. yd." },
    { fieldName: "Cut Price (USD)", key: "cutPriceSY", type: "sq. yd." },

    //{ fieldName: "Multi Roll Price (USD)", key: "multiRollPriceSY" },
  ],
  RESILIENT_VINYL: [
    { fieldName: "Roll Price (USD)", key: "rollPriceSY", type: "sq. yd." },
    { fieldName: "Cut Price (USD)", key: "cutPriceSY", type: "sq. yd." },
    { fieldName: "Carton Price (USD)", key: "cartonPriceSF", type: "sq. ft." },
    { fieldName: "Pallet Price (USD)", key: "palletPriceSF", type: "sq. ft." },
    // { fieldName: "Multi Roll Price (USD)", key: "multiRollPriceSY" },
  ],
  NEEDLEPUNCH_BROADLOOM: [
    { fieldName: "Roll Price (USD)", key: "rollPriceSY", type: "sq. yd." },
    { fieldName: "Cut Price (USD)", key: "cutPriceSY", type: "sq. yd." },

    // { fieldName: "Multi Roll Price (USD)", key: "multiRollPriceSY" },
  ],
  COMMERCIAL_BROADLOOM: [
    { fieldName: "Roll Price (USD)", key: "rollPriceSY", type: "sq. yd." },
    { fieldName: "Cut Price (USD)", key: "cutPriceSY", type: "sq. yd." },

    // { fieldName: "Multi Roll Price (USD)", key: "multiRollPriceSY" },
  ],
  CARPET_TILE: [
    { fieldName: "Price (USD)", key: "cartonPriceSY", type: "sq. yd." },
      { fieldName: "Pallet Price (USD)", key: "palletPriceSY", type: "sq. yd." },
    // { fieldName: "Multi Pallet Price (USD)", key: "multiPalletPriceSY" },
  ],
  NEEDLEPUNCH_TILE: [
    { fieldName: "Carton Price (USD)", key: "cartonPriceSY", type: "sq. yd." },
     { fieldName: "Pallet Price (USD)", key: "palletPriceSY", type: "sq. yd." },
    // { fieldName: "Multi Pallet Price (USD)", key: "multiPalletPriceSY" },
  ],
  PAD_CUSHION: [
    // { fieldName: "Price Each (USD)", key: "priceEach" },
    // {
    //   fieldName: "Job Pack Price (USD)",
    //   key: "jobPackPriceSY",
    //   type: "sq. yd.",
    // },
    {
      fieldName: "Warehouse Price (USD)",
      key: "warehousePriceSY",
      type: "sq. yd.",
    },
    {
      fieldName: "Plant Direct Price (USD)",
      key: "plantDirectPriceSY",
      type: "sq. yd.",
    },
  ],
  SETTING_MATERIAL: [
    { fieldName: "Carton Price (USD)", key: "cartonPriceSY", type: "sq. yd." },
    { fieldName: "Pallet Price (USD)", key: "palletPriceSY", type: "sq. yd." },
  ],
  TRIM_ACCENTS: [
    { fieldName: "Carton Price (USD)", key: "cartonPriceSY", type: "sq. yd." },
    { fieldName: "Pallet Price (USD)", key: "palletPriceSY", type: "sq. yd." },
  ],
  CERAMIC: [
    { fieldName: "Carton Price (USD)", key: "cartonPriceSF", type: "sq. ft." },
    { fieldName: "Pallet Price (USD)", key: "palletPriceSF", type: "sq. ft." },
  ],
  MOSAICS: [
    { fieldName: "Carton Price (USD)", key: "cartonPriceSF", type: "sq. ft." },
    { fieldName: "Pallet Price (USD)", key: "palletPriceSF", type: "sq. ft." },
  ],
  PORCELAIN: [
    { fieldName: "Carton Price (USD)", key: "cartonPriceSF", type: "sq. ft." },
    { fieldName: "Pallet Price (USD)", key: "palletPriceSF", type: "sq. ft." },
  ],
  NATURAL_STONE: [
    { fieldName: "Carton Price (USD)", key: "cartonPriceSY", type: "sq. yd." },
    { fieldName: "Pallet Price (USD)", key: "palletPriceSY", type: "sq. yd." },
  ],
  DECORATIVE_ACCESSORIES: [
    { fieldName: "Price (USD)", key: "priceEach", type: "each." },
  ],
  DISPLAY: [{ fieldName: "Price (USD)", key: "listPrice", type: "each." }],
  DISPLAY_UPDATE: [
    { fieldName: "Price (USD)", key: "listPrice", type: "each." },
  ],
  SALES_TOOLS: [{ fieldName: "Price (USD)", key: "listPrice", type: "each." }],
  GRAPHICS_AND_STICKERS: [
    { fieldName: "Price (USD)", key: "listPrice", type: "each." },
  ],
  TRIM_AND_MOLDINGS: [
    { fieldName: "Price Each (USD)", key: "priceEach", type: "each." },
  ],
  WALL_BASE_AND_STAIR_SOLUTIONS: [
    { fieldName: "Price Each (USD)", key: "priceEach", type: "each." },
  ],
  UNDERLAYMENT: [{ fieldName: "Price (USD)", key: "priceEach", type: "each." }],
  ADHESIVES: [{ fieldName: "Price (USD)", key: "priceEach", type: "each." }],
  INSTALLATION_KITS_AND_TOOLS: [
    { fieldName: "Price Each (USD)", key: "priceEach", type: "each." },
  ],
   TOOLS: [
    { fieldName: "Price Each (USD)", key: "priceEach", type: "each." },
  ],
   POWDERS: [
    { fieldName: "Price Each (USD)", key: "priceEach", type: "each." },
  ],

  SAMPLES: [
    { fieldName: "Price Each (USD)", key: "priceEach", type: "each." },
    // { fieldName: "Cut Price (USD)", key: "cutPriceSY" },
    // { fieldName: "Roll Price (USD)", key: "rollPriceSY" },
    // { fieldName: "Multi Roll Price (USD)", key: "multiRollPriceSY" },
  ],
  BROADLOOM: [
    { fieldName: "Roll Price (USD)", key: "rollPriceSY", type: "sq. yd." },
    { fieldName: "Cut Price (USD)", key: "cutPriceSY", type: "sq. yd." },

    // { fieldName: "Multi Roll Price (USD)", key: "multiRollPriceSY" },
  ],
  RUBBER: [
    { fieldName: "Roll Price (USD)", key: "rollPriceSY", type: "sq. yd." },
    { fieldName: "Cut Price (USD)", key: "cutPriceSY", type: "sq. yd." },

    // { fieldName: "Multi Roll Price (USD)", key: "multiRollPriceSY" },
  ],
  WOOD_LAMINATE: [
    { fieldName: "Carton Price (USD)", key: "cartonPriceSF", type: "sq. ft." },
    { fieldName: "Pallet Price (USD)", key: "palletPriceSF", type: "sq. ft." },
  ],
  CARE_MAINTENANCE: [
    { fieldName: "Price Each (USD)", key: "priceEach", type: "each" },
  ],
};
