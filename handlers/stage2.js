const Lead = require('../models/lead');
const { sendListMenu, sendButtons, sendText } = require('../utils/whatsapp');

// ─────────────────────────────────────────────────────────────────
// MAIN CATEGORIES
// ─────────────────────────────────────────────────────────────────
const MAIN_CATEGORIES = [
  { id: 'roofing_products',     title: '🏠 Roofing Products',       description: 'Sheets, Accessories, Fibre Boards' },
  { id: 'structural_fastening', title: '🔩 Structural & Fastening', description: 'Steel, Pipes, Cement, Fasteners' },
  { id: 'use_cases',            title: '🏗️ Use Cases',              description: 'Residential, Commercial, Industrial' },
];

// ─────────────────────────────────────────────────────────────────
// PRODUCTS DATA
// ─────────────────────────────────────────────────────────────────
const PRODUCTS = {
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
  cement: {
    title: 'Cement',
    brands: [
      { id: 'dalmia', title: 'Dalmia Cement' },
    ],
    thickness: [],
  },
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
};

const USE_CASES = {
  residential: {
    title: 'Residential',
    items: ['House Terraces', 'Balcony & Window Extensions', 'Frontage / Backyard Area'],
  },
  commercial: {
    title: 'Commercial',
    items: ['Shop Extensions', 'Transit Shelters', 'Security Cabins', 'Walkways / Corridors'],
  },
  industrial: {
    title: 'Industrial / Agricultural',
    items: ['Car Parking / Vehicle Shed', 'Cattle Shed & Poultry Farms', 'Godown'],
  },
};

// ─────────────────────────────────────────────────────────────────
// NESTED LIST BUILDERS
// ─────────────────────────────────────────────────────────────────

// Roofing Products full nested list (1 sendListMenu call)
const sendRoofingProductsList = async (phone) => {
  await sendListMenu(
    phone,
    `Please select from *🏠 Roofing Products*:`,
    'View Products',
    [
      {
        title: '1.1 Roofing Sheets — Brands (JSW)',
        rows: PRODUCTS.roofing_sheets.brands,
      },
      {
        title: '1.1 Roofing Sheets — Sheet Types',
        rows: PRODUCTS.roofing_sheets.sheetTypes,
      },
      {
        title: '1.1 Roofing Sheets — Thickness',
        rows: PRODUCTS.roofing_sheets.thickness,
      },
      {
        title: '1.2 Roofing Accessories — Items (JSW)',
        rows: PRODUCTS.roofing_acc.brands,
      },
      {
        title: '1.2 Roofing Accessories — Thickness',
        rows: PRODUCTS.roofing_acc.thickness,
      },
      {
        title: '1.3 Fibre Cement Boards — Items (Everest)',
        rows: PRODUCTS.fibre_boards.brands,
      },
      {
        title: '1.3 Fibre Cement Boards — Thickness',
        rows: PRODUCTS.fibre_boards.thickness,
      },
    ]
  );
};

// Structural & Fastening full nested list
const sendStructuralList = async (phone) => {
  await sendListMenu(
    phone,
    `Please select from *🔩 Structural & Fastening*:`,
    'View Products',
    [
      {
        title: '2.1 Structural Steel — Product',
        rows: PRODUCTS.structural_steel.brands,
      },
      {
        title: '2.1 Structural Steel — Sizes',
        rows: PRODUCTS.structural_steel.thickness,
      },
      {
        title: '2.2 Pipes — Types',
        rows: PRODUCTS.pipes.brands,
      },
      {
        title: '2.2 Pipes — Thickness',
        rows: PRODUCTS.pipes.thickness,
      },
      {
        title: '2.3 Cement',
        rows: PRODUCTS.cement.brands,
      },
      {
        title: '2.4 Fasteners & Fittings — Items',
        rows: PRODUCTS.fasteners.brands,
      },
      {
        title: '2.4 Fasteners & Fittings — Sizes',
        rows: PRODUCTS.fasteners.thickness,
      },
    ]
  );
};

// Use Cases full nested list
const sendUseCasesList = async (phone) => {
  await sendListMenu(
    phone,
    `Please select from *🏗️ Use Cases*:`,
    'View Use Cases',
    [
      {
        title: '3.1 Residential',
        rows: USE_CASES.residential.items.map(i => ({ id: 'uc_' + i.toLowerCase().replace(/\s+/g, '_'), title: i })),
      },
      {
        title: '3.2 Commercial',
        rows: USE_CASES.commercial.items.map(i => ({ id: 'uc_' + i.toLowerCase().replace(/\s+/g, '_'), title: i })),
      },
      {
        title: '3.3 Industrial / Agricultural',
        rows: USE_CASES.industrial.items.map(i => ({ id: 'uc_' + i.toLowerCase().replace(/\s+/g, '_'), title: i })),
      },
    ]
  );
};

