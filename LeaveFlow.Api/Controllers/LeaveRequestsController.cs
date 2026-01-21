using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using LeaveFlow.Api.Infrastructure.Data;
using LeaveFlow.Api.Domain.Entities;
using LeaveFlow.Api.Application.DTOs;
using System.Security.Claims;

namespace LeaveFlow.Api.Controllers;

[ApiController]
[Route("api/leaves")]
public class LeaveRequestsController : ControllerBase
{
    private readonly LeaveFlowDbContext _context;

    public LeaveRequestsController(LeaveFlowDbContext context)
    {
        _context = context;
    }

    // =====================================================
    // EMPLOYEE: Apply for leave
    // =====================================================
    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateLeave(CreateLeaveRequestDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return Unauthorized();

        var userId = Guid.Parse(userIdClaim);

        if (dto.EndDate < dto.StartDate)
            return BadRequest("End date cannot be before start date.");

        var leave = new LeaveRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Reason = dto.Reason,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.LeaveRequests.Add(leave);
        await _context.SaveChangesAsync();

        return Ok(leave);
    }

    // =====================================================
    // EMPLOYEE: View ONLY their own leaves
    // =====================================================
    [Authorize]
    [HttpGet("my")]
    public async Task<IActionResult> GetMyLeaves()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null)
            return Unauthorized();

        var userId = Guid.Parse(userIdClaim);

        var leaves = await _context.LeaveRequests
            .Where(l => l.UserId == userId)
            .OrderByDescending(l => l.CreatedAt)
            .ToListAsync();

        return Ok(leaves);
    }

    // =====================================================
    // MANAGER: Approve / Reject leave + AUDIT LOG (STEP C3)
    // =====================================================
    [Authorize(Roles = "Manager")]
    [HttpPatch("{id:guid}/review")]
    public async Task<IActionResult> ReviewLeave(Guid id, ReviewLeaveRequestDto dto)
    {
        if (dto.Decision != "Approved" && dto.Decision != "Rejected")
            return BadRequest("Decision must be Approved or Rejected.");

        var leave = await _context.LeaveRequests.FindAsync(id);
        if (leave == null)
            return NotFound("Leave request not found.");

        if (leave.Status != "Pending")
            return BadRequest("Only pending requests can be reviewed.");

        // 🔐 Extract manager identity from JWT
        var managerId = Guid.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value
        );
        var managerEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? "unknown";

        // Update leave
        leave.Status = dto.Decision;
        leave.ReviewedAt = DateTime.UtcNow;

        // 🔥 CREATE AUDIT LOG (CORE PART)
        var audit = new AuditLog
        {
            Id = Guid.NewGuid(),
            ActorUserId = managerId,
            ActorEmail = managerEmail,
            LeaveRequestId = leave.Id,
            Action = dto.Decision,
            CreatedAt = DateTime.UtcNow
        };

        _context.AuditLogs.Add(audit);

        await _context.SaveChangesAsync();

        return Ok(leave);
    }

    // =====================================================
    // MANAGER: View ALL leaves (PAGINATED + FILTERED)
    // =====================================================
    [Authorize(Roles = "Manager")]
    [HttpGet]
    public async Task<IActionResult> GetAllLeaves(
        int page = 1,
        int pageSize = 10,
        string? status = null)
    {
        if (page <= 0 || pageSize <= 0)
            return BadRequest("Invalid pagination values.");

        var query = _context.LeaveRequests
            .Include(l => l.User)
            .AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(l => l.Status == status);

        var totalCount = await query.CountAsync();

        var leaves = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new LeaveResponseDto
            {
                Id = l.Id,
                UserId = l.UserId,
                UserEmail = l.User!.Email,
                StartDate = l.StartDate,
                EndDate = l.EndDate,
                Reason = l.Reason,
                Status = l.Status,
                CreatedAt = l.CreatedAt,
                ReviewedAt = l.ReviewedAt
            })
            .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            totalCount,
            data = leaves
        });
    }

    [Authorize(Roles = "Manager")]
    [HttpGet("audit")]
    public async Task<IActionResult> GetAuditLogs(
    int page = 1,
    int pageSize = 10)
    {
        var query = _context.AuditLogs
            .OrderByDescending(a => a.CreatedAt);

        var totalCount = await query.CountAsync();

        var logs = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new AuditLogResponseDto
            {
                Id = a.Id,
                ActorEmail = a.ActorEmail,
                LeaveRequestId = a.LeaveRequestId,
                Action = a.Action,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            totalCount,
            data = logs
        });
    }

}
