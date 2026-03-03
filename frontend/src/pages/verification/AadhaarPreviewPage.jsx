import React, { useState } from 'react';
import AadhaarVerify from './AadhaarVerify'; // Ensure path is correct
import { FaUserCheck, FaIdCard, FaMapMarkerAlt, FaCalendarAlt, FaVenusMars, FaFingerprint } from 'react-icons/fa';

const AadhaarPreviewPage = () => {
    const [verifiedData, setVerifiedData] = useState(null);

    // This is the "Connect" function that triggers after OTP success
    const handleVerificationComplete = (data) => {
        console.log("Data Received from Component:", data);
        setVerifiedData(data);
    };

    return (
        <div className="app-container max-w-5xl mx-auto py-10 px-4">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-500">
        <h4 className="text-xl font-bold text-gray-800">Aadhaar Data Preview</h4>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                {/* LEFT SIDE: Verification Component */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-100 border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                <FaFingerprint size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Identity Check</h3>
                        </div>
                        
                        <AadhaarVerify 
                            hospitalCode="HOSP01" 
                            onVerificationSuccess={handleVerificationComplete} 
                        />
                    </div>
                    
                    {verifiedData && (
                        <button 
                            onClick={() => setVerifiedData(null)}
                            className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-bold hover:bg-gray-50 transition-all uppercase text-xs tracking-widest"
                        >
                            Verify Another Identity
                        </button>
                    )}
                </div>

                {/* RIGHT SIDE: Fetched Data Display */}
                <div className="relative">
                    {verifiedData ? (
                        <div className="form-container animate-slide-in border-t-8 border-emerald-500 bg-white shadow-2xl shadow-emerald-100/50 p-8 rounded-[2rem]">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                        <FaUserCheck size={28} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-800 tracking-tight">Verified Profile</h2>
                                        <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest">UIDAI Validated</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1 block">Full Name</label>
                                    <p className="text-xl font-bold text-gray-800">{verifiedData.full_name}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1 block flex items-center gap-1"><FaCalendarAlt /> DOB</label>
                                        <p className="font-bold text-gray-800">{verifiedData.dob}</p>
                                    </div>
                                    <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1 block flex items-center gap-1"><FaVenusMars /> Gender</label>
                                        <p className="font-bold text-gray-800">
                                            {verifiedData.gender === 1 ? 'Male' : verifiedData.gender === 2 ? 'Female' : 'Other'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                                    <label className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1 block flex items-center gap-1"><FaMapMarkerAlt /> Registered Address</label>
                                    <p className="text-sm leading-relaxed text-gray-700 font-medium">{verifiedData.address}</p>
                                    <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Pincode</span>
                                        <span className="text-sm font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">{verifiedData.pincode}</span>
                                    </div>
                                </div>

                                <div className="p-5 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-200">
                                    <label className="text-[10px] uppercase tracking-widest text-emerald-100 font-black mb-1 block">Linked Aadhaar</label>
                                    <p className="font-mono font-bold text-lg tracking-[0.2em]">XXXX XXXX {verifiedData.aadhaar_no.slice(-4)}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] border-4 border-dashed border-gray-100 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center bg-gray-50/50">
                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-6">
                                <FaIdCard className="text-gray-200 text-4xl" />
                            </div>
                            <h3 className="text-gray-400 font-black text-xl uppercase tracking-tighter">Waiting for Data</h3>
                            <p className="text-gray-400 text-sm max-w-xs mt-2 leading-relaxed">Please complete the OTP verification process on the left to unlock patient demographic details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AadhaarPreviewPage;