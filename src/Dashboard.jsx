import { useState, useEffect } from "react";

const API_URL = "https://whatsapp-ai-chatbot-w5cx.onrender.com/api/leads";

const STATUS_COLORS = {
  completed:       { bg: "#0d2b1a", text: "#22c55e", dot: "#22c55e" },
  quote_form:      { bg: "#1a1a0d", text: "#eab308", dot: "#eab308" },
  main_category:   { bg: "#0d1a2b", text: "#3b82f6", dot: "#3b82f6" },
  sub_category:    { bg: "#0d1a2b", text: "#60a5fa", dot: "#60a5fa" },
  use_case_action: { bg: "#1a0d2b", text: "#a855f7", dot: "#a855f7" },
  greeting:        { bg: "#1a1a1a", text: "#9ca3af", dot: "#9ca3af" },
};

const getStatus = (stage) => STATUS_COLORS[stage] || STATUS_COLORS.greeting;

const PRODUCT_LABELS = {
  roofing_sheets:     "Roofing Sheets",
  roofing_acc:        "Roofing Accessories",
  fibre_boards:       "Fibre Cement Boards",
  structural_steel:   "Structural Steel",
  pipes:              "Steel Pipes",
  cement:             "Cement",
  fasteners:          "Fasteners & Fittings",
  uc_residential:     "Residential",
  uc_commercial:      "Commercial",
  uc_industrial_agri: "Industrial/Agri",
};

const BRAND_LABELS = {
  jsw_everglow:   "JSW Everglow",
  jsw_colouron:   "JSW Colouron+",
  jsw_pragati:    "JSW Pragati+",
  jsw_silveron:   "JSW Silveron+",
  jsw_vishwas:    "JSW Vishwas+",
  jsw_colorvista: "JSW ColorVista",
  l_corner:       "JSW L Corner",
  gutter:         "Gutter",
  ridge:          "Ridge",
  l_flashing:     "L Flashing",
  down_pipe:      "Down Pipe",
  barge_cap:      "Barge Cap",
  everest_standard: "Everest Standard Board",
  everest_hd:     "Everest HD Board",
  ars550d:        "ARS550D TMT Bars",
  ms_pipes:       "MS Pipes",
  gp_pipes:       "GP Pipes",
  dalmia:         "Dalmia Cement",
  tata_screws:    "TATA Screws",
  louvers:        "Louvers",
  roof_ventilators: "Roof Ventilators",
  thoovanam:      "Thoovanam",
  mugappu:        "Mugappu",
};

const SHEET_TYPE_LABELS = {
  profile_sheet:       "Profile Sheet",
  crimp_sheet:         "Crimp Sheet",
  arch_sheet:          "Arch Sheet",
  profile_ridge_sheet: "Profile Ridge Sheet",
  plain_sheet:         "Plain Sheet",
};

