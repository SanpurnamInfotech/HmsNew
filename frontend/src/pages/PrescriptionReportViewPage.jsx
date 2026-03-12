// Inline print styles to ensure report appears the same on print and fits on a single page
import React, { useEffect, useState } from 'react';
import ReportView from './ReportView';

const PrescriptionReportViewPage = () => {
    const [reportData, setReportData] = useState(null);

    useEffect(() => {
        const data = sessionStorage.getItem('prescription_report_data');
        if (data) {
            setReportData(JSON.parse(data));
        }
    }, []);

    return (
        <>
            <style>{`
@media print {

  body {
    background: white !important;
  }

  body * {
    visibility: hidden;
  }

  .print-report-view,
  .print-report-view * {
    visibility: visible !important;
  }

  .print-report-view {
    position: relative;
    margin: auto;
    width: 850px;
    background: white;
  }

  .print\\:hidden {
    display: none !important;
  }

  @page {
    size: A4 portrait;
    margin: 15mm;
  }

}
`}</style>
            <div className="print-report-view">
                <ReportView reportData={reportData} />
            </div>
        </>
    );
};

export default PrescriptionReportViewPage;
