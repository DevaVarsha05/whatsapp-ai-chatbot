const Lead = require('../models/lead');
const { sendListMenu, sendButtons } = require('../utils/whatsapp');

// ─────────────────────────────────────────────────────────────────
// PRODUCT HIERARCHY
// ─────────────────────────────────────────────────────────────────

const MAIN_CATEGORIES = [
  { id: 'roofing_products',       title: '🏠 Roofing Products',         description: 'Sheets, Accessories, Fibre Boards' },
  { id: 'structural_fastening',   title: '🔩 Structural & Fastening',   description: 'Steel, Pipes, Cement, Fasteners' },
  { id: 'use_cases',              title: '🏗️ Use Cases',                description: 'Residential, Commercial, Industrial' },
];

// ── Sub-categories per main category ─────────────────────────────
const SUB_CATEGORIES = {
  roofing_products: [
    { id: 'roofing_sheets',   title: '1.1 Roofing Sheets',        description: 'JSW Everglow, Colouron+, Pragati+...' },
    { id: 'roofing_acc',      title: '1.2 Roofing Accessories',   description: 'L Corner, Gutter, Ridge...' },
    { id: 'fibre_boards',     title: '1.3 Fibre Cement Boards',   description: 'Everest Standard, HD Board' },
  ],
  structural_fastening: [
    { id: 'structural_steel', title: '2.1 Structural Steel',      description: 'TMT Bars - ARS550D' },
    { id: 'pipes',            title: '2.2 Pipes',                 description: 'MS Pipes, GP Pipes' },
    { id: 'cement',           title: '2.3 Cement',                description: 'Dalmia Cement' },
    { id: 'fasteners',        title: '2.4 Fasteners & Fittings',  description: 'TATA Screws, Louvers, Thoovanam...' },
  ],
  use_cases: [
    { id: 'residential',      title: '3.1 Residential',           description: 'House Terraces, Balcony, Frontage' },
    { id: 'commercial',       title: '3.2 Commercial',            description: 'Shop Extensions, Transit Shelters...' },
    { id: 'industrial',       title: '3.3 Industrial / Agricultural', description: 'Car Parking, Cattle Shed, Godown' },
  ],
};

