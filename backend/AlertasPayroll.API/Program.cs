using AlertasPayroll.API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Allow environment variables to override appsettings configuration
builder.Configuration.AddEnvironmentVariables();

// Listen on 0.0.0.0:8080 for Docker container support
builder.WebHost.UseUrls("http://0.0.0.0:8080");

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Alertas Payroll API",
        Version = "v1",
        Description = "API para el sistema de Alertas Payroll"
    });
});

// Build connection string: prefer env vars, fallback to appsettings
var dbServer = Environment.GetEnvironmentVariable("DB_SERVER");
var dbUser = Environment.GetEnvironmentVariable("DB_USER");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");
var dbName = Environment.GetEnvironmentVariable("DB_NAME");

string connectionString;
if (!string.IsNullOrEmpty(dbServer) && !string.IsNullOrEmpty(dbUser) && !string.IsNullOrEmpty(dbPassword) && !string.IsNullOrEmpty(dbName))
{
    connectionString = $"Server=tcp:{dbServer},1433;Initial Catalog={dbName};User ID={dbUser};Password={dbPassword};Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;";
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found and DB environment variables are not set.");
}

// Build connection string for local SQL Server (gestion)
var localDbServer = Environment.GetEnvironmentVariable("LOCAL_DB_SERVER") ?? "sqlserver-local";
var localDbUser = Environment.GetEnvironmentVariable("LOCAL_DB_USER") ?? "sa";
var localDbPassword = Environment.GetEnvironmentVariable("LOCAL_DB_PASSWORD") ?? "";
var localDbName = Environment.GetEnvironmentVariable("LOCAL_DB_NAME") ?? "AlertasPayroll_Local";
var localConnectionString = $"Server=tcp:{localDbServer},1433;Initial Catalog={localDbName};User ID={localDbUser};Password={localDbPassword};Encrypt=False;TrustServerCertificate=True;Connection Timeout=30;";

// CORS permisivo para desarrollo
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Configure Entity Framework Core - Azure DB (solo lectura, notificaciones)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// Configure Entity Framework Core - Local DB (lectura/escritura, gestión)
builder.Services.AddDbContext<GestionDbContext>(options =>
    options.UseSqlServer(localConnectionString));

var app = builder.Build();

// Ensure local database and tables are created
using (var scope = app.Services.CreateScope())
{
    var gestionDb = scope.ServiceProvider.GetRequiredService<GestionDbContext>();
    gestionDb.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
// Swagger habilitado siempre (no solo en Development)
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Alertas Payroll API v1");
    options.RoutePrefix = "swagger";
});

app.UseCors();

app.UseAuthorization();

app.MapControllers();

app.Run();
