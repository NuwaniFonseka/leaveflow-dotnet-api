import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
    const { user, logout, isAuthenticated, isManager } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) return null;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <div className="brand-icon">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
                            <path d="M10 16L14 20L22 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6366f1" />
                                    <stop offset="1" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                    <span className="brand-text">LeaveFlow</span>
                </Link>

                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Dashboard
                    </Link>

                    {isManager && (
                        <>
                            <Link
                                to="/all-leaves"
                                className={`nav-link ${location.pathname === '/all-leaves' ? 'active' : ''}`}
                            >
                                All Leaves
                            </Link>
                            <Link
                                to="/audit-logs"
                                className={`nav-link ${location.pathname === '/audit-logs' ? 'active' : ''}`}
                            >
                                Audit Logs
                            </Link>
                        </>
                    )}
                </div>

                <div className="navbar-user">
                    <div className="user-info">
                        <span className="user-email">{user?.email}</span>
                        <span className={`user-role ${isManager ? 'role-manager' : 'role-employee'}`}>
                            {user?.role}
                        </span>
                    </div>
                    <button onClick={handleLogout} className="btn-logout">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16,17 21,12 16,7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                    </button>
                </div>
            </div>
        </nav>
    );
}
