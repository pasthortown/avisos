using AlertasPayroll.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AlertasPayroll.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<NotificacionConsolidada> NotificacionesConsolidadas { get; set; }
}
