using AlertasPayroll.API.Data;
using AlertasPayroll.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AlertasPayroll.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificacionesController : ControllerBase
{
    private readonly GestionDbContext _gestionDb;

    public NotificacionesController(GestionDbContext gestionDb)
    {
        _gestionDb = gestionDb;
    }

    /// <summary>
    /// Devuelve notificaciones (dummy por ahora) con LEFT JOIN lógico a gestión local.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        // TODO: Reemplazar por consulta real a Azure DB cuando se quite el modo dummy
        var notificaciones = GetDummyNotificaciones();

        // Obtener todas las gestiones locales de una vez
        var idNotificaciones = notificaciones.Select(n => n.IdNotificacion).ToList();
        var gestiones = await _gestionDb.GestionNotificaciones
            .Where(g => idNotificaciones.Contains(g.IdNotificacion))
            .ToDictionaryAsync(g => g.IdNotificacion);

        // LEFT JOIN lógico: mapear a DTO y sobreescribir campos si existe gestión
        var resultado = notificaciones.Select(n =>
        {
            var dto = new NotificacionDto
            {
                IdNotificacion = n.IdNotificacion,
                FechaCreacion = n.FechaCreacion,
                FechaEnvio = n.FechaEnvio,
                FechaResolucion = n.FechaResolucion,
                Estado = n.Estado,
                Origen = n.Origen,
                SpOrigen = n.SpOrigen,
                Asunto = n.Asunto,
                Descripcion = n.Descripcion,
                DescripcionHtml = n.DescripcionHtml,
                CantidadRegistros = n.CantidadRegistros,
                Destinatarios = n.Destinatarios,
                DestinatariosCc = n.DestinatariosCc,
                PeriodoInicio = n.PeriodoInicio,
                PeriodoFin = n.PeriodoFin,
                FechaModificacion = n.FechaModificacion,
                UsuarioResolucion = n.UsuarioResolucion,
                NotasResolucion = n.NotasResolucion
            };

            if (gestiones.TryGetValue(n.IdNotificacion, out var gestion))
            {
                dto.Estado = gestion.Estado;
                dto.Prioridad = gestion.Prioridad;
                dto.FechaAtencion = gestion.FechaAtencion;
                dto.UsuarioAtencion = gestion.UsuarioAtencion;
                dto.NotasAtencion = gestion.NotasAtencion;
                dto.FechaResolucion = gestion.FechaResolucion;
                dto.UsuarioResolucion = gestion.UsuarioResolucion;
                dto.NotasResolucion = gestion.NotasResolucion;
                dto.TieneGestion = true;
            }

            return dto;
        }).ToList();

        return Ok(resultado);
    }

    /// <summary>
    /// Obtener gestión de una notificación específica.
    /// </summary>
    [HttpGet("{id}/gestion")]
    public async Task<IActionResult> GetGestion(long id)
    {
        var gestion = await _gestionDb.GestionNotificaciones
            .FirstOrDefaultAsync(g => g.IdNotificacion == id);

        if (gestion == null)
            return NotFound(new { message = $"No existe gestión para la notificación {id}" });

        return Ok(gestion);
    }

    /// <summary>
    /// Crear o actualizar gestión de una notificación.
    /// </summary>
    [HttpPost("{id}/gestion")]
    public async Task<IActionResult> UpsertGestion(long id, [FromBody] GestionRequest request)
    {
        var gestion = await _gestionDb.GestionNotificaciones
            .FirstOrDefaultAsync(g => g.IdNotificacion == id);

        if (gestion == null)
        {
            gestion = new GestionNotificacion
            {
                IdNotificacion = id,
                Estado = request.Estado ?? "A",
                Prioridad = request.Prioridad,
                FechaAtencion = request.UsuarioAtencion != null ? DateTime.UtcNow : null,
                UsuarioAtencion = request.UsuarioAtencion,
                NotasAtencion = request.NotasAtencion,
                FechaResolucion = request.UsuarioResolucion != null ? DateTime.UtcNow : null,
                UsuarioResolucion = request.UsuarioResolucion,
                NotasResolucion = request.NotasResolucion,
                FechaCreacion = DateTime.UtcNow
            };
            _gestionDb.GestionNotificaciones.Add(gestion);
        }
        else
        {
            if (request.Estado != null) gestion.Estado = request.Estado;
            if (request.Prioridad != null) gestion.Prioridad = request.Prioridad;
            if (request.UsuarioAtencion != null)
            {
                gestion.UsuarioAtencion = request.UsuarioAtencion;
                gestion.FechaAtencion = DateTime.UtcNow;
            }
            if (request.NotasAtencion != null) gestion.NotasAtencion = request.NotasAtencion;
            if (request.UsuarioResolucion != null)
            {
                gestion.UsuarioResolucion = request.UsuarioResolucion;
                gestion.FechaResolucion = DateTime.UtcNow;
            }
            if (request.NotasResolucion != null) gestion.NotasResolucion = request.NotasResolucion;
            gestion.FechaModificacion = DateTime.UtcNow;
        }

        await _gestionDb.SaveChangesAsync();
        return Ok(gestion);
    }

    private static List<NotificacionConsolidada> GetDummyNotificaciones()
    {
        return new List<NotificacionConsolidada>
        {
            new()
            {
                IdNotificacion = 1,
                FechaCreacion = new DateTime(2026, 3, 20, 8, 0, 0),
                FechaEnvio = new DateTime(2026, 3, 20, 8, 5, 0),
                Estado = "A",
                Origen = "Biométricos",
                SpOrigen = "pa_biometricos_inactivos",
                Asunto = "15 biométricos inactivos en tiendas Quito Norte",
                Descripcion = "Se detectaron 15 equipos biométricos sin comunicación desde hace 48 horas.",
                CantidadRegistros = 15,
                Destinatarios = "soporte.bio@kfc.com.ec",
                DestinatariosCc = "supervisor.it@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 3, 18),
                PeriodoFin = new DateTime(2026, 3, 20)
            },
            new()
            {
                IdNotificacion = 2,
                FechaCreacion = new DateTime(2026, 3, 19, 14, 30, 0),
                FechaEnvio = new DateTime(2026, 3, 19, 14, 35, 0),
                FechaResolucion = new DateTime(2026, 3, 20, 10, 0, 0),
                Estado = "R",
                Origen = "Vacaciones",
                SpOrigen = "pa_errorVacacionesGeneral",
                Asunto = "Errores en cálculo de vacaciones - Marzo 2026",
                Descripcion = "3 colaboradores con saldo de vacaciones negativo detectado.",
                CantidadRegistros = 3,
                Destinatarios = "nomina@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 3, 1),
                PeriodoFin = new DateTime(2026, 3, 19),
                FechaModificacion = new DateTime(2026, 3, 20, 10, 0, 0),
                UsuarioResolucion = "jperez",
                NotasResolucion = "Saldos corregidos manualmente en el sistema."
            },
            new()
            {
                IdNotificacion = 3,
                FechaCreacion = new DateTime(2026, 3, 19, 9, 0, 0),
                FechaEnvio = new DateTime(2026, 3, 19, 9, 2, 0),
                Estado = "A",
                Origen = "Marcajes",
                SpOrigen = "pa_validarMarcajes_correo",
                Asunto = "42 colaboradores sin marcaje de entrada ayer",
                Descripcion = "Colaboradores de la región Costa no registraron marcaje de entrada el 18/03.",
                CantidadRegistros = 42,
                Destinatarios = "rrhh.costa@kfc.com.ec;supervisores.costa@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 3, 18),
                PeriodoFin = new DateTime(2026, 3, 18)
            },
            new()
            {
                IdNotificacion = 4,
                FechaCreacion = new DateTime(2026, 3, 18, 16, 45, 0),
                Estado = "E",
                Origen = "Horarios",
                SpOrigen = "pa_JornadaMalCreada",
                Asunto = "Jornadas mal configuradas en 5 tiendas",
                Descripcion = "Se encontraron jornadas con hora de inicio posterior a hora de fin.",
                CantidadRegistros = 5,
                Destinatarios = "planificacion@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 3, 15),
                PeriodoFin = new DateTime(2026, 3, 18)
            },
            new()
            {
                IdNotificacion = 5,
                FechaCreacion = new DateTime(2026, 3, 18, 11, 0, 0),
                FechaEnvio = new DateTime(2026, 3, 18, 11, 3, 0),
                FechaResolucion = new DateTime(2026, 3, 19, 8, 0, 0),
                Estado = "R",
                Origen = "Bajas",
                SpOrigen = "pa_Errores_Bajas",
                Asunto = "2 bajas sin liquidación procesada",
                Descripcion = "Colaboradores dados de baja sin registro de liquidación en el periodo.",
                CantidadRegistros = 2,
                Destinatarios = "nomina@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 3, 1),
                PeriodoFin = new DateTime(2026, 3, 18),
                FechaModificacion = new DateTime(2026, 3, 19, 8, 0, 0),
                UsuarioResolucion = "mrodriguez",
                NotasResolucion = "Liquidaciones generadas y aprobadas."
            },
            new()
            {
                IdNotificacion = 6,
                FechaCreacion = new DateTime(2026, 3, 17, 7, 30, 0),
                FechaEnvio = new DateTime(2026, 3, 17, 7, 32, 0),
                Estado = "C",
                Origen = "Cargas Familiares",
                SpOrigen = "pa_avisos_cargasFamiliares",
                Asunto = "8 cargas familiares con documentación vencida",
                Descripcion = "Cargas familiares cuyos documentos de respaldo superaron la fecha de vigencia.",
                CantidadRegistros = 8,
                Destinatarios = "rrhh@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 2, 1),
                PeriodoFin = new DateTime(2026, 3, 17)
            },
            new()
            {
                IdNotificacion = 7,
                FechaCreacion = new DateTime(2026, 3, 20, 6, 0, 0),
                FechaEnvio = new DateTime(2026, 3, 20, 6, 1, 0),
                Estado = "A",
                Origen = "Transferencias",
                SpOrigen = "pa_transferencias_vencidas",
                Asunto = "3 transferencias bancarias vencidas sin confirmar",
                Descripcion = "Transferencias generadas hace más de 72h sin confirmación de banco.",
                CantidadRegistros = 3,
                Destinatarios = "tesoreria@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 3, 16),
                PeriodoFin = new DateTime(2026, 3, 20)
            },
            new()
            {
                IdNotificacion = 8,
                FechaCreacion = new DateTime(2026, 3, 16, 13, 0, 0),
                FechaEnvio = new DateTime(2026, 3, 16, 13, 5, 0),
                Estado = "A",
                Origen = "Jerarquías",
                SpOrigen = "pa_mismojefe1y2",
                Asunto = "12 colaboradores con mismo Jefe 1 y Jefe 2",
                Descripcion = "Estructura jerárquica inconsistente detectada en región Sierra.",
                CantidadRegistros = 12,
                Destinatarios = "rrhh@kfc.com.ec;organizacion@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 3, 1),
                PeriodoFin = new DateTime(2026, 3, 16)
            },
            new()
            {
                IdNotificacion = 9,
                FechaCreacion = new DateTime(2026, 3, 20, 7, 0, 0),
                Estado = "A",
                Origen = "Trabajadores",
                SpOrigen = "pa_colaboradores_reingresos",
                Asunto = "4 reingresos pendientes de validación",
                Descripcion = "Colaboradores reingresados que requieren verificación de datos actualizados.",
                CantidadRegistros = 4,
                Destinatarios = "nomina@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 3, 18),
                PeriodoFin = new DateTime(2026, 3, 20)
            },
            new()
            {
                IdNotificacion = 10,
                FechaCreacion = new DateTime(2026, 3, 15, 10, 0, 0),
                FechaEnvio = new DateTime(2026, 3, 15, 10, 2, 0),
                FechaResolucion = new DateTime(2026, 3, 16, 9, 0, 0),
                Estado = "R",
                Origen = "Ausencias",
                SpOrigen = "pa_enfermedadconsecutiva",
                Asunto = "Enfermedad consecutiva > 3 días sin certificado médico",
                Descripcion = "2 colaboradores con ausencia por enfermedad extendida sin respaldo.",
                CantidadRegistros = 2,
                Destinatarios = "rrhh@kfc.com.ec",
                PeriodoInicio = new DateTime(2026, 3, 12),
                PeriodoFin = new DateTime(2026, 3, 15),
                FechaModificacion = new DateTime(2026, 3, 16, 9, 0, 0),
                UsuarioResolucion = "alopez",
                NotasResolucion = "Certificados médicos recibidos y registrados."
            }
        };
    }
}
