import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import './ImportModal.css';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [errorFilePath, setErrorFilePath] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setMessage(null);
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
    const handleDownloadErrors = async () => {
        if (!errorFilePath) return;

        try {
            const response = await axios.get(
                `http://localhost:5000/uploads/errors/${errorFilePath}`,
                { responseType: "blob" }
            );

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            saveAs(blob, "import-user-errors.xlsx");
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Failed to download error report" });
        }
    };

    const handleImport = async () => {
        if (!file) {
            setMessage({ type: "error", text: "Please select a file first" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setErrorFilePath(null);

        try {
            const response = await axios.post(
                "http://localhost:5000/api/users/import",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                    validateStatus: () => true,
                }
            );

            const { status, data } = response;

            if (status === 201) {
                setMessage({ type: "success", text: data.message });
                setTimeout(() => {
                    onSuccess();
                    onClose();
                    setFile(null);
                    setMessage(null);
                }, 1000);
            }

            else if (status === 207) {
                setMessage({
                    type: "error",
                    text: `Imported ${data.insertedCount}. ${data.failedCount} failed.`,
                });
                setErrorFilePath(data.errorFilePath);
            }

            else if (status === 400) {
                setMessage({
                    type: "error",
                    text: data.message || "Import failed",
                });
                setErrorFilePath(data.errorFilePath);
            }

        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: "Something went wrong" });
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Import Users</h2>
                    <button
                        onClick={() => {
                            setFile(null);
                            setMessage(null);
                            onClose();
                        }}
                        className="close-btn">&times;</button>
                </div>

                <div className="modal-body">
                    <div className="sample-section">
                        <span>Need a template?</span>
                        <button onClick={handleDownloadSample} className="btn-link">Download Sample</button>
                    </div>

                    <div className="file-drop-area">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem', color: '#666' }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        <input
                            type="file"
                            id="modal-file-upload"
                            accept=".xlsx, .xls"
                            onChange={handleFileChange}
                            className="file-input"
                            value=""
                        />
                        <div className="file-label">
                            {file ? (
                                <span style={{ color: '#fff' }}>{file.name}</span>
                            ) : (
                                <>
                                    <strong>Click to Upload</strong> or drag and drop<br />
                                    <span style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem', display: 'block' }}>Excel files only (.xlsx, .xls)</span>
                                </>
                            )}
                        </div>
                    </div>

                    {message && (
                        <div className={`message ${message.type}`}>
                            {message.text}&nbsp;
                            {errorFilePath && (
                                <span
                                    onClick={handleDownloadErrors}
                                    className="import-error-link"
                                    style={{ color: "#ff4d4f" }}
                                >
                                    Download error report
                                </span>

                            )}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button onClick={() => {
                        setFile(null);
                        setMessage(null);
                        onClose();
                    }} className="btn btn-secondary">Cancel</button>
                    <button
                        onClick={handleImport}
                        disabled={loading || !file}
                        className="btn btn-primary"
                    >
                        {loading ? 'Importing...' : 'Import'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
