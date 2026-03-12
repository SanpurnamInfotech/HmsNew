import React, { useState, useEffect, useMemo, useRef } from "react";
import api, { DataService } from "../../utils/domain"; 
import { useCrud, useTable, Pagination, TableToolbar } from "../../components/common/BaseCRUD";
import { 
  FaPlus, FaTrash, FaEdit, FaCheckCircle, FaTimesCircle, FaFileInvoice, 
  FaUserInjured, FaCalendarAlt, FaSearch, FaChevronDown, FaRupeeSign
} from "react-icons/fa";

// --- Internal Searchable Dropdown for Services ---
const ServiceSearchableDropdown = ({ services, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);

  const selectedService = useMemo(() => 
    services.find(s => s.opd_bill_code === value), 
    [services, value]
  );

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return services.filter(s => 
      (s.opd_bill_name || "").toLowerCase().includes(term) ||
      (s.opd_bill_code || "").toLowerCase().includes(term)
    );
  }, [services, searchTerm]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div 
        className={`form-input w-full flex justify-between items-center cursor-pointer min-h-[42px] transition-all ${isOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedService ? "text-main" : "opacity-40"}>
          {selectedService ? selectedService.opd_bill_name : placeholder}
        </span>
        <FaChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-slate-800 border rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b bg-slate-50 dark:bg-slate-900 flex items-center gap-2">
            <FaSearch size={12} className="opacity-30" />
            <input 
              autoFocus
              className="bg-transparent text-sm outline-none w-full"
              placeholder="Search service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length > 0 ? filtered.map(s => (
              <div 
                key={s.opd_bill_code}
                className="px-3 py-2 text-sm hover:bg-emerald-500/10 cursor-pointer flex justify-between items-center"
                onClick={() => {
                  onChange(s.opd_bill_code);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                <span>{s.opd_bill_name}</span>
                <span className="text-[10px] opacity-50">₹{s.opd_bill_charge}</span>
              </div>
            )) : (
              <div className="p-3 text-xs opacity-40 text-center">No service found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const OpdBilling = () => {
  const PATH = "opd-billing";
  const { data, loading, refresh, createItem, updateItem, deleteItem } = useCrud(`${PATH}/`);
  
  const [serviceMaster, setServiceMaster] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEdit, setIsEdit] = useState(false); 
  const [modal, setModal] = useState({ visible: false, message: "", type: "success" });
  const [openDropdown, setOpenDropdown] = useState(false); 
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedRow, setSelectedRow] = useState(null); 
  
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    patient_code: "",
    billing_date: new Date().toISOString().split('T')[0],
    bill_no: "",
    discount_amount: 0,
    amt_received: 0,
  });

  const [billItems, setBillItems] = useState([
    { opd_bill_code: "", opd_bill_name: "", quantity: 1, rate: 0, amount: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await DataService.getAll('patient');
        const pData = Array.isArray(pRes.data) ? pRes.data : (pRes.data.results || []);
        setPatients(pData);

        const sRes = await DataService.getAll('opd_bill_master');
        const serviceData = Array.isArray(sRes.data) ? sRes.data : (sRes.data.results || []);
        setServiceMaster(serviceData);
      } catch (err) {
        console.error("Initialization Error:", err);
      }
    };
    fetchData();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const fullName = `${p.first_name || p.patient_first_name || ''} ${p.last_name || p.patient_last_name || ''}`.toLowerCase();
      const code = (p.patient_code || '').toLowerCase();
      const search = patientSearch.toLowerCase();
      return fullName.includes(search) || code.includes(search);
    });
  }, [patients, patientSearch]);

  // CORRECTED: Display name only on select, but keep patient_code in formData
  const selectedPatientDisplay = useMemo(() => {
    const p = patients.find(p => p.patient_code === formData.patient_code);
    if (!p) return "Select Patient";
    return `${p.first_name || p.patient_first_name} ${p.last_name || p.patient_last_name}`;
  }, [patients, formData.patient_code]);

  // HELPER: Map patient_code to Name for the Table list
  const getPatientName = (pCode) => {
    const p = patients.find(pat => pat.patient_code === pCode);
    return p ? `${p.first_name || p.patient_first_name} ${p.last_name || p.patient_last_name}` : pCode;
  };

  const subTotal = useMemo(() => {
    return billItems.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [billItems]);

  const netAmount = subTotal - Number(formData.discount_amount);
  const duesAmount = netAmount - Number(formData.amt_received);

  const {
    search, setSearch, currentPage, setCurrentPage, itemsPerPage,
    setItemsPerPage, paginatedData, effectiveItemsPerPage,
    filteredData, totalPages,
  } = useTable(data || []);

  const handlePatientSelect = (pCode) => {
    setFormData({ ...formData, patient_code: pCode });
    setOpenDropdown(false);
    setPatientSearch("");
  };

  const handleItemChange = (index, field, value) => {
    const list = [...billItems];
    if (field === "opd_bill_code") {
      const selected = serviceMaster.find(m => m.opd_bill_code === value);
      if (selected) {
        list[index].opd_bill_code = selected.opd_bill_code;
        list[index].opd_bill_name = selected.opd_bill_name;
        list[index].rate = Number(selected.opd_bill_charge);
      }
    } else {
      list[index][field] = value;
    }
    list[index].amount = Number(list[index].quantity) * Number(list[index].rate);
    setBillItems(list);
  };

  const addRow = () => setBillItems([...billItems, { opd_bill_code: "", opd_bill_name: "", quantity: 1, rate: 0, amount: 0 }]);
  
  const removeRow = (index) => {
    const list = [...billItems];
    list.splice(index, 1);
    setBillItems(list);
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEdit(false);
    setSelectedRow(null);
    setFormData({ patient_code: "", billing_date: new Date().toISOString().split('T')[0], bill_no: "", discount_amount: 0, amt_received: 0 });
    setBillItems([{ opd_bill_code: "", opd_bill_name: "", quantity: 1, rate: 0, amount: 0 }]);
  };

  const handleEdit = () => {
    if (!selectedRow) return;
    setFormData({
      patient_code: selectedRow.patient_code,
      billing_date: selectedRow.billing_date,
      bill_no: selectedRow.bill_no || "",
      discount_amount: selectedRow.discount_amount,
      amt_received: selectedRow.amt_received,
    });
    setBillItems(selectedRow.bill_items || []);
    setIsEdit(true);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!selectedRow || !selectedRow.opd_billing_code) return;
    const result = await deleteItem(`${PATH}/delete/${selectedRow.opd_billing_code}/`);
    if (result.success) {
      setModal({ visible: true, message: "Bill Deleted Successfully!", type: "success" });
      setSelectedRow(null);
      refresh();
    } else {
      setModal({ visible: true, message: `Delete Failed: ${result.error}`, type: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient_code) {
      setModal({ visible: true, message: "Error: No Patient Selected", type: "error" });
      return;
    }

    const payload = {
      patient_code: formData.patient_code,
      billing_date: formData.billing_date,
      bill_no: formData.bill_no || null,
      total_amount: Number(subTotal),
      discount_amount: Number(formData.discount_amount),
      bill_amount: Number(netAmount), 
      amt_received: Number(formData.amt_received),
      dues_amount: Number(duesAmount),
      status: 1,
      bill_items: billItems.map(item => ({
        opd_bill_code: item.opd_bill_code,
        opd_bill_name: item.opd_bill_name,
        quantity: parseInt(item.quantity),
        rate: Number(item.rate),
        amount: Number(item.amount),
        status: 1
      }))
    };

    const actionPath = isEdit 
      ? `${PATH}/update/${selectedRow.opd_billing_code}/` 
      : `${PATH}/create/`;

    const result = isEdit 
      ? await updateItem(actionPath, payload)
      : await createItem(actionPath, payload);

    if (result.success) {
      setModal({ visible: true, message: `Bill ${isEdit ? 'Updated' : 'Saved'} Successfully!`, type: "success" });
      resetForm();
      refresh();
    } else {
      setModal({ visible: true, message: `Failed: ${JSON.stringify(result.error)}`, type: "error" });
    }
  };

  if (loading) return <div className="flex justify-center p-20 text-emerald-600 animate-pulse font-bold uppercase tracking-widest">Loading...</div>;

  return (
    <div className="app-container">
      {modal.visible && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
            <div className="mb-4 flex justify-center">
              {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500" /> : <FaTimesCircle className="text-6xl text-rose-500" />}
            </div>
            <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
              {modal.type === "success" ? "Success" : "Error"}
            </h3>
            <p className="mb-6 font-medium opacity-80 whitespace-pre-wrap">{modal.message}</p>
            <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>
              Continue
            </button>
          </div>
        </div>
      )}

      <div className="section-header">
        <h4 className="page-title">OPD Billing</h4>
        {!showForm && (
          <div className="flex items-center gap-2">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <FaPlus size={14} /> Create New Bill
            </button>
            {selectedRow && (
              <>
                <button className="btn-warning" onClick={handleEdit}>
                  <FaEdit size={14} /> Edit
                </button>
                <button className="btn-danger" onClick={handleDelete}>
                  <FaTrash size={14} /> Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {showForm ? (
        <div className="form-container animate-in zoom-in-95 duration-200">
           <h6 className="form-section-title uppercase tracking-tighter mb-6">
            {isEdit ? "Update Bill" : "New Patient Bill"}
          </h6>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b pb-8" style={{ borderColor: "var(--border-color)" }}>
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <label className="form-label flex items-center gap-2">
                  <FaUserInjured size={12} className="text-emerald-500" /> Patient
                </label>
                <div 
                  className={`form-input w-full flex justify-between items-center cursor-pointer p-3 rounded-lg border transition-all ${openDropdown ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`} 
                  onClick={() => !isEdit && setOpenDropdown(!openDropdown)}
                >
                  <span className={formData.patient_code ? "text-main" : "opacity-40"}>{selectedPatientDisplay}</span>
                  {!isEdit && <FaChevronDown size={12} className={`transition-transform duration-200 ${openDropdown ? 'rotate-180' : ''}`} />}
                </div>
                
                {openDropdown && (
                  <div className="absolute z-50 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden bg-white dark:bg-slate-800">
                    <div className="p-3 border-b flex items-center gap-2 bg-slate-50 dark:bg-slate-900">
                      <FaSearch className="opacity-40" size={14} />
                      <input autoFocus className="bg-transparent outline-none text-sm w-full" placeholder="Search name..." value={patientSearch} onChange={(e) => setPatientSearch(e.target.value)} />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredPatients.map(p => (
                        <div key={p.patient_code} className="px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm" onClick={() => handlePatientSelect(p.patient_code)}>
                          {p.first_name || p.patient_first_name} {p.last_name || p.patient_last_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="form-label flex items-center gap-2"><FaFileInvoice /> Bill Ref No</label>
                <input className="form-input w-full" value={formData.bill_no} onChange={e => setFormData({...formData, bill_no: e.target.value})} placeholder="Optional" />
              </div>

              <div className="space-y-1.5">
                <label className="form-label flex items-center gap-2"><FaCalendarAlt /> Billing Date</label>
                <input type="date" className="form-input w-full" value={formData.billing_date} onChange={e => setFormData({...formData, billing_date: e.target.value})} />
              </div>
            </div>

            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="opacity-50 text-[10px] uppercase tracking-widest">
                    <th className="py-3 px-2">Service Description</th>
                    <th className="py-3 px-2 w-24 text-center">Qty</th>
                    <th className="py-3 px-2 w-32 text-right">Rate</th>
                    <th className="py-3 px-2 w-32 text-right">Total</th>
                    <th className="py-3 px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                  {billItems.map((item, index) => (
                    <tr key={index}>
                      <td className="py-4 px-2">
                        <ServiceSearchableDropdown 
                          services={serviceMaster}
                          value={item.opd_bill_code}
                          placeholder="-- Select Service --"
                          onChange={(val) => handleItemChange(index, "opd_bill_code", val)}
                        />
                      </td>
                      <td className="py-4 px-2">
                        <input type="number" className="form-input w-full text-center" value={item.quantity} onChange={e => handleItemChange(index, "quantity", e.target.value)} min="1" />
                      </td>
                      <td className="py-4 px-2">
                        <input type="number" className="form-input w-full text-right" value={item.rate} onChange={e => handleItemChange(index, "rate", e.target.value)} />
                      </td>
                      <td className="py-4 px-2 text-right font-bold text-main">₹{item.amount}</td>
                      <td className="py-4 px-2">
                        {billItems.length > 1 && <button type="button" onClick={() => removeRow(index)} className="text-rose-500 hover:scale-125 transition-transform"><FaTrash size={12}/></button>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addRow} className="mt-4 flex items-center gap-2 text-xs font-bold text-emerald-500 uppercase tracking-widest">
                <FaPlus size={10} /> ADD ANOTHER SERVICE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 border-t pt-8" style={{ borderColor: "var(--border-color)" }}>
              <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10">
                <div className="flex justify-between text-2xl font-black mb-2 tracking-tighter">
                  <span className="opacity-40 uppercase">Subtotal</span>
                  <span>₹{subTotal}</span>
                </div>
                <div className="flex justify-between text-rose-500 font-bold items-center">
                  <span className="text-xs uppercase">Discount</span>
                  <div className="flex items-center gap-2">
                    <FaRupeeSign size={12}/>
                    <input type="number" className="bg-transparent text-right border-b border-rose-500/30 w-24 outline-none text-lg" value={formData.discount_amount} onChange={e => setFormData({...formData, discount_amount: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-4xl font-black text-emerald-500 tracking-tighter">
                  <span>NET BILL</span>
                  <span>₹{netAmount}</span>
                </div>
                <div className="flex justify-between items-center opacity-80">
                  <span className="font-bold uppercase text-[10px] tracking-widest">Received</span>
                  <input type="number" className="form-input w-32 text-right font-bold" value={formData.amt_received} onChange={e => setFormData({...formData, amt_received: e.target.value})} />
                </div>
                <div className="flex justify-between items-center text-rose-500 font-bold">
                  <span className="uppercase text-[10px] tracking-widest">Balance Dues</span>
                  <span className="text-xl">₹{duesAmount}</span>
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 border-t pt-8 mt-4">
                 <button type="submit" className="btn-primary px-12 py-3">{isEdit ? "Update" : "Save"}</button>
                  <button type="button" className="btn-ghost px-8" onClick={resetForm}>Cancel</button>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="data-table-container animate-in fade-in duration-500">
          <TableToolbar search={search} setSearch={setSearch} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} setCurrentPage={setCurrentPage} />
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr>
                  <th className="text-admin-th w-16"></th>
                  <th className="text-admin-th">Bill No</th>
                  <th className="text-admin-th">Patient</th>
                  <th className="text-admin-th">Date</th>
                  <th className="text-admin-th">Net Amount</th>
                  <th className="text-admin-th">Dues</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                {paginatedData.map(bill => (
                    <tr
                      key={bill.opd_billing_code}
                      onClick={() => setSelectedRow(selectedRow?.opd_billing_code === bill.opd_billing_code ? null : bill)}
                      className={`group cursor-pointer transition-colors ${
                        selectedRow?.opd_billing_code === bill.opd_billing_code ? "bg-emerald-500/10" : "hover:bg-emerald-500/5"
                      }`}
                    >
                    <td className="px-6 py-4">
                        <div className={`selection-indicator ${selectedRow?.opd_billing_code === bill.opd_billing_code ? "selection-indicator-active" : "group-hover:border-emerald-500/50"}`}>
                          {selectedRow?.opd_billing_code === bill.opd_billing_code && <div className="selection-dot" />}
                        </div>
                    </td>
                    <td className="text-admin-td">{bill.opd_billing_code}</td>
                    <td className="text-admin-td">{getPatientName(bill.patient_code)}</td>
                    <td className="text-admin-td">{bill.billing_date}</td>
                    <td className="text-admin-td ">₹{bill.bill_amount}</td>
                    <td className={`text-admin-td ${bill.dues_amount > 0 ? "text-rose-500" : "text-emerald-500"}`}>
                        {bill.dues_amount > 0 ? `₹${bill.dues_amount}` : "PAID"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination totalEntries={filteredData.length} itemsPerPage={effectiveItemsPerPage} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
};

export default OpdBilling;