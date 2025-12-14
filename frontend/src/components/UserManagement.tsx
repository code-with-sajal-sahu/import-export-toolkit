import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import ImportModal from './ImportModal';
import './UserManagement.css';

interface User {
    _id: string;
    name: string;
    email: string;
    age: number;
    location: string;
    createdAt: string;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleExport = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/users/export', {
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'users_export.xlsx');
        } catch (error) {
            console.error(error);
            alert('Export failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="um-container">
            <div className="um-header">
                <h1>User Management</h1>
                <div className="um-actions">
                    {users.length > 0 && (
                        <button
                            onClick={handleExport}
                            disabled={loading}
                            className="btn btn-secondary"
                        >
                            {loading ? 'Exporting...' : 'Export to Excel'}
                        </button>
                    )}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="btn btn-primary"
                    >
                        Import Users
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Age</th>
                            <th>Location</th>
                            <th>Joined Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user._id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.age}</td>
                                    <td>{user.location}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="no-data">No users found. Import some data!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ImportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchUsers}
            />
        </div>
    );
};

export default UserManagement;
