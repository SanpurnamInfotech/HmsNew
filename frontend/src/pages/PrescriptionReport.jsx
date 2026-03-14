import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Changed: Import the configured api instance and DataService
import api, { DataService } from '../utils/domain'; 
import { 
  FaSearch, 
  FaPrint, 
  FaPrescription, 
  FaUser, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaChevronDown,
  FaFileDownload
} from "react-icons/fa";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

        {/* Inline print styles to ensure only the report is visible during print */}
        <style>{`
            @media print {
                body * {
                    visibility: hidden;
                }
                .print-report-only, .print-report-only * {
                    visibility: visible !important;
                }
                .print-report-only {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100vw;
                    background: white;
                    z-index: 9999;
                }
            }
        `}</style>

const PrescriptionReport = () => {
    /* ================= STATE MANAGEMENT ================= */
    const [patients, setPatients] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    
    // UI States for Custom Dropdown
    const [openDropdown, setOpenDropdown] = useState(false); 
    const [patientSearch, setPatientSearch] = useState("");
    const dropdownRef = useRef(null);
    const reportRef = useRef(null); // Reference for PDF export

    const [modal, setModal] = useState({ visible: false, message: "", type: "success" });

    /* ================= FETCHING DATA ================= */
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // Corrected: Using DataService.getAll for 'patient'
                const res = await DataService.getAll('patient'); 
                const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
                setPatients(data);
            } catch (err) {
                console.error("Patient Fetch Error:", err);
            }
        };

        fetchPatients();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    /* ================= LOGIC HELPERS ================= */
    const filteredPatients = useMemo(() => {
        if (!patients) return [];
        return patients.filter(p => {
            const fullName = `${p.first_name || p.patient_first_name || ''} ${p.last_name || p.patient_last_name || ''}`.toLowerCase();
            const code = (p.patient_code || '').toLowerCase();
            const search = patientSearch.toLowerCase();
            return fullName.includes(search) || code.includes(search);
        });
    }, [patients, patientSearch]);

    const selectedPatientName = useMemo(() => {
        const p = patients.find(p => p.patient_code === selectedPatient);
        if (!p) return "Select Patient";
        const fName = p.first_name || p.patient_first_name || '';
        const lName = p.last_name || p.patient_last_name || '';
        return `${fName} ${lName}`;
    }, [patients, selectedPatient]);

    /* ================= EVENT HANDLERS ================= */
    const handlePatientSelect = async (pCode) => {
        setSelectedPatient(pCode);
        setOpenDropdown(false);
        setPatientSearch("");
        setSelectedDate('');
        setReportData(null);
        setAvailableDates([]);

        if (pCode) {
            try {
                // Corrected: Using api instance for specific custom endpoint
                const res = await api.get(`patient-dates/${pCode}/`);
                setAvailableDates(res.data.dates || []);
            } catch (err) {
                console.error("Error fetching dates:", err);
                setAvailableDates([]);
            }
        }
    };

    const navigate = useNavigate();
    const handleSearch = async () => {
        if (!selectedPatient || !selectedDate) {
            setModal({ visible: true, message: "Please select both patient and date", type: "error" });
            return;
        }
        setLoading(true);
        try {
            const res = await DataService.getAll('prescription-report', {
                patientCode: selectedPatient,
                date: selectedDate
            });
            setReportData(res.data);
        } catch (err) {
            const errorMsg = err.response?.data?.error || "No prescription details found";
            setModal({ visible: true, message: errorMsg, type: "error" });
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = async () => {
        if (!reportData) return;
        setDownloading(true);
        
        try {
            // Call backend API to generate PDF
            const response = await api.get('prescription-pdf', {
                params: {
                    patientCode: selectedPatient,
                    date: selectedDate
                },
                responseType: 'blob' // Important for file downloads
            });
            
            // Create blob from response
            const blob = new Blob([response.data], { type: 'application/pdf' });
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Prescription_${selectedPatient}_${selectedDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            setModal({ visible: true, message: "PDF downloaded successfully!", type: "success" });
        } catch (error) {
            console.error("PDF Download Error:", error);
            // Fallback to client-side generation if backend PDF endpoint doesn't exist yet
            await downloadPDFFallback();
        } finally {
            setDownloading(false);
        }
    };
    
    // Fallback method using html2canvas (client-side)
    const downloadPDFFallback = async () => {
        if (!reportRef.current) return;
        
        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff"
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Prescription_${selectedPatient}_${selectedDate}.pdf`);
        } catch (error) {
            console.error("PDF Generation Error:", error);
            // setModal({ visible: true, message: "Failed to generate PDF", type: "error" });
        }
    };
    const hasPrescriptionOnDate = useMemo(() => {
        return availableDates.includes(selectedDate);
    }, [availableDates, selectedDate]);

    return (
                <div className="app-container">
                        {/* Inline print styles */}
                        <style>{`
                            @media print {
                                body * {
                                    visibility: hidden;
                                }
                                .print-report-only, .print-report-only * {
                                    visibility: visible !important;
                                }
                                .print-report-only {
                                    position: absolute;
                                    left: 0;
                                    top: 0;
                                    width: 100vw;
                                    background: white;
                                    z-index: 9999;
                                }
                            }
                        `}</style>
            {/* MODAL */}
            {modal.visible && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="form-container max-w-sm w-full p-8 text-center animate-in zoom-in-95 duration-200 shadow-2xl">
                        <div className="mb-4 flex justify-center">
                            {modal.type === "success" ? <FaCheckCircle className="text-6xl text-emerald-500" /> : <FaTimesCircle className="text-6xl text-rose-500" />}
                        </div>
                        <h3 className={`text-xl font-black mb-2 uppercase tracking-tight ${modal.type === "success" ? "text-emerald-500" : "text-rose-500"}`}>
                            {modal.type === "success" ? "Success" : "Error"}
                        </h3>
                        <p className="mb-6 font-medium opacity-80">{modal.message}</p>
                        <button className="btn-primary w-full justify-center py-3" onClick={() => setModal({ ...modal, visible: false })}>
                            Continue
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="section-header print:hidden">
                <h4 className="page-title flex items-center gap-2">
                    <FaPrescription className="text-emerald-500" /> Prescription Report
                </h4>
            </div>

            {/* FILTERS SECTION */}
            {!reportData && (
                <div className="form-container mb-6 animate-in fade-in duration-500 print:hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        {/* SEARCHABLE PATIENT DROPDOWN */}
                        <div className="space-y-1.5 relative" ref={dropdownRef}>
                            <label className="form-label flex items-center gap-2 text-sm font-semibold">
                                <FaUser size={12} className="text-emerald-500" /> Select Patient
                            </label>
                            <div 
                                className={`form-input w-full flex justify-between items-center cursor-pointer p-3 rounded-lg border transition-all ${openDropdown ? 'border-emerald-500 ring-2 ring-emerald-500/20' : ''}`} 
                                onClick={() => setOpenDropdown(!openDropdown)}
                            >
                                <span className={selectedPatient ? "text-main" : "opacity-40"}>{selectedPatientName}</span>
                                <FaChevronDown size={12} className={`transition-transform duration-200 ${openDropdown ? 'rotate-180' : ''}`} />
                            </div>
                            {openDropdown && (
                                <div className="absolute z-50 w-full mt-2 rounded-xl shadow-2xl border overflow-hidden bg-white dark:bg-slate-800">
                                    <div className="p-3 border-b flex items-center gap-2 bg-slate-50 dark:bg-slate-900">
                                        <FaSearch className="opacity-40" size={14} />
                                        <input 
                                            autoFocus 
                                            className="bg-transparent outline-none text-sm w-full" 
                                            placeholder="Search name or code..." 
                                            value={patientSearch} 
                                            onChange={(e) => setPatientSearch(e.target.value)} 
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto">
                                        {filteredPatients.length > 0 ? (
                                            filteredPatients.map(p => (
                                                <div 
                                                    key={p.patient_code} 
                                                    className={`px-4 py-3 hover:bg-emerald-500/10 cursor-pointer text-sm transition-colors ${selectedPatient === p.patient_code ? 'bg-emerald-500/20 text-emerald-500 font-bold' : ''}`} 
                                                    onClick={() => handlePatientSelect(p.patient_code)}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span>{p.first_name || p.patient_first_name} {p.last_name || p.patient_last_name}</span>
                                                        <span className="text-[10px] opacity-50 px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 tracking-widest">{p.patient_code}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="px-4 py-8 text-center text-xs opacity-40 italic">No patients found</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* DATE SELECT */}
                        <div className="space-y-1.5">
                            <label className="form-label flex items-center justify-between text-sm font-semibold">
                                <span className="flex items-center gap-2">
                                    <FaCalendarAlt size={12} className="text-emerald-500" /> Select Date
                                </span>
                                {selectedDate && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${hasPrescriptionOnDate ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {hasPrescriptionOnDate ? "Prescription Found" : "No Record"}
                                    </span>
                                )}
                            </label>
                            <input 
                                type="date"
                                className="form-input w-full cursor-pointer p-3 rounded-lg border focus:border-emerald-500 outline-none" 
                                value={selectedDate} 
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <button
                            className="btn-primary flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-all"
                            onClick={handleSearch} 
                            disabled={loading || !selectedPatient || !selectedDate}
                        >
                            {loading ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Processing...</>
                            ) : (
                                <><FaSearch size={14} /> Generate Report</>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* REPORT VIEW */}
            {reportData ? (
                <div className="print-report-only">
                    <div className="flex gap-2 justify-end mb-4 print:hidden">
                        <button className="btn-secondary flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors" onClick={downloadPDF} disabled={downloading}>
                            {downloading ? "Generating..." : <><FaFileDownload size={14} /> Download PDF</>}
                        </button>
                        <button className="btn-primary flex items-center gap-2" onClick={() => window.print()}>
                            <FaPrint size={14} /> Print
                        </button>
                    </div>
                    <div ref={reportRef} className="bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300 mx-auto max-w-4xl border border-slate-200 print:border-0 print:shadow-none" style={{marginTop: 32, marginBottom: 32}}>
                        {/* HEADER: Hospital Info */}
                        <div className="p-8 text-center bg-slate-50 border-b border-slate-200">
                            <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-1">{reportData.hospital?.name || 'SMS hospital'}</h2>
                            <p className="font-bold text-emerald-600 mb-1">{reportData.hospital?.subtitle || 'B/503, Business Center, MG Road, Pune - 411100.'}</p>
                            <p className="text-sm text-slate-500">Ph: {reportData.hospital?.phone || '5465647658'}, Timing: {reportData.hospital?.timing || '09:00 AM - 01:00 PM, 06:00 PM - 08:00 PM | Closed: Sunday'}</p>
                        </div>
                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl mb-8 border border-slate-100">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Patient Details</p>
                                    <p className="text-lg font-bold">
                                        {reportData.patient_details?.full_name || 'N/A'}
                                        <span className="text-slate-400 font-medium ml-2">
                                            ({reportData.patient_details?.age ? `${reportData.patient_details.age}Y` : 'N/A'}, {reportData.patient_details?.sex || 'N/A'})
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">ID: {reportData.patient_details?.id || 'N/A'} | Mob: {reportData.patient_details?.mobile || 'N/A'}</p>
                                    <p className="text-xs text-slate-500 mt-1">Address: {reportData.patient_details?.address || 'N/A'}</p>
                                    <p className="text-xs text-slate-500 mt-1">Weight (Kg): {reportData.patient_details?.weight || 'N/A'}, Height (Cm): {reportData.patient_details?.height || 'N/A'}, BP: {reportData.patient_details?.bp || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Prescription Date</p>
                                    <p className="text-lg font-bold text-slate-700">{reportData.prescription_date || selectedDate}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Chief Complaints</p>
                                    <ul className="list-disc ml-4 text-sm">
                                        {reportData.chief_complaints && reportData.chief_complaints.length > 0 ? (
                                            reportData.chief_complaints.map((c, idx) => <li key={idx}>{c}</li>)
                                        ) : <li>N/A</li>}
                                    </ul>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Clinical Findings</p>
                                    <ul className="list-disc ml-4 text-sm">
                                        {reportData.clinical_findings && reportData.clinical_findings.length > 0 ? (
                                            reportData.clinical_findings.map((f, idx) => <li key={idx}>{f}</li>)
                                        ) : <li>N/A</li>}
                                    </ul>
                                </div>
                            </div>
                            <div className="mb-4">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Diagnosis</p>
                                <p className="text-sm font-bold text-slate-700">{reportData.diagnosis || 'N/A'}</p>
                            </div>
                            <div className="overflow-hidden border border-slate-200 rounded-xl mb-8">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-800 text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left w-12">#</th>
                                            <th className="px-4 py-3 text-left">Medicine Name</th>
                                            <th className="px-4 py-3 text-left">Dosage</th>
                                            <th className="px-4 py-3 text-left">Duration</th>
                                            <th className="px-4 py-3 text-left">Instructions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reportData.items && reportData.items.length > 0 ? (
                                            reportData.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-4 py-4 text-slate-400 font-medium">{index + 1}</td>
                                                    <td className="px-4 py-4 font-bold text-slate-800">{item.medicine_name || 'N/A'}</td>
                                                    <td className="px-4 py-4 font-bold text-emerald-600">{item.dosage || 'N/A'}</td>
                                                    <td className="px-4 py-4 text-slate-600">{item.duration || 'N/A'}</td>
                                                    <td className="px-4 py-4 italic text-slate-500 text-xs">{item.instructions || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="px-4 py-8 text-center text-sm text-slate-400 italic">No medications found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                                <div className="text-center">
                                    <div className="h-16 w-40 border-b border-slate-300 mb-2 mx-auto"></div>
                                    <p className="text-lg font-black text-slate-800 uppercase tracking-tighter">
                                        {reportData.doctor_details?.name || 'Dr. Akshara'}
                                    </p>
                                    <p className="text-xs font-bold text-emerald-600">
                                        {reportData.doctor_details?.degree || 'M.S.'}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Reg. No: {reportData.doctor_details?.reg_no || 'MMC 2018'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 opacity-10">
                    <FaPrescription size={80} className="mb-4" />
                    <p className="text-xl font-black uppercase tracking-widest text-emerald-500">Select details to view report</p>
                </div>
            )}
        </div>
    );
};

export default PrescriptionReport;