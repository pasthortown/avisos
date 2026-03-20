using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlertasPayroll.API.Models;

[Table("notificacionesConsolidadas", Schema = "Avisos")]
public class NotificacionConsolidada
{
    [Key]
    public long IdNotificacion { get; set; }

    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaEnvio { get; set; }
    public DateTime? FechaResolucion { get; set; }

    [StringLength(1)]
    public string Estado { get; set; } = "A";

    [StringLength(100)]
    public string Origen { get; set; } = string.Empty;

    [StringLength(128)]
    public string SpOrigen { get; set; } = string.Empty;

    [StringLength(300)]
    public string Asunto { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Descripcion { get; set; }

    public string? DescripcionHtml { get; set; }

    public int? CantidadRegistros { get; set; }

    public string Destinatarios { get; set; } = string.Empty;

    public string? DestinatariosCc { get; set; }

    [Column(TypeName = "date")]
    public DateTime? PeriodoInicio { get; set; }

    [Column(TypeName = "date")]
    public DateTime? PeriodoFin { get; set; }

    public DateTime? FechaModificacion { get; set; }

    [StringLength(100)]
    public string? UsuarioResolucion { get; set; }

    [StringLength(500)]
    public string? NotasResolucion { get; set; }
}
