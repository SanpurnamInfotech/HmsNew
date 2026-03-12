import React, { useEffect, useRef } from 'react';
import { FaPrint, FaFileDownload } from "react-icons/fa";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ReportView = ({ reportData }) => {
    const reportRef = useRef(null);

    useEffect(() => {
        // Scroll to top when mounted
        window.scrollTo(0, 0);
    }, []);

    const handlePrint = () => {
    window.print();
};

    const downloadPDF = async () => {
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
            pdf.save(`Prescription_${reportData?.patient_details?.id || 'report'}.pdf`);
        } catch (error) {
            alert("Failed to generate PDF");
        }
    };

    if (!reportData) return <div className="flex flex-col items-center justify-center py-24 opacity-10">
        <p className="text-xl font-black uppercase tracking-widest text-emerald-500">No report data</p>
    </div>;

    return (
        <div className="bg-white text-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-300 mx-auto max-w-4xl border border-slate-200 print:border-0 print:shadow-none" style={{marginTop: 32, marginBottom: 32}}>
            {/* HEADER: Hospital Info */}
            <div className="p-8 text-center bg-slate-50 border-b border-slate-200">
                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-1">{reportData.hospital?.name || 'SMS hospital'}</h2>
                <p className="font-bold text-emerald-600 mb-1">{reportData.hospital?.subtitle || 'B/503, Business Center, MG Road, Pune - 411100.'}</p>
                <p className="text-sm text-slate-500">Ph: {reportData.hospital?.phone || '5465647658'}, Timing: {reportData.hospital?.timing || '09:00 AM - 01:00 PM, 06:00 PM - 08:00 PM | Closed: Sunday'}</p>
            </div>
            <div className="p-8" ref={reportRef}>
                {/* ...existing report rendering code from PrescriptionReport.jsx... */}
                {/* Patient & Prescription Details */}
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
                        <p className="text-lg font-bold text-slate-700">{reportData.prescription_date}</p>
                    </div>
                </div>
                {/* Chief Complaints & Clinical Findings */}
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
                {/* Diagnosis */}
                <div className="mb-4">
                    <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Diagnosis</p>
                    <p className="text-sm font-bold text-slate-700">{reportData.diagnosis || 'N/A'}</p>
                </div>
                {/* Medicines Table */}
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
                {/* Doctor Details */}
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
            {/* Print/Download Buttons (hidden on print) */}
            <div className="flex gap-2 justify-end p-4 print:hidden">
                <button className="btn-secondary flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors" onClick={downloadPDF}>
                    <FaFileDownload size={14} /> Download PDF
                </button>
                <button className="btn-primary flex items-center gap-2" onClick={handlePrint}>
                    <FaPrint size={14} /> Print
                </button>
            </div>
        </div>
    );
};

export default ReportView;
