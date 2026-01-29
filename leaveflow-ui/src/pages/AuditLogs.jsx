import { useState, useEffect } from 'react';
import { useApi } from '../hooks/useApi';
import './ManagerPages.css';

export default function AuditLogs() {
    const api = useApi();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    const pageSize = 15;

    useEffect(() => {
        loadLogs();
    }, [page]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await api.getAuditLogs(page, pageSize);
            setLogs(data.data);
            setTotalCount(data.totalCount);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getActionBadge = (action) => {
        const classes = {
            Approved: 'badge-approved',
            Rejected: 'badge-rejected',
        };
        return `badge ${classes[action] || 'badge-pending'}`;
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <div className="manager-page">
            <div className="container">
                {/* Header */}
                <div className="page-header animate-fadeIn">
                    <div>
                        <h1>Audit Logs</h1>
                        <p className="text-muted">Track all leave review decisions and actions</p>
                    </div>
                    <div className="header-stats">
                        <span className="total-badge">{totalCount} total actions</span>
                    </div>
                </div>

                {/* Timeline View */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading audit logs...</p>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state card">
                        <div className="empty-state-icon">📜</div>
                        <h3>No audit logs yet</h3>
                        <p>Actions will appear here when leave requests are reviewed.</p>
                    </div>
                ) : (
                    <div className="audit-timeline animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                        {logs.map((log, index) => (
                            <div key={log.id} className="audit-item">
                                <div className="audit-line">
                                    <div className={`audit-dot ${log.action.toLowerCase()}`}></div>
                                    {index < logs.length - 1 && <div className="audit-connector"></div>}
                                </div>
                                <div className="audit-content">
                                    <div className="audit-header">
                                        <span className={getActionBadge(log.action)}>
                                            {log.action}
                                        </span>
                                        <span className="audit-time">{formatDateTime(log.createdAt)}</span>
                                    </div>
                                    <div className="audit-body">
                                        <p>
                                            <strong>{log.actorEmail}</strong> {log.action.toLowerCase()} a leave request
                                        </p>
                                        <span className="audit-request-id">
                                            Request ID: {log.leaveRequestId.substring(0, 8)}...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
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
