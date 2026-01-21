namespace LeaveFlow.Api.Application.DTOs;

public class ReviewLeaveRequestDto
{
    public string Decision { get; set; } = null!; // "Approved" or "Rejected"
}
