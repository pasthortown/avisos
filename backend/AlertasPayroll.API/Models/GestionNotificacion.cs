using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlertasPayroll.API.Models;

[Table("gestionNotificaciones", Schema = "dbo")]
public class GestionNotificacion
{
    [Key]
    public long IdGestion { get; set; }

    public long IdNotificacion { get; set; }

    [StringLength(1)]
    public string Estado { get; set; } = "A";

    [StringLength(20)]
    public string? Prioridad { get; set; }

    public DateTime? FechaAtencion { get; set; }

    [StringLength(100)]
    public string? UsuarioAtencion { get; set; }

    [StringLength(500)]
    public string? NotasAtencion { get; set; }

    public DateTime? FechaResolucion { get; set; }

    [StringLength(100)]
    public string? UsuarioResolucion { get; set; }

    [StringLength(500)]
    public string? NotasResolucion { get; set; }

    public DateTime FechaCreacion { get; set; }

    public DateTime? FechaModificacion { get; set; }
}
