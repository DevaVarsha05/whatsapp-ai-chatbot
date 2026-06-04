require('dotenv').config();
const mongoose = require('mongoose');

// ── Connect MongoDB ───────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => { console.error('❌ Error:', err); process.exit(1); });

// ── Product Schema ────────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  category:  { type: String, required: true },
  brands:    [String],
  thickness: [String],
});

const Product = mongoose.model('Product', productSchema);

// ── Product Data (from your table) ───────────────────────────────
const products = [
  {
    category: 'Roofing Sheets',
    brands:   ['JSW Everglow', 'JSW Colouron+', 'JSW Pragati+', 'JSW Silveron+', 'JSW Vishwas+', 'JSW ColorVista'],
    thickness: ['0.35mm', '0.40mm', '0.45mm', '0.47mm', '0.50mm', '0.60mm'],
  },
  {
    category: 'Sheet Type',
    brands:   ['Profile Sheet', 'Crimp Sheet', 'Arch Sheet', 'Profile Ridge Sheet', 'Plain Sheet'],
    thickness: ['0.35mm', '0.40mm', '0.45mm', '0.47mm', '0.50mm', '0.60mm'],
  },
  {
    category: 'Roofing Accessories',
    brands:   ['JSW L Corner', 'Gutter', 'Ridge', 'L Flashing', 'Down Pipe', 'Barge Cap'],
    thickness: ['0.35mm', '0.40mm', '0.45mm', '0.47mm', '0.50mm', '0.60mm'],
  },
  {
    category: 'TMT Bars',
    brands:   ['ARS550D TMT Bars'],
    thickness: ['8mm', '10mm', '12mm', '16mm', '20mm'],
  },
  {
    category: 'Cement',
    brands:   ['Dalmia'],
    thickness: [],
  },
  {
    category: 'Steel Pipes',
    brands:   ['MS Pipes', 'GP Pipes'],
    thickness: ['1mm', '1.2mm', '1.6mm', '2mm', '2.5mm', '3mm', '4mm'],
  },
  {
    category: 'Fibre Cement Boards',
    brands:   ['Everest Standard Board', 'Everest HD Board'],
    thickness: ['6mm', '8mm', '10mm'],
  },
  {
    category: 'Accessories',
    brands:   ['TATA Screws', 'Louvers', 'Roof Ventilators', 'Thoovanam', 'Mugappu'],
    thickness: ['Screw 19mm', 'Screw 25mm', 'Screw 55mm', 'Thoovanam 6"', 'Thoovanam 8"'],
  },
];

// ── Insert Data ───────────────────────────────────────────────────
const seedDB = async () => {
  try {
    await Product.deleteMany({}); // Clear old data
    await Product.insertMany(products);
    console.log('✅ Products inserted successfully!');
    console.log(`📦 Total: ${products.length} products added`);
    products.forEach(p => console.log(`   • ${p.category}`));
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Insert Error:', err.message);
    mongoose.connection.close();
  }
};

seedDB();
