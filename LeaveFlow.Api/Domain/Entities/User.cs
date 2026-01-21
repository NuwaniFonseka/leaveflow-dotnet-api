namespace LeaveFlow.Api.Domain.Entities;

public class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string Role { get; set; } = "Employee";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<LeaveRequest> LeaveRequests { get; set; }
        = new List<LeaveRequest>();
}
