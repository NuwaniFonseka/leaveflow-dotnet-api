namespace LeaveFlow.Api.Domain.Entities;

public class LeaveRequest
{
    public Guid Id { get; set; }

    // Foreign Key
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    // Leave details
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public string Reason { get; set; } = null!;

    // Workflow status
    public string Status { get; set; } = "Pending";

    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
}