// ── Product details (brands + thickness) per sub-category ────────
const PRODUCTS = {
  // 1.1 Roofing Sheets
  roofing_sheets: {
    title: 'Roofing Sheets',
    brands: [
      { id: 'jsw_everglow',   title: 'JSW Everglow' },
      { id: 'jsw_colouron',   title: 'JSW Colouron+' },
      { id: 'jsw_pragati',    title: 'JSW Pragati+' },
      { id: 'jsw_silveron',   title: 'JSW Silveron+' },
      { id: 'jsw_vishwas',    title: 'JSW Vishwas+' },
      { id: 'jsw_colorvista', title: 'JSW ColorVista' },
    ],
    sheetTypes: [
      { id: 'profile_sheet',       title: 'Profile Sheet' },
      { id: 'crimp_sheet',         title: 'Crimp Sheet' },
      { id: 'arch_sheet',          title: 'Arch Sheet' },
      { id: 'profile_ridge_sheet', title: 'Profile Ridge Sheet' },
      { id: 'plain_sheet',         title: 'Plain Sheet' },
    ],
    thickness: [
      { id: '0.35mm', title: '0.35mm' },
      { id: '0.40mm', title: '0.40mm' },
      { id: '0.45mm', title: '0.45mm' },
      { id: '0.47mm', title: '0.47mm' },
      { id: '0.50mm', title: '0.50mm' },
      { id: '0.60mm', title: '0.60mm' },
    ],
  },

  // 1.2 Roofing Accessories
  roofing_acc: {
    title: 'Roofing Accessories',
    brands: [
      { id: 'l_corner',   title: 'JSW L Corner' },
      { id: 'gutter',     title: 'Gutter' },
      { id: 'ridge',      title: 'Ridge' },
      { id: 'l_flashing', title: 'L Flashing' },
      { id: 'down_pipe',  title: 'Down Pipe' },
      { id: 'barge_cap',  title: 'Barge Cap' },
    ],
    thickness: [
      { id: '0.35mm', title: '0.35mm' },
      { id: '0.40mm', title: '0.40mm' },
      { id: '0.45mm', title: '0.45mm' },
      { id: '0.47mm', title: '0.47mm' },
      { id: '0.50mm', title: '0.50mm' },
      { id: '0.60mm', title: '0.60mm' },
    ],
  },

  // 1.3 Fibre Cement Boards
  fibre_boards: {
    title: 'Fibre Cement Boards',
    brands: [
      { id: 'everest_standard', title: 'Everest Standard Board' },
      { id: 'everest_hd',       title: 'Everest HD Board' },
    ],
    thickness: [
      { id: '6mm',  title: '6mm' },
      { id: '8mm',  title: '8mm' },
      { id: '10mm', title: '10mm' },
    ],
  },

  // 2.1 Structural Steel
  structural_steel: {
    title: 'Structural Steel (TMT Bars)',
    brands: [
      { id: 'ars550d', title: 'ARS550D TMT Bars' },
    ],
    thickness: [
      { id: '8mm',  title: '8mm' },
      { id: '10mm', title: '10mm' },
      { id: '12mm', title: '12mm' },
      { id: '16mm', title: '16mm' },
      { id: '20mm', title: '20mm' },
    ],
  },

  // 2.2 Pipes
  pipes: {
    title: 'Steel Pipes',
    brands: [
      { id: 'ms_pipes', title: 'MS Pipes' },
      { id: 'gp_pipes', title: 'GP Pipes' },
    ],
    thickness: [
      { id: '1mm',   title: '1mm' },
      { id: '1.2mm', title: '1.2mm' },
      { id: '1.6mm', title: '1.6mm' },
      { id: '2mm',   title: '2mm' },
      { id: '2.5mm', title: '2.5mm' },
      { id: '3mm',   title: '3mm' },
      { id: '4mm',   title: '4mm' },
    ],
  },

  // 2.3 Cement
  cement: {
    title: 'Cement',
    brands: [
      { id: 'dalmia', title: 'Dalmia Cement' },
    ],
    thickness: [], // No thickness for cement
  },

  // 2.4 Fasteners & Fittings
  fasteners: {
    title: 'Fasteners & Fittings',
    brands: [
      { id: 'tata_screws',      title: 'TATA Screws' },
      { id: 'louvers',          title: 'Louvers' },
      { id: 'roof_ventilators', title: 'Roof Ventilators' },
      { id: 'thoovanam',        title: 'Thoovanam' },
      { id: 'mugappu',          title: 'Mugappu' },
    ],
    thickness: [
      { id: 'screw_19mm',  title: 'Screw 19mm' },
      { id: 'screw_25mm',  title: 'Screw 25mm' },
      { id: 'screw_55mm',  title: 'Screw 55mm' },
      { id: 'thoovanam_6', title: 'Thoovanam 6"' },
      { id: 'thoovanam_8', title: 'Thoovanam 8"' },
    ],
  },
   residential: {
    title: '3.1 Residential',
    items: [
      { id: 'house_terrace', title: 'House Terraces' },
      { id: 'balcony',       title: 'Balcony & Window Extensions' },
      { id: 'frontage',      title: 'Frontage / Backyard Area' },
    ],
  },
  commercial: {
    title: '3.2 Commercial',
    items: [
      { id: 'shop_extension',  title: 'Shop Extensions' },
      { id: 'transit_shelter', title: 'Transit Shelters' },
      { id: 'security_cabin',  title: 'Security Cabins' },
      { id: 'walkway',         title: 'Walkways / Corridors' },
    ],
  },
  industrial: {
    title: '3.3 Industrial / Agricultural',
    items: [
      { id: 'car_parking', title: 'Car Parking / Vehicle Shed' },
      { id: 'cattle_shed', title: 'Cattle Shed & Poultry Farms' },
      { id: 'godown',      title: 'Godown' },
    ],
  },
};

// ── Use Case Details (no brand/thickness — info only) ─────────────


// ─────────────────────────────────────────────────────────────────
// SEND FUNCTIONS
// ─────────────────────────────────────────────────────────────────

