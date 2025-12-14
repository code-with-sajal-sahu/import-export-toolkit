import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import './ImportExport.css';

const ImportExport: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file first' });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            // Use local IP or localhost. For now localhost
            await axios.post('http://localhost:5000/api/users/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage({ type: 'success', text: 'Users imported successfully!' });
            setFile(null);
            // Reset file input manually if needed (ref) or just rely on state
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (error: any) {
            console.error(error);
            const errMsg = error.response?.data?.message || 'Import failed';
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/users/export', {
                responseType: 'blob', // Important for binary data
            });

            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'users_export.xlsx');
            setMessage({ type: 'success', text: 'Export downloaded successfully!' });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Export failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadSample = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/users/sample', {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'sample_users.xlsx');
        } catch (error) {
            console.error('Error downloading sample:', error);
            setMessage({ type: 'error', text: 'Could not download sample file.' });
        }
    };

    return (
        <div className="ie-container">
            <div className="ie-card">
                <h2 className="ie-title">Bulk User Management</h2>

                <div className="ie-section">
                    <div className="section-header">
                        <h3>Import Users</h3>
                        <button onClick={handleDownloadSample} className="btn-link">Download Sample</button>
                    </div>
                    <p className="ie-desc">Upload an Excel file (.xlsx) to bulk add users.</p>

                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            id="file-upload"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        <label htmlFor="file-upload" className="file-label">
                            {file ? file.name : 'Choose Excel File'}
                        </label>
                    </div>

                    <button
                        onClick={handleImport}
                        disabled={loading || !file}
                        className={`btn btn-primary ${loading ? 'loading' : ''}`}
                    >
                        {loading ? 'Processing...' : 'Import Data'}
                    </button>
                </div>

                <div className="divider"></div>

                <div className="ie-section">
                    <h3>Export Users</h3>
                    <p className="ie-desc">Download all user data as an Excel file.</p>
                    <button
                        onClick={handleExport}
                        disabled={loading}
                        className={`btn btn-secondary ${loading ? 'loading' : ''}`}
                    >
                        {loading ? 'Processing...' : 'Export to Excel'}
                    </button>
                </div>

                {message && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportExport;
