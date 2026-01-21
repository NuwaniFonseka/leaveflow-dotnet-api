using LeaveFlow.Api.Application.DTOs;
using LeaveFlow.Api.Domain.Entities;
using LeaveFlow.Api.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LeaveFlow.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly LeaveFlowDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(LeaveFlowDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }


    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterUserDto dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("Email already exists.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            PasswordHash = dto.Password, // ⚠ later hash
            Role = dto.Role
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { user.Id, user.Email, user.Role });
    }


    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || dto.Password != "password")
            return Unauthorized("Invalid credentials");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!)
        );

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                int.Parse(_config["Jwt:ExpiryMinutes"]!)
            ),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return Ok(new
        {
            token = new JwtSecurityTokenHandler().WriteToken(token)
        });
    }
}
