using System;

namespace LeaveFlow.Api.Domain.Entities;

public class AuditLog
{
    public Guid Id { get; set; }

    // Who performed the action (Manager)
    public Guid ActorUserId { get; set; }

    public string ActorEmail { get; set; } = string.Empty;

    // What entity was affected
    public Guid LeaveRequestId { get; set; }

    // Action details
    public string Action { get; set; } = string.Empty; // Approved / Rejected
    public string Entity { get; set; } = "LeaveRequest";

    // Timestamp
    public DateTime CreatedAt { get; set; }
}
