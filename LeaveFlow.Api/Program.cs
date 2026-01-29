using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using LeaveFlow.Api.Infrastructure.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =======================
// ADD SERVICES
// =======================

builder.Services.AddControllers();

// =======================
// CORS CONFIGURATION
// =======================

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// =======================
// DATABASE (PostgreSQL - Cloud SQL)
// =======================

builder.Services.AddDbContext<LeaveFlowDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// =======================
// SWAGGER
// =======================

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "LeaveFlow.Api",
        Version = "v1"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// =======================
// JWT AUTH CONFIGURATION
// =======================

var jwtSettings = builder.Configuration.GetSection("Jwt");

var jwtKey = jwtSettings["Key"];
var jwtIssuer = jwtSettings["Issuer"];
var jwtAudience = jwtSettings["Audience"];

if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new Exception("JWT Key is missing. Check environment variable Jwt__Key");
}

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            )
        };
    });

builder.Services.AddAuthorization();

// =======================
// BUILD APP
// =======================

var app = builder.Build();

// =======================
// APPLY EF CORE MIGRATIONS (SAFE FOR CLOUD RUN)
// =======================

using (var scope = app.Services.CreateScope())
{
    try
    {
        var connString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "NOT SET";
        var safeConnString = System.Text.RegularExpressions.Regex.Replace(
            connString, 
            @"Password=[^;]*", 
            "Password=*****"
        );
        Console.WriteLine("[DB] Connection String: " + safeConnString);
        
        var db = scope.ServiceProvider.GetRequiredService<LeaveFlowDbContext>();
        
        Console.WriteLine("[DB] Testing database connection...");
        var canConnect = db.Database.CanConnect();
        Console.WriteLine("[DB] Connection test: " + (canConnect ? "SUCCESS" : "FAILED"));
        
        if (canConnect)
        {
            Console.WriteLine("[DB] Applying migrations...");
            db.Database.Migrate();
            Console.WriteLine("[DB] Migration applied successfully");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("[DB ERROR] Database connection/migration failed");
        Console.WriteLine("[DB ERROR] Error Type: " + ex.GetType().Name);
        Console.WriteLine("[DB ERROR] Error Message: " + ex.Message);
        if (ex.InnerException != null)
        {
            Console.WriteLine("[DB ERROR] Inner Error: " + ex.InnerException.Message);
        }
    }
}

// =======================
// MIDDLEWARE
// =======================

// ENABLE CORS - Must be before other middleware
app.UseCors("AllowFrontend");

// ENABLE SWAGGER IN CLOUD RUN
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LeaveFlow.Api v1");
    c.RoutePrefix = "docs";
});

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();