import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import './ManagerPages.css';

export default function AllLeaves() {
    const api = useApi();

    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [processing, setProcessing] = useState(null);

    const pageSize = 10;

    useEffect(() => {
        loadLeaves();
    }, [page, filter]);

    const loadLeaves = async () => {
        try {
            setLoading(true);
            const data = await api.getAllLeaves(page, pageSize, filter || null);
            setLeaves(data.data);
            setTotalCount(data.totalCount);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (leaveId, decision) => {
        try {
            setProcessing(leaveId);
            await api.reviewLeave(leaveId, decision);
            loadLeaves();
        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(null);
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
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="manager-page">
            <div className="container">
                {/* Header */}
                <div className="page-header animate-fadeIn">
                    <div>
                        <h1>All Leave Requests</h1>
                        <p className="text-muted">Review and manage employee leave requests</p>
                    </div>
                    <div className="header-stats">
                        <span className="total-badge">{totalCount} total requests</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                    <div className="filter-group">
                        <label>Filter by Status:</label>
                        <div className="filter-buttons">
                            <button
                                className={`filter-btn ${filter === '' ? 'active' : ''}`}
                                onClick={() => { setFilter(''); setPage(1); }}
                            >
                                All
                            </button>
                            <button
                                className={`filter-btn ${filter === 'Pending' ? 'active' : ''}`}
                                onClick={() => { setFilter('Pending'); setPage(1); }}
                            >
                                Pending
                            </button>
                            <button
                                className={`filter-btn ${filter === 'Approved' ? 'active' : ''}`}
                                onClick={() => { setFilter('Approved'); setPage(1); }}
                            >
                                Approved
                            </button>
                            <button
                                className={`filter-btn ${filter === 'Rejected' ? 'active' : ''}`}
                                onClick={() => { setFilter('Rejected'); setPage(1); }}
                            >
                                Rejected
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="error-banner">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error}
                        <button onClick={() => setError('')}>✕</button>
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading leave requests...</p>
                    </div>
                ) : leaves.length === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-state-icon">📋</div>
                        <h3>No leave requests found</h3>
                        <p>There are no leave requests matching your filter.</p>
                    </div>
                ) : (
                    <div className="table-container animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Employee</th>
                                    <th>Duration</th>
                                    <th>Days</th>
                                    <th>Reason</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr key={leave.id}>
                                        <td>
                                            <div className="employee-info">
                                                <div className="employee-avatar">
                                                    {leave.userEmail?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="employee-email">{leave.userEmail}</span>
                                            </div>
                                        </td>
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
                                        <td>
                                            {leave.status === 'Pending' ? (
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn btn-success btn-sm"
                                                        onClick={() => handleReview(leave.id, 'Approved')}
                                                        disabled={processing === leave.id}
                                                    >
                                                        {processing === leave.id ? '...' : 'Approve'}
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleReview(leave.id, 'Rejected')}
                                                        disabled={processing === leave.id}
                                                    >
                                                        {processing === leave.id ? '...' : 'Reject'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="reviewed-text">
                                                    {leave.reviewedAt ? `Reviewed ${formatDate(leave.reviewedAt)}` : '—'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination animate-fadeIn">
                        <button
                            className="pagination-btn"
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                        >
                            ← Previous
                        </button>
                        <span className="pagination-info">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className="pagination-btn"
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                        >
                            Next →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
