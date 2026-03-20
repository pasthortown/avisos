using System.ComponentModel.DataAnnotations;

namespace AlertasPayroll.API.Models;

public class GestionRequest
{
    [StringLength(1)]
    public string? Estado { get; set; }

    [StringLength(20)]
    public string? Prioridad { get; set; }

    [StringLength(100)]
    public string? UsuarioAtencion { get; set; }

    [StringLength(500)]
    public string? NotasAtencion { get; set; }

    [StringLength(100)]
    public string? UsuarioResolucion { get; set; }

    [StringLength(500)]
    public string? NotasResolucion { get; set; }
}
