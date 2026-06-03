const Lead = require('../models/lead');
const { sendListMenu, sendText } = require('../utils/whatsapp');

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

// ── Main Menu — single dropdown with all products ─────────────────
const sendMainCategoryMenu = async (phone) => {
  await sendListMenu(
    phone,
    `Please select a *Product*:`,
    'Select Product',
    [
      {
        title: '🏠 Roofing Products',
        rows: [
          { id: 'roofing_sheets',   title: '1.1 Roofing Sheets',      description: 'JSW Everglow, Colouron+...' },
          { id: 'roofing_acc',      title: '1.2 Roofing Accessories',  description: 'L Corner, Gutter, Ridge...' },
          { id: 'fibre_boards',     title: '1.3 Fibre Cement Boards',  description: 'Everest Standard, HD Board' },
        ],
      },
      {
        title: '🔩 Structural & Fastening',
        rows: [
          { id: 'structural_steel', title: '2.1 Structural Steel',     description: 'TMT Bars - ARS550D' },
          { id: 'pipes',            title: '2.2 Pipes',                description: 'MS Pipes, GP Pipes' },
          { id: 'cement',           title: '2.3 Cement',               description: 'Dalmia Cement' },
          { id: 'fasteners',        title: '2.4 Fasteners & Fittings', description: 'TATA Screws, Louvers...' },
        ],
      },
      {
        title: '🏗️ Use Cases',
        rows: [
          { id: 'use_cases', title: '🏗️ Use Cases', description: 'Residential, Commercial, Industrial' },
        ],
      },
    ]
  );
};

// ── Use Case Sub Menu ─────────────────────────────────────────────
const sendUseCaseMenu = async (phone) => {
  await sendListMenu(
    phone,
    `Please select a *Use Case*:`,
    'Select Use Case',
    [
      {
        title: '🏗️ Use Cases',
        rows: [
          { id: 'uc_residential', title: '3.1 Residential',  description: 'House Terraces, Balcony...' },
          { id: 'uc_commercial',  title: '3.2 Commercial',   description: 'Shops, Shelters, Cabins...' },
          { id: 'uc_industrial',  title: '3.3 Industrial',   description: 'Parking, Sheds, Godown' },
        ],
      },
    ]
  );
};

// ── Residential Sub Menu ──────────────────────────────────────────
const sendResidentialMenu = async (phone) => {
  await sendListMenu(
    phone,
    `Please select a *Residential* use case:`,
    'Select',
    [{
      title: '3.1 Residential',
      rows: [
        { id: 'uc_house_terrace', title: 'House Terraces',              description: 'Roofing for house' },
        { id: 'uc_balcony',       title: 'Balcony & Window Extensions', description: 'Balcony cover' },
        { id: 'uc_frontage',      title: 'Frontage / Backyard Area',    description: 'Front/back yard' },
      ],
    }]
  );
};

// ── Commercial Sub Menu ───────────────────────────────────────────
const sendCommercialMenu = async (phone) => {
  await sendListMenu(
    phone,
    `Please select a *Commercial* use case:`,
    'Select',
    [{
      title: '3.2 Commercial',
      rows: [
        { id: 'uc_shop',    title: 'Shop Extensions',    description: 'Shop cover' },
        { id: 'uc_transit', title: 'Transit Shelters',   description: 'Bus/auto stand' },
        { id: 'uc_cabin',   title: 'Security Cabins',    description: 'Security cabin' },
        { id: 'uc_walkway', title: 'Walkways/Corridors', description: 'Covered walkway' },
      ],
    }]
  );
};

// ── Industrial Sub Menu ───────────────────────────────────────────
const sendIndustrialMenu = async (phone) => {
  await sendListMenu(
    phone,
    `Please select an *Industrial* use case:`,
    'Select',
    [{
      title: '3.3 Industrial',
      rows: [
        { id: 'uc_parking', title: 'Car Parking / Vehicle Shed', description: 'Vehicle shed' },
        { id: 'uc_cattle',  title: 'Cattle Shed & Poultry',      description: 'Farm shed' },
        { id: 'uc_godown',  title: 'Godown',                     description: 'Storage godown' },
      ],
    }]
  );
};

// ── Handle all selections ─────────────────────────────────────────
const handleMainCategorySelection = async (phone, selectedId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  // Use Cases main → show sub list
  if (selectedId === 'use_cases') {
    lead.currentStage = 'use_case_browse';
    await lead.save();
    await sendUseCaseMenu(phone);
    return;
  }

  // Residential → show items
  if (selectedId === 'uc_residential') {
    lead.currentStage = 'use_case_browse';
    await lead.save();
    await sendResidentialMenu(phone);
    return;
  }

  // Commercial → show items
  if (selectedId === 'uc_commercial') {
    lead.currentStage = 'use_case_browse';
    await lead.save();
    await sendCommercialMenu(phone);
    return;
  }

  // Industrial → show items
  if (selectedId === 'uc_industrial') {
    lead.currentStage = 'use_case_browse';
    await lead.save();
    await sendIndustrialMenu(phone);
    return;
  }

  // Any use case item → unavailable message
  if (selectedId.startsWith('uc_')) {
    await sendText(phone,
      `⚠️ Still waiting for the product update from the customer.\nWill update once received; currently unavailable.`
    );
    await sendMainCategoryMenu(phone);
    return;
  }

  // Product selected → go to brand
  lead.productType  = selectedId;
  lead.quoteStep    = 'brand';
  lead.currentStage = 'quote_form';
  await lead.save();
  await sendBrandMenu(phone, selectedId);
};

// ── Brand Menu ────────────────────────────────────────────────────
const sendBrandMenu = async (phone, subCatId) => {
  const product = PRODUCTS[subCatId];
  if (!product) return;
  await sendListMenu(
    phone,
    `Please select *Brand / Type* for ${product.title}:`,
    'Select Brand',
    [{ title: product.title, rows: product.brands }]
  );
};

// ── Sheet Type Menu ───────────────────────────────────────────────
const sendSheetTypeMenu = async (phone) => {
  const product = PRODUCTS['roofing_sheets'];
  await sendListMenu(
    phone,
    `Please select *Sheet Type*:`,
    'Select Type',
    [{ title: 'Sheet Types', rows: product.sheetTypes }]
  );
};

// ── Thickness Menu ────────────────────────────────────────────────
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

// Legacy aliases
const sendSubCategoryMenu = sendMainCategoryMenu;
const handleSubCategorySelection = handleMainCategorySelection;
const handleProductSelection = handleMainCategorySelection;

module.exports = {
  sendMainCategoryMenu,
  sendSubCategoryMenu,
  sendBrandMenu,
  sendSheetTypeMenu,
  sendThicknessMenu,
  handleMainCategorySelection,
  handleSubCategorySelection,
  handleProductSelection,
  PRODUCTS,
};