export default function Dashboard() {
  const [leads, setLeads]             = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [search, setSearch]           = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [selected, setSelected]       = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let result = leads;
    if (stageFilter !== "all")
      result = result.filter((l) => l.currentStage === stageFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.phone?.includes(q) ||
          l.name?.toLowerCase().includes(q) ||
          l.customerName?.toLowerCase().includes(q) ||
          l.customerPhone?.includes(q) ||
          PRODUCT_LABELS[l.productType]?.toLowerCase().includes(q) ||
          l.deliveryPincode?.includes(q)
      );
    }
    setFiltered(result);
  }, [leads, search, stageFilter]);

  const fetchLeads = async () => {
    try {
      const res  = await fetch(API_URL);
      const data = await res.json();
      setLeads(data);
      setError(null);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch {
      setError("Failed to connect to server. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total:     leads.length,
    completed: leads.filter((l) => l.currentStage === "completed").length,
    active:    leads.filter((l) => l.currentStage === "quote_form").length,
    today:     leads.filter(
      (l) => new Date(l.createdAt).toDateString() === new Date().toDateString()
    ).length,
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.logo}>🏗️ Shree SivaBalaaji Steels</div>
          <div style={s.subtitle}>
            WhatsApp Lead Dashboard
            {lastUpdated && (
              <span style={{ marginLeft: 12, color: "#4b5563" }}>
                Last updated: {lastUpdated}
              </span>
            )}
          </div>
        </div>
        <button onClick={fetchLeads} style={s.refreshBtn}>⟳ Refresh</button>
      </div>

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: "Total Leads",  value: stats.total,     color: "#60a5fa" },
          { label: "Completed",    value: stats.completed, color: "#22c55e" },
          { label: "In Progress",  value: stats.active,    color: "#eab308" },
          { label: "Today",        value: stats.today,     color: "#f97316" },
        ].map((stat) => (
          <div key={stat.label} style={s.statCard}>
            <div style={{ ...s.statValue, color: stat.color }}>{stat.value}</div>
            <div style={s.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filterRow}>
        <input
          placeholder="🔍  Search name, phone, pincode, product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={s.searchInput}
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          style={s.select}
        >
          <option value="all">All Stages</option>
          <option value="completed">Completed</option>
          <option value="quote_form">Quote Form</option>
          <option value="main_category">Main Category</option>
          <option value="sub_category">Sub Category</option>
          <option value="use_case_action">Use Case</option>
          <option value="greeting">Greeting</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={s.center}>⏳ Loading leads...</div>
      ) : error ? (
        <div style={{ ...s.center, color: "#ef4444" }}>❌ {error}</div>
      ) : (
        <div style={s.tableWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                {["#","WA Name","Customer Name","Phone","Product","Brand","Sheet Type","Size","Pincode","Stage","Date"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ ...s.td, textAlign: "center", color: "#6b7280", padding: "40px" }}>
                    No leads found
                  </td>
                </tr>
              ) : (
                filtered.map((lead, i) => {
                  const st = getStatus(lead.currentStage);
                  return (
                    <tr
                      key={lead._id}
                      style={s.tr}
                      onClick={() => setSelected(lead)}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1f2937")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={s.td}>{i + 1}</td>
                      <td style={s.td}>{lead.name || "-"}</td>
                      <td style={{ ...s.td, color: "#f9fafb", fontWeight: 600 }}>
                        {lead.customerName || "-"}
                      </td>
                      <td style={s.td}>{lead.phone}</td>
                      <td style={s.td}>{PRODUCT_LABELS[lead.productType] || lead.productType || "-"}</td>
                      <td style={s.td}>{BRAND_LABELS[lead.selectedBrand] || lead.selectedBrand || "-"}</td>
                      <td style={s.td}>{SHEET_TYPE_LABELS[lead.selectedSheetType] || lead.selectedSheetType || "-"}</td>
                      <td style={s.td}>{lead.selectedThickness || "-"}</td>
                      <td style={s.td}>{lead.deliveryPincode || "-"}</td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, background: st.bg, color: st.text }}>
                          <span style={{ ...s.dot, background: st.dot }} />
                          {lead.currentStage}
                        </span>
                      </td>
                      <td style={s.td}>{formatDate(lead.updatedAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div style={s.overlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <div style={s.modalTitle}>📋 Lead Details</div>
              <button onClick={() => setSelected(null)} style={s.closeBtn}>✕</button>
            </div>
            <div style={s.modalGrid}>
              {[
                ["WhatsApp Name",   selected.name],
                ["Customer Name",   selected.customerName],
                ["Customer Phone",  selected.customerPhone],
                ["WhatsApp Number", selected.phone],
                ["Product",         PRODUCT_LABELS[selected.productType] || selected.productType],
                ["Brand",           BRAND_LABELS[selected.selectedBrand] || selected.selectedBrand],
                ["Sheet Type",      SHEET_TYPE_LABELS[selected.selectedSheetType] || selected.selectedSheetType],
                ["Size/Thickness",  selected.selectedThickness],
                ["Pincode",         selected.deliveryPincode],
                ["Current Stage",   selected.currentStage],
                ["Quote Step",      selected.quoteStep],
                ["Created",         formatDate(selected.createdAt)],
                ["Updated",         formatDate(selected.updatedAt)],
              ].map(([label, value]) => (
                <div key={label} style={s.modalRow}>
                  <div style={s.modalLabel}>{label}</div>
                  <div style={s.modalValue}>{value || "-"}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "#0a0a0a",
    color: "#f9fafb",
    fontFamily: "'IBM Plex Mono', monospace",
    padding: "24px",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
    borderBottom: "1px solid #1f2937",
    paddingBottom: "20px",
  },
  logo:     { fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px" },
  subtitle: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  refreshBtn: {
    background: "#1f2937",
    color: "#9ca3af",
    border: "1px solid #374151",
    borderRadius: "8px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "13px",
    fontFamily: "inherit",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  },
  statCard: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
  },
  statValue: { fontSize: "32px", fontWeight: "700" },
  statLabel: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  filterRow: { display: "flex", gap: "12px", marginBottom: "20px" },
  searchInput: {
    flex: 1,
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    padding: "10px 16px",
    color: "#f9fafb",
    fontSize: "13px",
    outline: "none",
    fontFamily: "inherit",
  },
  select: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "8px",
    padding: "10px 16px",
    color: "#f9fafb",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  tableWrap: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "12px",
    overflow: "auto",
  },
  table:  { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: "11px",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #1f2937",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #1f2937", cursor: "pointer", transition: "background 0.15s" },
  td: { padding: "12px 16px", fontSize: "13px", color: "#d1d5db", whiteSpace: "nowrap" },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  dot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
  center: { textAlign: "center", padding: "60px", color: "#6b7280", fontSize: "14px" },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  modal: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "24px",
    width: "520px",
    maxHeight: "85vh",
    overflowY: "auto",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  modalTitle: { fontSize: "16px", fontWeight: "700" },
  closeBtn: {
    background: "transparent",
    border: "none",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: "20px",
    fontFamily: "inherit",
  },
  modalGrid: { display: "flex", flexDirection: "column", gap: "4px" },
  modalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #1f2937",
  },
  modalLabel: { fontSize: "12px", color: "#6b7280" },
  modalValue: { fontSize: "13px", color: "#f9fafb", fontWeight: "500", textAlign: "right" },
};

