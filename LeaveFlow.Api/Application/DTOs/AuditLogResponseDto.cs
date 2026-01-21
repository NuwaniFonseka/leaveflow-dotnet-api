using System;

namespace LeaveFlow.Api.Application.DTOs;

public class AuditLogResponseDto
{
    public Guid Id { get; set; }
    public string ActorEmail { get; set; }
    public Guid LeaveRequestId { get; set; }
    public string Action { get; set; }
    public DateTime CreatedAt { get; set; }
}