// ─────────────────────────────────────────────────────────────────
// STEP 1: Main Category Menu
// ─────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────
// STEP 2: Main Category Selected → Send Full Nested List
// ─────────────────────────────────────────────────────────────────
const handleMainCategorySelection = async (phone, mainCatId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  lead.mainCategory = mainCatId;
  lead.currentStage = 'product_selected';
  await lead.save();

  if (mainCatId === 'roofing_products') {
    await sendRoofingProductsList(phone);
  } else if (mainCatId === 'structural_fastening') {
    await sendStructuralList(phone);
  } else if (mainCatId === 'use_cases') {
    await sendUseCasesList(phone);
  }
};

// ─────────────────────────────────────────────────────────────────
// STEP 3: Item Selected → identify product type + start quote
// ─────────────────────────────────────────────────────────────────

// Map any selected item id → which productType it belongs to
const resolveProductType = (itemId) => {
  if (PRODUCTS.roofing_sheets.brands.find(b => b.id === itemId))    return 'roofing_sheets';
  if (PRODUCTS.roofing_sheets.sheetTypes.find(b => b.id === itemId)) return 'roofing_sheets';
  if (PRODUCTS.roofing_sheets.thickness.find(b => b.id === itemId)) return 'roofing_sheets';
  if (PRODUCTS.roofing_acc.brands.find(b => b.id === itemId))       return 'roofing_acc';
  if (PRODUCTS.roofing_acc.thickness.find(b => b.id === itemId))    return 'roofing_acc';
  if (PRODUCTS.fibre_boards.brands.find(b => b.id === itemId))      return 'fibre_boards';
  if (PRODUCTS.fibre_boards.thickness.find(b => b.id === itemId))   return 'fibre_boards';
  if (PRODUCTS.structural_steel.brands.find(b => b.id === itemId))  return 'structural_steel';
  if (PRODUCTS.structural_steel.thickness.find(b => b.id === itemId)) return 'structural_steel';
  if (PRODUCTS.pipes.brands.find(b => b.id === itemId))             return 'pipes';
  if (PRODUCTS.pipes.thickness.find(b => b.id === itemId))          return 'pipes';
  if (PRODUCTS.cement.brands.find(b => b.id === itemId))            return 'cement';
  if (PRODUCTS.fasteners.brands.find(b => b.id === itemId))         return 'fasteners';
  if (PRODUCTS.fasteners.thickness.find(b => b.id === itemId))      return 'fasteners';
  return null;
};

const handleItemSelection = async (phone, itemId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  // Use case item selected → show quote button
  if (itemId.startsWith('uc_')) {
    await sendButtons(phone,
      `Would you like to request a quote for your project?`,
      [
        { id: 'quote_request', title: '📋 Request Quote' },
        { id: 'main_menu',     title: '🔙 Main Menu' },
      ]
    );
    lead.currentStage = 'use_case_action';
    await lead.save();
    return;
  }

  const productType = resolveProductType(itemId);
  if (!productType) return;

  lead.productType  = productType;
  lead.quoteStep    = 'brand';
  lead.currentStage = 'quote_form';
  await lead.save();

  // Send brand menu for selected product
  await sendListMenu(
    phone,
    `Please select *Brand / Type* for ${PRODUCTS[productType].title}:`,
    'Select Brand',
    [{ title: PRODUCTS[productType].title, rows: PRODUCTS[productType].brands }]
  );
};

// Thickness menu (used by stage3)
const sendThicknessMenu = async (phone, subCatId) => {
  const product = PRODUCTS[subCatId];
  if (!product) return;
  if (product.thickness.length === 0) return 'skip_thickness';
  await sendListMenu(
    phone,
    `Please select *Size / Thickness*:`,
    'Select Size',
    [{ title: 'Available Sizes', rows: product.thickness }]
  );
};

// Sheet type menu (used by stage3)
const sendSheetTypeMenu = async (phone) => {
  await sendListMenu(
    phone,
    `Please select *Sheet Type*:`,
    'Select Type',
    [{ title: 'Sheet Types', rows: PRODUCTS.roofing_sheets.sheetTypes }]
  );
};

// ─────────────────────────────────────────────────────────────────
module.exports = {
  sendMainCategoryMenu,
  handleMainCategorySelection,
  handleItemSelection,
  sendThicknessMenu,
  sendSheetTypeMenu,
  PRODUCTS,
  USE_CASES,
};