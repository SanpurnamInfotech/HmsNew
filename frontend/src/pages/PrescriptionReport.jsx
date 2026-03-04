import React, { useState, useEffect } from 'react';
import api from "../utils/domain"; 
import { FaPrint, FaArrowLeft, FaFileMedical } from 'react-icons/fa';

const PrescriptionReport = ({ prescriptionCode, onBack }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (prescriptionCode) {
      fetchPrescriptionData();
    }
  }, [prescriptionCode]);

  const fetchPrescriptionData = async () => {
    try {
      setLoading(true);
      // Ensure the endpoint matches your Django urls.py
      const response = await api.get(`prescription-report/${prescriptionCode}/`);
      setData(response.data);
      setError(null);
    } catch (err) {
      console.error("Report Fetch Error:", err);
      setError(err.response?.data?.error || "Prescription record not found.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      <p className="text-gray-500 font-medium animate-pulse">Generating Report...</p>
    </div>
  );

  if (error || !data) return (
    <div className="p-8 text-center bg-white rounded-xl shadow-sm border border-gray-100 max-w-md mx-auto mt-10">
      <p className="text-red-500 font-bold mb-4">{error || "No data available"}</p>
      <button onClick={onBack} className="text-emerald-600 flex items-center gap-2 mx-auto hover:underline font-semibold">
        <FaArrowLeft size={12}/> Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="app-container max-w-5xl mx-auto p-4">
      {/* 1. PRINT STYLES */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; margin: 0; padding: 0; }
          .print-hidden { display: none !important; }
          .report-shadow { box-shadow: none !important; border: none !important; }
          .app-container { max-width: 100% !important; width: 100% !important; padding: 0 !important; margin: 0 !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}} />

      {/* 2. ACTION BAR */}
      <div className="flex justify-between items-center mb-6 print-hidden bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 font-semibold transition px-3 py-2"
        >
          <FaArrowLeft size={14} /> Back to List
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition transform active:scale-95"
        >
          <FaPrint size={14} /> Print / Download PDF
        </button>
      </div>

      {/* 3. THE REPORT DOCUMENT */}
      <div className="bg-white shadow-2xl rounded-sm border border-gray-200 report-shadow overflow-hidden">
        <div className="p-10" id="printable-report">
          
          {/* HEADER */}
          <div className="flex justify-between items-start border-b-4 border-emerald-600 pb-8 mb-8">
            <div className="flex items-center gap-5">
              <div className="bg-emerald-600 p-4 rounded-2xl text-white">
                <FaFileMedical size={44} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-1 uppercase">Life-Care Hospital</h1>
                <p className="text-sm text-emerald-700 font-bold uppercase tracking-wider">Professional Medical Services</p>
                <p className="text-[11px] text-gray-400 font-medium">Nipani, Karnataka | 24/7 Helpline: +91 0000 000 000</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gray-800 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest inline-block mb-3">Medical Prescription</div>
              <p className="text-sm font-black text-gray-800 uppercase">No: {data.prescription_code}</p>
              <p className="text-xs text-gray-500 font-bold uppercase">Date: {data.prescription_date ? new Date(data.prescription_date).toLocaleDateString('en-GB') : "N/A"}</p>
            </div>
          </div>

          {/* PATIENT & DOCTOR INFO */}
          <div className="grid grid-cols-2 gap-0 mb-10 border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 bg-gray-50/50 border-r border-gray-100">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Patient Information</span>
              <p className="text-xl font-bold text-gray-900 mb-1">{data.patient_name || "Unknown Patient"}</p>
              <p className="text-xs font-bold text-gray-500 uppercase">ID: {data.patient_code || "N/A"}</p>
            </div>
            <div className="p-6 text-right">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Consulting Doctor</span>
              <p className="text-xl font-bold text-gray-900 mb-1">Dr. {data.doctor_name || "General Practitioner"}</p>
              <p className="text-xs font-medium text-gray-500 italic">Registration: {data.doctor_code || "N/A"}</p>
            </div>
          </div>

          {/* CLINICAL OBSERVATIONS */}
          <div className="grid grid-cols-2 gap-8 mb-10 px-2">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Symptoms & Complaints</h3>
              <p className="text-gray-700 text-sm leading-relaxed border-l-2 border-gray-100 pl-4 min-h-[50px] whitespace-pre-wrap">
                {data.symptoms || "No symptoms recorded."}
              </p>
            </div>
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Diagnosis</h3>
              <p className="text-gray-800 text-sm font-bold leading-relaxed border-l-2 border-emerald-500 pl-4 min-h-[50px] whitespace-pre-wrap">
                {data.diagnosis || "General Consultation"}
              </p>
            </div>
          </div>

          {/* MEDICATION TABLE */}
          <div className="mb-12">
            <div className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
               <span className="bg-gray-900 text-white px-2 py-0.5">Rx</span> Prescribed Medications
            </div>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="py-3 px-4 text-[10px] font-black uppercase text-left text-gray-600">Medicine Name</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase text-left text-gray-600">Dosage</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase text-left text-gray-600">Duration</th>
                  <th className="py-3 px-4 text-[10px] font-black uppercase text-right text-gray-600">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 border-b border-gray-100">
                {data.items && data.items.length > 0 ? (
                  data.items.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-gray-900">{item.medicine_name}</p>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700 font-bold">{item.dosage}</td>
                      <td className="py-4 px-4 text-sm text-gray-600">{item.duration}</td>
                      <td className="py-4 px-4 text-sm text-gray-900 text-right italic font-medium">
                        {item.instructions ? `"${item.instructions}"` : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-400 italic">No medications prescribed.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER & SIGNATURE */}
          <div className="mt-24 flex justify-between items-end">
            <div className="text-[10px] text-gray-400 font-medium space-y-1">
              <p className="text-emerald-700 font-bold text-xs mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Next Visit: {data.next_visit_date ? new Date(data.next_visit_date).toLocaleDateString('en-GB') : 'As required'}
              </p>
              <p>Generated digitally on: {new Date().toLocaleString('en-GB')}</p>
              <p className="italic">Auth ID: {data.prescription_code}-{data.doctor_code?.substring(0,3)}</p>
            </div>
            
            <div className="text-center min-w-[200px]">
              <div className="w-full border-b border-gray-400 mb-2"></div>
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Authorized Signature</p>
              <p className="text-[10px] text-emerald-600 font-bold uppercase">Dr. {data.doctor_name}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[10px] text-gray-400 mt-6 print-hidden">
        Standard electronic prescription - No physical signature required unless specified.
      </p>
    </div>
  );
};

export default PrescriptionReport;