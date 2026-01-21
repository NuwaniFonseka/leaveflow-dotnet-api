public class RegisterUserDto
{
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Role { get; set; } = "Employee";
}
