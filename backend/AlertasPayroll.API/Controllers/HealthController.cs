using AlertasPayroll.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlertasPayroll.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public HealthController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Health check endpoint that validates database connectivity by executing SELECT GETDATE().
    /// </summary>
    /// <returns>Current server date/time from SQL Server Azure.</returns>
    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        try
        {
            var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            using var command = connection.CreateCommand();
            command.CommandText = "SELECT GETDATE()";
            var result = await command.ExecuteScalarAsync();

            return Ok(new
            {
                status = "healthy",
                database = "connected",
                serverTime = result,
                checkedAt = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            return StatusCode(503, new
            {
                status = "unhealthy",
                database = "disconnected",
                error = ex.Message,
                checkedAt = DateTime.UtcNow
            });
        }
    }
}
