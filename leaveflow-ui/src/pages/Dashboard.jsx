import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import './Dashboard.css';

export default function Dashboard() {
    const { user, isManager } = useAuth();
    const api = useApi();

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New leave form
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: '',
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadLeaves();
    }, []);

    const loadLeaves = async () => {
        try {
            setLoading(true);
            const data = await api.getMyLeaves();
            setLeaves(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            await api.createLeave(formData.startDate, formData.endDate, formData.reason);
            setFormData({ startDate: '', endDate: '', reason: '' });
            setShowForm(false);
            loadLeaves();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        const classes = {
            Pending: 'badge-pending',
            Approved: 'badge-approved',
            Rejected: 'badge-rejected',
        };
        return `badge ${classes[status] || 'badge-pending'}`;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const calculateDays = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate - startDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const stats = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length,
    };

    return (
        <div className="dashboard">
            <div className="container">
                {/* Header */}
                <div className="dashboard-header animate-fadeIn">
                    <div>
                        <h1>Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
                        <p className="text-muted">Here's an overview of your leave requests</p>
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(!showForm)}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Apply for Leave
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-card">
                        <div className="stat-icon total">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Requests</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon pending">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.pending}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon approved">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.approved}</span>
                            <span className="stat-label">Approved</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon rejected">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.rejected}</span>
                            <span className="stat-label">Rejected</span>
                        </div>
                    </div>
                </div>

                {/* New Leave Form */}
                {showForm && (
                    <div className="leave-form-card animate-fadeIn">
                        <div className="card-header">
                            <h3>New Leave Request</h3>
                            <button
                                className="btn-close"
                                onClick={() => setShowForm(false)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="card-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Start Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date</label>
                                    <input
                                        type="date"
                                        className="form-input"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        min={formData.startDate}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Reason</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Please provide a reason for your leave request..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="error-banner animate-fadeIn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                        <button onClick={() => setError('')}>✕</button>
                    </div>
                )}

                {/* Leave Requests Table */}
                <div className="leaves-section animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                    <h2>My Leave Requests</h2>

                    {loading ? (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Loading your leaves...</p>
                        </div>
                    ) : leaves.length === 0 ? (
                        <div className="empty-state card">
                            <div className="empty-state-icon">📅</div>
                            <h3>No leave requests yet</h3>
                            <p>Click "Apply for Leave" to create your first request.</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Duration</th>
                                        <th>Days</th>
                                        <th>Reason</th>
                                        <th>Status</th>
                                        <th>Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaves.map((leave) => (
                                        <tr key={leave.id}>
                                            <td>
                                                <div className="date-range">
                                                    <span>{formatDate(leave.startDate)}</span>
                                                    <span className="date-separator">→</span>
                                                    <span>{formatDate(leave.endDate)}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="days-badge">
                                                    {calculateDays(leave.startDate, leave.endDate)} days
                                                </span>
                                            </td>
                                            <td>
                                                <span className="reason-text">{leave.reason}</span>
                                            </td>
                                            <td>
                                                <span className={getStatusBadge(leave.status)}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            <td className="text-muted">
                                                {formatDate(leave.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
