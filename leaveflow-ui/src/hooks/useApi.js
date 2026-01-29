import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

export function useApi() {
    const { token } = useAuth();

    const headers = () => ({
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    });

    const handleResponse = async (response) => {
        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP error ${response.status}`);
        }
        return response.json();
    };

    // ==================== LEAVES API ====================

    const getMyLeaves = async () => {
        const response = await fetch(`${API_URL}/api/leaves/my`, {
            headers: headers(),
        });
        return handleResponse(response);
    };

    const getAllLeaves = async (page = 1, pageSize = 10, status = null) => {
        let url = `${API_URL}/api/leaves?page=${page}&pageSize=${pageSize}`;
        if (status) url += `&status=${status}`;

        const response = await fetch(url, {
            headers: headers(),
        });
        return handleResponse(response);
    };

    const createLeave = async (startDate, endDate, reason) => {
        const response = await fetch(`${API_URL}/api/leaves`, {
            method: 'POST',
            headers: headers(),
            body: JSON.stringify({ startDate, endDate, reason }),
        });
        return handleResponse(response);
    };

    const reviewLeave = async (leaveId, decision) => {
        const response = await fetch(`${API_URL}/api/leaves/${leaveId}/review`, {
            method: 'PATCH',
            headers: headers(),
            body: JSON.stringify({ decision }),
        });
        return handleResponse(response);
    };

    // ==================== AUDIT API ====================

    const getAuditLogs = async (page = 1, pageSize = 10) => {
        const response = await fetch(
            `${API_URL}/api/leaves/audit?page=${page}&pageSize=${pageSize}`,
            {
                headers: headers(),
            }
        );
        return handleResponse(response);
    };

    return {
        getMyLeaves,
        getAllLeaves,
        createLeave,
        reviewLeave,
        getAuditLogs,
    };
}
