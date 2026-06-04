const Lead = require('../models/lead');
const { sendText,sendListMenu, sendButtons } = require('../utils/whatsapp');

// ─────────────────────────────────────────────────────────────────
// PRODUCT HIERARCHY
// ─────────────────────────────────────────────────────────────────

const MAIN_CATEGORIES = [
  { id: 'roofing_products',       title: '🏠 Roofing Products',   description: 'Sheets, Accessories, Fibre Boards' },
  { id: 'structural_fastening',   title: '🔩 Structural',         description: 'Steel, Pipes, Cement, Fasteners' },
  { id: 'use_cases',              title: '🏗️ Use Cases',          description: 'Residential, Commercial, Industrial' },
];

const SUB_CATEGORIES = {
  roofing_products: [
    { id: 'roofing_sheets',   title: ' Roofing Sheets',        description: 'JSW Everglow, Colouron+, Pragati+...' },
    { id: 'roofing_acc',      title: ' Roofing Accessories',   description: 'L Corner, Gutter, Ridge...' },
    { id: 'fibre_boards',     title: ' Fibre Cement Boards',   description: 'Everest Standard, HD Board' },
  ],
  structural_fastening: [
    { id: 'structural_steel', title: ' Structural Steel',      description: 'TMT Bars - ARS550D' },
    { id: 'pipes',            title: 'Pipes',                  description: 'MS Pipes, GP Pipes' },
    { id: 'cement',           title: ' Cement',                description: 'Dalmia Cement' },
    { id: 'fasteners',        title: ' Fasteners & Fittings',  description: 'TATA Screws, Louvers, Thoovanam...' },
  ],
  use_cases: [
    { id: 'uc_residential',     title: '🏡 Residential',               description: 'House Terraces, Balcony, Frontage' },
    { id: 'uc_commercial',      title: '🏪 Commercial',                description: 'Shop Extensions, Shelters, Cabins' },
    { id: 'uc_industrial_agri', title: '🏭 Industrial/Agri',           description: 'Car Parking, Cattle Shed, Godown' },
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
    title: 'Structural Steel (TMT)',
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
    thickness: [],
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

  // 3.1 Residential Use Cases
  uc_residential: {
    title: 'Residential',
    brands: [
      { id: 'house_terraces',            title: 'House Terraces' },
      { id: 'balcony_window_extensions', title: 'Balcony Extensions' },
      { id: 'frontage_backyard',         title: 'Frontage/Backyard' },
    ],
    thickness: [],
  },

  // 3.2 Commercial Use Cases
  uc_commercial: {
    title: 'Commercial',
    brands: [
      { id: 'shop_extensions',    title: 'Shop Extensions' },
      { id: 'transit_shelters',   title: 'Transit Shelters' },
      { id: 'security_cabins',    title: 'Security Cabins' },
      { id: 'walkways_corridors', title: 'Walkways/Corridors' },
    ],
    thickness: [],
  },

  // 3.3 Industrial / Agricultural Use Cases
  uc_industrial_agri: {
    title: 'Industrial/Agricultural',
    brands: [
      { id: 'car_parking_vehicle_shed',  title: 'Car Parking/Shed' },
      { id: 'cattle_shed_poultry_farms', title: 'Cattle/Poultry Shed' },
      { id: 'godown',                    title: 'Godown' },
    ],
    thickness: [],
  },
};
// ─────────────────────────────────────────────────────────────────
// SEND FUNCTIONS
// ─────────────────────────────────────────────────────────────────

// Step 1: Main Category Menu
// Step 1: Main Category Menu
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

// Step 3a: Brand Menu (works for both products AND use cases)
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

  await sendSubCategoryMenu(phone, mainCatId); // ✅ sub menu அனுப்பு
};

// Handle Sub-category Selection
const handleSubCategorySelection = async (phone, subCatId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  const USE_CASE_IDS = ['uc_residential', 'uc_commercial', 'uc_industrial_agri'];
  if (USE_CASE_IDS.includes(subCatId)) {
  
 

  lead.productType  = subCatId;
  lead.quoteStep    = 'brand';
  lead.currentStage = 'quote_form';
  await lead.save();

  await sendBrandMenu(phone, subCatId);
  return;
}

  lead.productType  = subCatId;
  lead.quoteStep    = 'brand';
  lead.currentStage = 'quote_form';
  await lead.save();
  await sendBrandMenu(phone, subCatId);
}

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
  handleProductSelection,   // backward compat
  // Data
  PRODUCTS,
  SUB_CATEGORIES,
}