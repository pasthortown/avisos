using AlertasPayroll.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AlertasPayroll.API.Data;

public class GestionDbContext : DbContext
{
    public GestionDbContext(DbContextOptions<GestionDbContext> options)
        : base(options)
    {
    }

    public DbSet<GestionNotificacion> GestionNotificaciones { get; set; }
}
