import React, { useState } from 'react';
import axios from 'axios';

const AadhaarVerify = ({ hospitalCode, patientCode }) => {
    // 1. Local States
    const [step, setStep] = useState(1); // Step 1: Aadhaar, Step 2: OTP
    const [loading, setLoading] = useState(false);
    const [aadhaarNumber, setAadhaarNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [clientId, setClientId] = useState('');
    const [patientData, setPatientData] = useState(null);
    const [error, setError] = useState('');

    // Get your JWT token from storage
    const authHeader = {
        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
    };

    // 2. Step 1: Request OTP
    const handleRequestOtp = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/aadhaar-otp-request/', {
                aadhaar_number: aadhaarNumber,
                hospital_code: hospitalCode,
                patient_code: patientCode
            }, authHeader);

            if (response.data.success) {
                setClientId(response.data.data.client_id);
                setStep(2); // Move to OTP input
            } else {
                setError(response.data.message || 'Check Aadhaar Number');
            }
        } catch (err) {
            setError('Failed to connect to server');
        }
        setLoading(false);
    };

    // 3. Step 2: Verify OTP & Get Data
    const handleVerifyOtp = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('/api/aadhaar-verify-otp/', {
                client_id: clientId,
                otp: otp
            }, authHeader);

            if (response.data.success) {
                setPatientData(response.data.data); // Store verified patient info
                setStep(3); // Success state
            } else {
                setError('Invalid OTP. Please try again.');
            }
        } catch (err) {
            setError('Verification failed');
        }
        setLoading(false);
    };

    // 4. UI Rendering
    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Aadhaar Verification</h3>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {step === 1 && (
                <div>
                    <label>Enter 12-Digit Aadhaar Number</label>
                    <input 
                        type="text" 
                        value={aadhaarNumber} 
                        onChange={(e) => setAadhaarNumber(e.target.value)} 
                        maxLength="12"
                    />
                    <button onClick={handleRequestOtp} disabled={loading}>
                        {loading ? 'Sending...' : 'Get OTP'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div>
                    <p>OTP sent to Aadhaar-linked mobile.</p>
                    <input 
                        type="text" 
                        placeholder="Enter 6-digit OTP" 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                    />
                    <button onClick={handleVerifyOtp} disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Register'}
                    </button>
                </div>
            )}

            {step === 3 && patientData && (
                <div style={{ color: 'green' }}>
                    <h4>✅ Verified Successfully!</h4>
                    <p>Name: {patientData.full_name}</p>
                    <p>DOB: {patientData.dob}</p>
                    <p>Gender: {patientData.gender}</p>
                    {/* You can now auto-fill your main registration form with this data */}
                </div>
            )}
        </div>
    );
};

export default AadhaarVerify;