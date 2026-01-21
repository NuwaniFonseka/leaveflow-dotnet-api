namespace LeaveFlow.Api.Application.DTOs;

public class CreateLeaveRequestDto
{
    public Guid UserId { get; set; }

    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }

    public string Reason { get; set; } = null!;
}
