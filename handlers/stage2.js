const Lead = require('../models/lead');
const { sendListMenu } = require('../utils/whatsapp');

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
    thickness: [
      { id: '0.35mm', title: '0.35mm' },
      { id: '0.40mm', title: '0.40mm' },
      { id: '0.45mm', title: '0.45mm' },
      { id: '0.47mm', title: '0.47mm' },
      { id: '0.50mm', title: '0.50mm' },
      { id: '0.60mm', title: '0.60mm' },
    ],
  },
  sheet_type: {
    title: 'Sheet Type',
    brands: [
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
  tmt_bars: {
    title: 'TMT Bars',
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
  cement: {
    title: 'Cement',
    brands: [
      { id: 'dalmia', title: 'Dalmia' },
    ],
    thickness: [],
  },
  steel_pipes: {
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
  accessories: {
    title: 'Accessories',
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

// ── Send Product Category List ────────────────────────────────────
const sendProductMenu = async (phone) => {
  await sendListMenu(
    phone,
    `Please select the *Product Category*:`,
    'Select Product',
    [{
      title: 'Our Products',
      rows: [
        { id: 'roofing_sheets', title: 'Roofing Sheets' },
        { id: 'sheet_type',     title: 'Sheet Type' },
        { id: 'roofing_acc',    title: 'Roofing Accessories' },
        { id: 'tmt_bars',       title: 'TMT Bars' },
        { id: 'cement',         title: 'Cement' },
        { id: 'steel_pipes',    title: 'Steel Pipes' },
        { id: 'fibre_boards',   title: 'Fibre Cement Boards' },
        { id: 'accessories',    title: 'Accessories' },
      ],
    }]
  );
};

// ── Send Brand/Type List ──────────────────────────────────────────
const sendBrandMenu = async (phone, productId) => {
  const product = PRODUCTS[productId];
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

// ── Send Thickness/Size List ──────────────────────────────────────
const sendThicknessMenu = async (phone, productId) => {
  const product = PRODUCTS[productId];
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

// ── Handle Product Selection ──────────────────────────────────────
const handleProductSelection = async (phone, productId) => {
  const lead = await Lead.findOne({ phone });
  if (!lead) return;

  lead.productType  = productId;
  lead.quoteStep    = 'brand';
  lead.currentStage = 'quote_form';
  await lead.save();

  console.log(`✅ Product selected for ${phone}: ${productId}`);
  await sendBrandMenu(phone, productId);
};

module.exports = { sendProductMenu, sendBrandMenu, sendThicknessMenu, handleProductSelection, PRODUCTS };