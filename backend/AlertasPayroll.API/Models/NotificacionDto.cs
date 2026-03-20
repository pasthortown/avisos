namespace AlertasPayroll.API.Models;

public class NotificacionDto
{
    // Campos de Avisos.notificacionesConsolidadas (Azure)
    public long IdNotificacion { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaEnvio { get; set; }
    public DateTime? FechaResolucion { get; set; }
    public string Estado { get; set; } = "A";
    public string Origen { get; set; } = string.Empty;
    public string SpOrigen { get; set; } = string.Empty;
    public string Asunto { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public string? DescripcionHtml { get; set; }
    public int? CantidadRegistros { get; set; }
    public string Destinatarios { get; set; } = string.Empty;
    public string? DestinatariosCc { get; set; }
    public DateTime? PeriodoInicio { get; set; }
    public DateTime? PeriodoFin { get; set; }
    public DateTime? FechaModificacion { get; set; }
    public string? UsuarioResolucion { get; set; }
    public string? NotasResolucion { get; set; }

    // Campos de dbo.gestionNotificaciones (local) - se sobreescriben si existe gestión
    public string? Prioridad { get; set; }
    public DateTime? FechaAtencion { get; set; }
    public string? UsuarioAtencion { get; set; }
    public string? NotasAtencion { get; set; }
    public bool TieneGestion { get; set; }
}