// Step 1: Main Category Menu (Roofing / Structural / Use Cases)
const sendMainCategoryMenu = async (phone) => {
  await sendListMenu(
    phone,
    `Please select a *Product Category*:`,
    'Select Category',
    [{
      title: 'Our Categories',
      rows: MAIN_CATEGORIES,
    }]
  );
};

// Step 2: Sub-category Menu
const sendSubCategoryMenu = async (phone, mainCatId) => {
  const subs = SUB_CATEGORIES[mainCatId];
  if (!subs) return;

  const label = MAIN_CATEGORIES.find(c => c.id === mainCatId)?.title || 'Products';

  await sendListMenu(
    phone,
    `Please select a *Sub-Category* under ${label}:`,
    'Select Sub-Category',
    [{
      title: label,
      rows: subs,
    }]
  );
};

// Step 3a: Brand Menu
const sendBrandMenu = async (phone, subCatId) => {
  const product = PRODUCTS[subCatId];
  if (!product) return;

  await sendListMenu(
    phone,
    `Please select *Brand / Type* for ${product.title}:`,
    'Select Brand',
    [{
      title: product.title,
      rows: product.brands,
    }]
  );
};

// Step 3b: Sheet Type Menu (only for roofing_sheets)
const sendSheetTypeMenu = async (phone) => {
  const product = PRODUCTS['roofing_sheets'];
  await sendListMenu(
    phone,
    `Please select *Sheet Type (Profile)*:`,
    'Select Type',
    [{
      title: 'Sheet Types',
      rows: product.sheetTypes,
    }]
  );
};

// Step 4: Thickness / Size Menu
const sendThicknessMenu = async (phone, subCatId) => {
  const product = PRODUCTS[subCatId];
  if (!product) return;
  if (product.thickness.length === 0) return 'skip_thickness';

  await sendListMenu(
    phone,
    `Please select *Size / Thickness*:`,
    'Select Size',
    [{
      title: 'Available Sizes',
      rows: product.thickness,
    }]
  );
};

// ─────────────────────────────────────────────────────────────────
// HANDLERS
// ─────────────────────────────────────────────────────────────────

// Handle Main Category Selection
const handleMainCategorySelection = async (phone, mainCatId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  lead.mainCategory = mainCatId;
  lead.currentStage = 'sub_category';
  await lead.save();

  // Use Cases → show info, not quote form
  if (mainCatId === 'use_cases') {
    await sendSubCategoryMenu(phone, mainCatId);
    return 'use_case_browse';
  }

  await sendSubCategoryMenu(phone, mainCatId);
};

// Handle Sub-category Selection
const handleSubCategorySelection = async (phone, subCatId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  // Use Case selected → show info only
  if (USE_CASES[subCatId]) {
    const uc = USE_CASES[subCatId];

    await sendListMenu(
      phone,
      `Please select your *Use Case* under ${uc.title}:`,
      'Select Use Case',
      [{ title: uc.title, rows: uc.items }]
    );

    lead.currentStage = 'use_case_item';
    lead.useCaseType  = subCatId;
    await lead.save();
    return;
  }

  // Product sub-category selected → go to brand
  lead.productType  = subCatId;
  lead.quoteStep    = 'brand';
  lead.currentStage = 'quote_form';
  await lead.save();

  await sendBrandMenu(phone, subCatId);
};


const handleUseCaseItemSelection = async (phone, itemId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  lead.useCaseItem  = itemId;
  lead.currentStage = 'quote_form';
  lead.quoteStep    = 'brand';
  await lead.save();

  await sendMainCategoryMenu(phone);
};
// Handle Product Selection (legacy alias — keeps stage2 backward compatible)
const handleProductSelection = async (phone, productId) => {
  return handleSubCategorySelection(phone, productId);
};

// ─────────────────────────────────────────────────────────────────
module.exports = {
  // Send helpers
  sendMainCategoryMenu,
  sendSubCategoryMenu,
  sendBrandMenu,
  sendSheetTypeMenu,
  sendThicknessMenu,
  // Handlers
  handleMainCategorySelection,
  handleSubCategorySelection,
  handleUseCaseItemSelection,
  handleProductSelection,   // backward compat
  // Data
  PRODUCTS,
  SUB_CATEGORIES,
  USE_CASES,
};
