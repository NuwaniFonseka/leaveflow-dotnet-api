using Microsoft.EntityFrameworkCore;
using LeaveFlow.Api.Domain.Entities;

namespace LeaveFlow.Api.Infrastructure.Data;

public class LeaveFlowDbContext : DbContext
{
    public LeaveFlowDbContext(DbContextOptions<LeaveFlowDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<LeaveRequest> LeaveRequests { get; set; }
    public DbSet<AuditLog> AuditLogs { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
        });

        modelBuilder.Entity<LeaveRequest>(entity =>
        {
            entity.HasKey(lr => lr.Id);

            entity.HasOne(lr => lr.User)
                  .WithMany(u => u.LeaveRequests)
                  .HasForeignKey(lr => lr.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.Property(lr => lr.Status)
                  .HasDefaultValue("Pending");
        });
    }
}
