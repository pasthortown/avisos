# Analisis de Stored Procedures de Alertas - PayRoll

**Fecha de analisis:** 2026-03-20
**Total SPs analizados:** 68
**Schema comun:** `[Avisos]`
**Base de datos:** `DB_NOMKFC`

---

## 1. DETALLE POR STORED PROCEDURE

---

### 1. ccoSinPersonal
- **Proposito:** Alerta sobre CCOs abiertos que no tienen trabajadores activos asignados.
- **Fecha:** Si - usa GETDATE() para fecha de ejecucion, la inyecta en el HTML.
- **Estados:** No maneja estados de alerta.
- **Categoria/Origen:** Centros de Costo (CCO sin personal).
- **Descripcion/Mensaje:** Si - genera HTML con tabla de CCOs sin personal, template desde `Configuracion.parametros` (parametro `AL_CCO_Sin_Trab`).
- **Destinatarios:** Si - desde `Configuracion.parametros` campo `valor`.
- **Envia correo:** Si - `sp_send_dbmail`, profile `Informacion_Nomina`.
- **Tablas principales:** `Adam.dbo.fpv_agr_com_clase`, `RRHH.vw_datosTrabajadores`, `Configuracion.parametros`.

---

### 2. pa_Cambio_Cargo
- **Proposito:** Notifica cuando un colaborador tiene un cambio de cargo.
- **Fecha:** Si - GETDATE() como fecha/hora del evento. Recibe `@fecha_antiguedad` y `@fecha_baja` como parametros.
- **Estados:** No.
- **Categoria/Origen:** Cambios de Cargo.
- **Descripcion/Mensaje:** Si - body HTML con template desde parametro `AL_Cambio_Cargo`, reemplaza placeholders.
- **Destinatarios:** Si - desde `Configuracion.parametros` campo `valor`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Configuracion.parametros`, `db_nomkfc.logs.log_usuarios` (log de errores).

---

### 3. pa_Cambio_RelacionLaboral
- **Proposito:** Notifica cambio de relacion laboral (tipo de contrato) de un empleado.
- **Fecha:** Si - GETDATE(). Recibe `@fecha_ini`, `@fecha_fin`.
- **Estados:** No.
- **Categoria/Origen:** Cambios de Relacion Laboral.
- **Descripcion/Mensaje:** Si - template desde parametro `AL_Cam_rel_lab`.
- **Destinatarios:** Si - desde `Configuracion.parametros`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `Configuracion.parametros`.

---

### 4. pa_Cambio_cco
- **Proposito:** Notifica cambio de centro de costos de un trabajador.
- **Fecha:** Si - GETDATE(). Recibe `@fecha_ini`, `@fecha_fin`.
- **Estados:** No.
- **Categoria/Origen:** Cambios de CCO.
- **Descripcion/Mensaje:** Si - template desde parametro `AL_Cambio`.
- **Destinatarios:** Si - desde `Configuracion.parametros`.
- **Envia correo:** Si - `sp_send_dbmail`. Tambien registra en `Logs.log_envio_correo`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `Catalogos.VW_CCO`, `Configuracion.parametros`, `Logs.log_envio_correo`.

---

### 5. pa_ConsultaAvisosTiendasCCO
- **Proposito:** Genera avisos para tiendas por CCO (cargas por aprobar, reingresos, contratos, lactancia, etc.). Retorna datos para mostrar en la app web, NO envia correo.
- **Fecha:** Si - GETDATE() como fecha del aviso.
- **Estados:** Si - estados de cargas familiares (0=por aprobar), tipo de aviso (smallint).
- **Categoria/Origen:** Avisos de Tiendas (multiples: cargas familiares, reingresos, contratos vencidos, lactancia).
- **Descripcion/Mensaje:** Si - genera `mensajeCorto` y `mensajeLargo` con datos del aviso.
- **Destinatarios:** No envia correo - retorna datos a la app.
- **Envia correo:** NO.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `Cargas.familiares_personas`, `Cargas.Tipo_CargasFamiliares`, `rrhh.vw_personal_lactancia`.

---

### 6. pa_Errores_Bajas
- **Proposito:** Detecta errores en procesos de baja (marcajes faltantes/posteriores, horarios, vacaciones, ausencias vigentes).
- **Fecha:** Si - calcula periodo de nomina con GETDATE(), usa fechas de baja.
- **Estados:** Si - usa estatus de marcajes (0, 1, 2, 3, 4).
- **Categoria/Origen:** Errores en Bajas / Pre-Bajas.
- **Descripcion/Mensaje:** Si - genera HTML con tabla de errores detallados y descripcion de cada tipo de observacion.
- **Destinatarios:** Si - desde parametro `AL_Error_Baja`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `adam.dbo.Indices_FPV_BajasCalculo`, `RRHH.vw_datosTrabajadores`, `Asistencia.marcajes`, `Asistencia.rel_trab_horarios`, `Vacacion.Solicitud_vacaciones`, `Ausencias.Accidentes`, `Asistencia.calculosHorarios`, `Asistencia.costos_marcaciones`.

---

### 7. pa_JornadaMalCreada
- **Proposito:** Detecta jornadas laborales con errores en su definicion (horarios mal configurados).
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Errores en Jornadas.
- **Descripcion/Mensaje:** Si - genera HTML con tabla de jornadas erroneas.
- **Destinatarios:** Si - desde parametro `AL_Jornadas`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Asistencia.jornadas_definicion`, `Asistencia.tiempos_Descanso`, `Asistencia.tipos_jornadas`, `Catalogos.VW_CCO`.

---

### 8. pa_PersonalActualizadoNA
- **Proposito:** Envia listado de personal activo en nomina con clasificacion administrativa.
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Informacion de Nomina (Personal Activo).
- **Descripcion/Mensaje:** Si - HTML con tabla de personal activo.
- **Destinatarios:** Si - desde parametro `AL_PerNomActAct`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `Catalogos.VW_CCO`.

---

### 9. pa_TrabajadoresValidacion
- **Proposito:** Valida datos de trabajadores en Adam Consolidados (campos NULL, horas semanales, montos P&G).
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Validacion de Datos de Trabajadores.
- **Descripcion/Mensaje:** Si - HTML con multiples tablas de validacion.
- **Destinatarios:** Si - desde parametro `AvisosTrabMonto`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Adam_Consolidados.dbo.TB_Trabajadores`, `Adam_Consolidados.dbo.TB_Trabajadores_Mes`, `Adam_Consolidados.dbo.TB_Montos_PyG`.

---

### 10. pa_Transferencias
- **Proposito:** Detecta errores en transferencias de personal entre CCOs (marcajes, horarios, datos diarios faltantes).
- **Fecha:** Si - periodo de nomina con GETDATE().
- **Estados:** Si - estatus de transferencia (3=aprobada, 8=retorno).
- **Categoria/Origen:** Transferencias de Personal.
- **Descripcion/Mensaje:** Si - HTML con errores encontrados.
- **Destinatarios:** Si - desde parametro `AL_Transf`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Asistencia.transferencias`, `Asistencia.hist_transferencias`, `Asistencia.rel_trab_horarios`, `Asistencia.marcajes`, `RRHH.trabajadoresDatosDiario`.

---

### 11. pa_alertaPermisoEnfermedadConMarcajes
- **Proposito:** Detecta trabajadores con permiso por enfermedad/hospitalizacion que tienen marcajes el mismo dia.
- **Fecha:** Si - GETDATE() como fecha del dia.
- **Estados:** Si - estado del permiso (1=activo).
- **Categoria/Origen:** Permisos por Enfermedad.
- **Descripcion/Mensaje:** Si - HTML con tabla de resultados.
- **Destinatarios:** Si - hardcoded `smosquera@sipecom.com`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Asistencia.permisos_trabajadores`, `RRHH.vw_datosTrabajadores`, `Catalogos.VW_CCO`.

---

### 12. pa_aniversario
- **Proposito:** Envia correo de felicitacion por aniversario laboral al colaborador.
- **Fecha:** Si - GETDATE(), compara con `Fecha_Antiguedad`.
- **Estados:** Si - estado de configuracion de aniversario (an.estado = 1).
- **Categoria/Origen:** Aniversarios Laborales.
- **Descripcion/Mensaje:** Si - HTML personalizado con imagen y nombre del colaborador.
- **Destinatarios:** Si - usa mail del trabajador y jefe1, con hardcoded como fallback.
- **Envia correo:** Si - `sp_send_dbmail`. Registra en `Logs.log_envio_correo`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `Asistencia.aniversario`.

---

### 13. pa_avisos_biometricosDiel
- **Proposito:** Consulta multiples avisos sobre biometricos DIEL (segun parametro @tipo): administradores, enrolados, duplicados, etc. Solo retorna datasets, NO envia correo.
- **Fecha:** Si - GETDATE() para comparaciones diarias.
- **Estados:** No directamente.
- **Categoria/Origen:** Biometricos (DIEL).
- **Descripcion/Mensaje:** No - solo retorna resultsets.
- **Destinatarios:** No.
- **Envia correo:** NO.
- **Tablas principales:** `catalogos.vw_cco`, `[srvv-biomdb].BiometricosDIEL.dbo.TBL_REALTIME_ENROLL_DATA`, `RRHH.vw_datosTrabajadores`, `RRHH.trabajadoresDatosDiario`.

---

### 14. pa_avisos_cargasFamiliares
- **Proposito:** Consulta cargas familiares (hijos) de trabajadores que deberian tener maternidad/paternidad y no la tienen. Solo retorna datos.
- **Fecha:** Si - filtro por `fecha_nacimiento >= '20230101'`.
- **Estados:** No.
- **Categoria/Origen:** Cargas Familiares / Ausencias.
- **Descripcion/Mensaje:** No.
- **Destinatarios:** No.
- **Envia correo:** NO.
- **Tablas principales:** `Cargas.vw_cargasPersonal`, `RRHH.vw_datosTrabajadores`, `Ausencias.Accidentes`.

---

### 15. pa_avisos_jerarquias2
- **Proposito:** Multiples consultas (segun @tipo 15-32) sobre jerarquias, jefes, cargos, mano de obra, CAR. Solo retorna datos, NO envia correo directamente.
- **Fecha:** No.
- **Estados:** No.
- **Categoria/Origen:** Jerarquias / Cargos / Estructura Organizacional.
- **Descripcion/Mensaje:** No directamente (retorna datasets).
- **Destinatarios:** No.
- **Envia correo:** NO (es consumido por otros SPs o la app).
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `Catalogos.centro_costos`, `Cargos.cargos`, `Cargos.rel_claseNomina_cargos`, `Adam.dbo.rel_trab_agr`.

---

### 16. pa_avisos_problemas_marcajes_horarios
- **Proposito:** Consultas sobre problemas en marcajes y horarios (HE indebidas, CCO sin asentar, horarios faltantes). Solo retorna datos.
- **Fecha:** Si - periodo de nomina de tiendas.
- **Estados:** Si - estatus de marcajes (3, 4).
- **Categoria/Origen:** Marcajes / Horarios.
- **Descripcion/Mensaje:** No directamente.
- **Destinatarios:** No.
- **Envia correo:** NO.
- **Tablas principales:** `Asistencia.marcajes`, `RRHH.trabajadoresDatosDiario`, `Cargos.rel_claseNomina_cargos`, `Catalogos.VW_CCO`.

---

### 17. pa_biometricos_inactivos
- **Proposito:** Alerta sobre novedades en biometricos: nombres repetidos, desactivados con marcajes, CCOs sin biometrico, activados sin info, no relacionados.
- **Fecha:** Si - GETDATE().
- **Estados:** Si - CONNECTED (0/1), estados de biometrico.
- **Categoria/Origen:** Biometricos.
- **Descripcion/Mensaje:** Si - HTML con multiples secciones de novedades.
- **Destinatarios:** Si - desde parametro `AltNovBio`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `integracion.Diel_Tbl_FKdevice_Status`, `integracion.Diel_Tbl_Locations`, `Catalogos.centro_costos`, `TMP_Marcaje_WS_Competencia`.

---

### 18. pa_calculosHorarios
- **Proposito:** Detecta CCOs donde el calculo del costo horario no coincide con los horarios asignados.
- **Fecha:** Si - periodo de nomina con GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Calculo de Costo Horario.
- **Descripcion/Mensaje:** Si - HTML desde parametro `AL_Calculo_Hor`.
- **Destinatarios:** Si - desde `Configuracion.parametros`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Asistencia.calculosHorarios`, `Asistencia.rel_trab_horarios`, `Adam.dbo.FPV_AGR_COM_CLASE`, `Catalogos.VW_CCO`.

---

### 19. pa_cambiosEmpresasAP
- **Proposito:** Notifica cambios de empresa mediante Acciones de Personal (AP) donde la fecha efectiva difiere del mes de creacion.
- **Fecha:** Si - GETDATE(), mes anterior.
- **Estados:** Si - estado de AP (7, 5).
- **Categoria/Origen:** Acciones de Personal (Cambio de Empresa).
- **Descripcion/Mensaje:** Si - HTML con tabla de cambios.
- **Destinatarios:** Si - desde funcion `fn_correosVariosRemitentes('RecibNotPrebaja')` y parametro `Mail_APCE`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `AP.AccionesPersonal`, `RRHH.vw_datosTrabajadores`, `Catalogos.VW_CCO`.

---

### 20. pa_cambiosFechasBajas
- **Proposito:** Notifica cuando se cambia la fecha de baja de un trabajador en PRT.
- **Fecha:** Si - recibe `@fechaAnt` y `@fechaNew`, usa GETDATE().
- **Estados:** Si - estatus de marcajes (0,1,2=Pendiente, 3=Asentado, 4=Legalizado).
- **Categoria/Origen:** Cambios de Fecha de Baja.
- **Descripcion/Mensaje:** Si - HTML con detalle del trabajador, marcajes y horarios.
- **Destinatarios:** Si - desde parametros `MAILAVICFB` y `MAILAVICFCB` (copia).
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.Prebajas_PRT`, `RRHH.vw_datosTrabajadores`, `Asistencia.marcajes`, `Asistencia.rel_trab_horarios`.

---

### 21. pa_cambiosFechasBajasOLD
- **Proposito:** Version anterior de pa_cambiosFechasBajas (misma logica, menos detalle).
- **Fecha:** Si.
- **Estados:** Si.
- **Categoria/Origen:** Cambios de Fecha de Baja (OLD).
- **Descripcion/Mensaje:** Si.
- **Destinatarios:** Si - desde parametros `MAILAVICFB` y `MAILAVICFCB`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** Mismas que pa_cambiosFechasBajas.

---

### 22. pa_cargafamiliarimpuestoalarenta
- **Proposito:** Alerta cuando se legaliza una carga familiar de un asociado que declara impuesto a la renta.
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Cargas Familiares / Impuesto a la Renta.
- **Descripcion/Mensaje:** Si - template desde parametro `CARFAM_IR_MAIL`.
- **Destinatarios:** Si - desde `Configuracion.parametros`, default `info.nomina@kfc.com.ec`.
- **Envia correo:** Si - `sp_send_dbmail` con importancia Alta.
- **Tablas principales:** `Configuracion.parametros`, `Logs.log_envio_correo`.

---

### 23. pa_cargasFamiliaresEstadoCivilConyugue
- **Proposito:** Alerta sobre cargas familiares tipo conyuge con estado civil distinto a Casado o Union de Hecho.
- **Fecha:** Si - GETDATE().
- **Estados:** Si - estado de carga (0=Por Aprobar, 2=Legalizado, 4=Creado, 5=Inactivo).
- **Categoria/Origen:** Cargas Familiares.
- **Descripcion/Mensaje:** Si - HTML con tabla detallada.
- **Destinatarios:** Si - desde parametro `Mail_CFCEDACOUH`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Cargas.familiares_personas`, `RRHH.vw_datosTrabajadores`.

---

### 24. pa_cargosgtesjefoprTiendasMal
- **Proposito:** Verifica que los jefes 1 y 2 de CCOs locales tengan el cargo correcto segun parametro `cargo_gteTienda`.
- **Fecha:** No explicitamente (solo en ejecucion).
- **Estados:** No.
- **Categoria/Origen:** Jerarquias / Cargos de Tienda.
- **Descripcion/Mensaje:** Si - HTML con listado de CCOs con cargos incorrectos.
- **Destinatarios:** Si - desde parametros `Avisos_Varios` y `Avisos_VariosC`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Catalogos.centro_costos`, `RRHH.vw_datosTrabajadores`, `Cargos.cargos`.

---

### 25. pa_colaboradores_expatriados
- **Proposito:** Identifica colaboradores activos con historial de salida por expatriacion y colaboradores saliendo con motivo expatriado.
- **Fecha:** Si - GETDATE(), rango del mes actual.
- **Estados:** No.
- **Categoria/Origen:** Expatriados.
- **Descripcion/Mensaje:** Si - HTML con tabla y/o adjunto CSV.
- **Destinatarios:** Si - desde parametro `AlrExpAct`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `RRHH.Personas`, `RRHH.PreBajas_PRT`, `RRHH.PreBajas`, `catalogos.motivosBaja`, `catalogos.causasBaja`.

---

### 26. pa_colaboradores_reingresos
- **Proposito:** Notifica reingresos de colaboradores (lunes: todo el mes; otros dias: dia anterior).
- **Fecha:** Si - GETDATE(), logica diferenciada por dia de la semana.
- **Estados:** No.
- **Categoria/Origen:** Reingresos.
- **Descripcion/Mensaje:** Si - HTML + CSV adjunto.
- **Destinatarios:** Si - desde parametro `AlrClbRein`.
- **Envia correo:** Si - `sp_send_dbmail` con adjunto CSV.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `RRHH.Personas`.

---

### 27. pa_correo_avisos_varios
- **Proposito:** Orquestador que llama a otros SPs de avisos (pa_trabMenos2Benf, etc.). Varios estan comentados.
- **Fecha:** No directamente.
- **Estados:** No.
- **Categoria/Origen:** Avisos Varios (orquestador).
- **Descripcion/Mensaje:** No directamente.
- **Destinatarios:** No directamente.
- **Envia correo:** NO directamente (delega a sub-SPs).
- **Tablas principales:** N/A (llama otros SPs).

---

### 28. pa_creditosPrtvsSinCupon
- **Proposito:** Valida cuadre de creditos ingresados en PayRoll vs creditos sin cupon. Retorna datos de descuadre, NO envia correo.
- **Fecha:** Si - ultimos 3 dias desde GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Creditos de Tienda.
- **Descripcion/Mensaje:** Si - genera mensaje de alerta en texto.
- **Destinatarios:** No directamente.
- **Envia correo:** NO.
- **Tablas principales:** `CreditosTienda.RegistroCreditos`, `CreditosTienda.creditos_gte_ws`, `CreditosTienda.CCO_danCredito`.

---

### 29. pa_cuentas_duplicadas
- **Proposito:** Detecta cuentas bancarias duplicadas o inconsistentes en colaboradores activos.
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Cuentas Bancarias.
- **Descripcion/Mensaje:** Si - HTML con dos reportes (cuentas diferentes y duplicadas).
- **Destinatarios:** Si - desde parametro `AL_DUPCTA`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `RRHH.Cuentas_Trab`.

---

### 30. pa_diferencias_he_a_hea
- **Proposito:** Detecta diferencias entre horas extras calculadas (he) y horas extras aprobadas (hea). Solo retorna datos, NO envia correo.
- **Fecha:** Si - periodo de nomina.
- **Estados:** Si - estatus de marcajes.
- **Categoria/Origen:** Horas Extras.
- **Descripcion/Mensaje:** No directamente.
- **Destinatarios:** No.
- **Envia correo:** NO.
- **Tablas principales:** `Asistencia.marcajes`, `RRHH.vw_datosTrabajadores`.

---

### 31. pa_diferencias_usuarios_documentId
- **Proposito:** Detecta diferencias entre USER_ID y DOCUMENT_ID en biometricos DIEL.
- **Fecha:** Si - GETDATE().
- **Estados:** Si - ACTIVE (1=Activo).
- **Categoria/Origen:** Biometricos (Datos de Usuario).
- **Descripcion/Mensaje:** Si - HTML con tabla de novedades.
- **Destinatarios:** Si - desde parametro `DifUserDocId`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `integracion.Diel_Tbl_Realtime_Enroll_Data`, `integracion.biometricos`.

---

### 32. pa_enfermedadconsecutiva
- **Proposito:** Identifica enfermedades y dias libres consecutivos (3+ dias) reportados en marcajes.
- **Fecha:** Si - periodo de nomina + 7 dias antes.
- **Estados:** No.
- **Categoria/Origen:** Ausentismo / Enfermedad Consecutiva.
- **Descripcion/Mensaje:** Si - HTML + CSV adjunto. Envia correo general y por analista de nomina.
- **Destinatarios:** Si - desde parametro `EnfDiaLib`, y correos por analista via `fn_correosVariosRemitentesContactoTiendas`.
- **Envia correo:** Si - `sp_send_dbmail` (multiple: general + por analista).
- **Tablas principales:** `Asistencia.marcajes`, `RRHH.vw_datosTrabajadores`, `Catalogos.vw_cco`, `Ausencias.Accidentes`.

---

### 33. pa_enrolado_mas_un_cco
- **Proposito:** Detecta usuarios enrolados en mas de un centro de costos en biometricos.
- **Fecha:** Si - GETDATE().
- **Estados:** Si - ACTIVE (Activo/Inactivo).
- **Categoria/Origen:** Biometricos (Enrolamiento Multiple).
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `EnrMasUnCCO`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `integracion.Diel_Tbl_Realtime_Enroll_Data`, `integracion.biometricos`, `RRHH.trabajadoresDatosDiario`.

---

### 34. pa_enrolado_no_consta
- **Proposito:** Detecta usuarios enrolados en biometricos que no existen en la base de datos de PayRoll.
- **Fecha:** Si - GETDATE().
- **Estados:** Si - ACTIVE.
- **Categoria/Origen:** Biometricos (Usuario No Registrado).
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `EnrNoCnst`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `integracion.Diel_Tbl_Realtime_Enroll_Data`, `integracion.biometricos`, `RRHH.vw_datosTrabajadores`.

---

### 35. pa_enviarDatosCCO
- **Proposito:** Envia datos de centros de costos como CSV adjunto (informativo, no alerta de error).
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Datos CCO (Informativo).
- **Descripcion/Mensaje:** Si - HTML basico + CSV adjunto.
- **Destinatarios:** Si - hardcoded `pasante.nominadosec@kfc.com.ec`.
- **Envia correo:** Si - `sp_send_dbmail` con adjunto.
- **Tablas principales:** `Catalogos.centro_costos`, `Catalogos.VW_CCO`.

---

### 36. pa_errorAusencia
- **Proposito:** Detecta ausencias (maternidad, paternidad, enfermedad) sin horarios o marcajes correspondientes, y vacaciones sin horarios/marcajes.
- **Fecha:** Si - periodo de nomina.
- **Estados:** Si - estado de solicitud de vacacion (3, 1).
- **Categoria/Origen:** Errores en Ausencias y Vacaciones.
- **Descripcion/Mensaje:** Si - HTML con tablas de errores.
- **Destinatarios:** Si - desde parametros `AL_Ausencia` y `AL_Vacacion`.
- **Envia correo:** Si - `sp_send_dbmail` (2 correos: ausencias y vacaciones).
- **Tablas principales:** `Ausencias.Accidentes`, `RRHH.vw_datosTrabajadores`, `Asistencia.rel_trab_horarios`, `Asistencia.marcajes`, `Vacacion.Solicitud_vacaciones`.

---

### 37. pa_errorAusenciaMarcaje
- **Proposito:** Detecta ausencias sin marcacion de ausencia o marcaciones de ausencia sin ausencia registrada.
- **Fecha:** Si - periodo de nomina.
- **Estados:** No directamente.
- **Categoria/Origen:** Error Ausencias vs Marcajes.
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `AL_Aus_Marcaje`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Ausencias.Accidentes`, `Asistencia.marcajes`, `Vacacion.Solicitud_vacaciones`, `RRHH.vw_datosTrabajadores`.

---

### 38. pa_errorVacacionMarcaje
- **Proposito:** Detecta vacaciones sin marcacion o marcaciones de vacacion sin vacacion registrada.
- **Fecha:** Si - periodo de nomina.
- **Estados:** No.
- **Categoria/Origen:** Error Vacaciones vs Marcajes.
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `AL_Vac_Marcaje`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Vacacion.Solicitud_vacaciones`, `Asistencia.marcajes`, `Ausencias.Accidentes`, `RRHH.vw_datosTrabajadores`.

---

### 39. pa_errorVacacionesGeneral
- **Proposito:** Comprueba consistencia de solicitudes de vacacion en 4 tablas de vacacion (solicitud, preprogramacion, detalle, saldos).
- **Fecha:** Si - desde 2022-01-01 hasta GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Errores en Vacaciones (General).
- **Descripcion/Mensaje:** Si - HTML con errores.
- **Destinatarios:** Si - desde parametro `AL_Vac_Gral`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Vacacion.Solicitud_vacaciones`, `Vacacion.sol_vacaciones_pre`, `Vacacion.sol_vacaciones_det`.

---

### 40. pa_errorVacacionesGeneralDennis
- **Proposito:** Variante de pa_errorVacacionesGeneral destinada a Dennis Suarez.
- **Fecha:** Si.
- **Estados:** No.
- **Categoria/Origen:** Errores en Vacaciones.
- **Descripcion/Mensaje:** Si.
- **Destinatarios:** Si - hardcoded `dennis.suarez@gmail.com`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** Mismas que pa_errorVacacionesGeneral.

---

### 41. pa_errorVacacionesGeneralDennisRepara
- **Proposito:** Variante que ademas de detectar errores de vacaciones, ejecuta reparaciones automaticas.
- **Fecha:** Si.
- **Estados:** No.
- **Categoria/Origen:** Errores en Vacaciones (con reparacion).
- **Descripcion/Mensaje:** Si.
- **Destinatarios:** Si - desde parametro `AL_Vac_Gral`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** Mismas + operaciones de UPDATE/DELETE.

---

### 42. pa_erroresSolVacvsSolVacPre
- **Proposito:** Compara solicitudes de vacaciones vs preprogramacion para detectar inconsistencias.
- **Fecha:** Si - periodo de nomina.
- **Estados:** No.
- **Categoria/Origen:** Errores Vacaciones (Solicitud vs Pre-programacion).
- **Descripcion/Mensaje:** Si - HTML desde parametro `AL_VacSolProPre`.
- **Destinatarios:** Si - desde parametro `AL_VacSolProPre`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Vacacion.Solicitud_vacaciones`, `Vacacion.sol_vacaciones_pre`.

---

### 43. pa_erroresVacacionesSinDetalle
- **Proposito:** Detecta solicitudes de vacaciones que no tienen detalle asociado.
- **Fecha:** Si - periodo de nomina.
- **Estados:** No.
- **Categoria/Origen:** Errores Vacaciones (Sin Detalle).
- **Descripcion/Mensaje:** Si - HTML desde parametro `AL_VacSinDet`.
- **Destinatarios:** Si - desde parametro `AL_VacSinDet`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Vacacion.Solicitud_vacaciones`, `Vacacion.sol_vacaciones_det`.

---

### 44. pa_existemarcaje
- **Proposito:** Verifica existencia de marcajes para trabajadores activos en CCOs con biometrico y notifica faltantes.
- **Fecha:** Si - GETDATE(), periodo de nomina.
- **Estados:** Si - estatus de marcajes.
- **Categoria/Origen:** Marcajes Faltantes.
- **Descripcion/Mensaje:** Si - HTML con tabla de faltantes.
- **Destinatarios:** Si - desde parametro `CO_Marcaje`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Asistencia.marcajes`, `RRHH.vw_datosTrabajadores`, `Catalogos.centro_costos`.

---

### 45. pa_faltantecaja
- **Proposito:** Alerta sobre faltantes de caja en nominas ya cerradas/legalizadas.
- **Fecha:** Si - GETDATE().
- **Estados:** Si - estatus de marcaje (4=Legalizado).
- **Categoria/Origen:** Faltantes de Caja.
- **Descripcion/Mensaje:** Si - template desde parametro `AL_Falt_Caja`. Registra en `Logs.log_envio_correo`.
- **Destinatarios:** Si - desde parametro `AL_Falt_Caja`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Asistencia.marcajes`, `Nomina.calendario_nominas`.

---

### 46. pa_fechas_calendario
- **Proposito:** Consulta/utilidad para fechas de calendario de nomina. NO envia correo.
- **Fecha:** Si - maneja fechas de calendario.
- **Estados:** No.
- **Categoria/Origen:** Utilidad (Calendario).
- **Descripcion/Mensaje:** No.
- **Destinatarios:** No.
- **Envia correo:** NO.
- **Tablas principales:** `Nomina.calendario_nominas`.

---

### 47. pa_fnjMarcaje
- **Proposito:** Detecta marcajes con estado FNJ (Falta No Justificada) y alerta tardanza en asentamiento.
- **Fecha:** Si - periodo de nomina.
- **Estados:** Si - estatus de marcajes.
- **Categoria/Origen:** Marcajes FNJ / Asentamiento Tardio.
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `AL_FNJ_LLAT`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Asistencia.marcajes`, `RRHH.vw_datosTrabajadores`.

---

### 48. pa_llenarAvisosTiendas
- **Proposito:** Orquestador que llama a `pa_ConsultaAvisosTiendasCCO` para cada CCO. Llena tabla de avisos de tiendas. NO envia correo.
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Avisos de Tiendas (Orquestador).
- **Descripcion/Mensaje:** No directamente.
- **Destinatarios:** No.
- **Envia correo:** NO.
- **Tablas principales:** `Catalogos.centro_costos`, avisos generados por sub-SP.

---

### 49. pa_mismojefe1y2
- **Proposito:** Detecta CCOs locales donde jefe1 y jefe2 son la misma persona.
- **Fecha:** No.
- **Estados:** No.
- **Categoria/Origen:** Jerarquias (Mismo Jefe).
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `Avisos_MisJef` y `Avisos_MisJefC`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Catalogos.centro_costos`, `RRHH.vw_datosTrabajadores`.

---

### 50. pa_notificacionBiometrico
- **Proposito:** Notifica estado del equipo biometrico (encendido/apagado) al analista de nomina de cada cadena.
- **Fecha:** Si - GETDATE().
- **Estados:** Si - CONNECTED (encendido/apagado).
- **Categoria/Origen:** Biometricos (Estado de Equipo).
- **Descripcion/Mensaje:** Si - template desde parametro `MAilBIOAP`.
- **Destinatarios:** Si - correo del analista por cadena.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `integracion.biometricos`, `Catalogos.VW_CCO`, `Configuracion.parametros`.

---

### 51. pa_permisosconsecutivos
- **Proposito:** Identifica permisos y dias libres consecutivos (3+ dias) en el marcaje.
- **Fecha:** Si - periodo de nomina.
- **Estados:** No.
- **Categoria/Origen:** Permisos Consecutivos.
- **Descripcion/Mensaje:** Si - HTML + CSV adjunto. Envia correo general y por analista.
- **Destinatarios:** Si - desde parametro `PrmDiaLib`, y por analista.
- **Envia correo:** Si - `sp_send_dbmail` (multiple).
- **Tablas principales:** `Asistencia.marcajes`, `RRHH.vw_datosTrabajadores`, `Catalogos.vw_cco`.

---

### 52. pa_trabajadoresCreados
- **Proposito:** Notifica trabajadores creados el dia anterior en la base de datos.
- **Fecha:** Si - GETDATE(), dia anterior.
- **Estados:** No.
- **Categoria/Origen:** Trabajadores Nuevos.
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `AL_Trab_Creado`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `RRHH.Personas`.

---

### 53. pa_trabajadoresHorariosCostoHorario
- **Proposito:** Detecta trabajadores sin horarios o sin calculo de costo horario en el periodo actual.
- **Fecha:** Si - periodo de nomina.
- **Estados:** No.
- **Categoria/Origen:** Horarios / Costo Horario.
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - hardcoded emails.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Asistencia.rel_trab_horarios`, `Asistencia.calculosHorarios`, `RRHH.vw_datosTrabajadores`.

---

### 54. pa_trabajadoresHorariosCostoHorario05092022
- **Proposito:** Version historica (05/09/2022) del SP anterior. Misma logica.
- **Fecha:** Si.
- **Estados:** No.
- **Categoria/Origen:** Horarios / Costo Horario (version anterior).
- **Descripcion/Mensaje:** Si.
- **Destinatarios:** Si - hardcoded emails.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** Mismas.

---

### 55. pa_trabajadoresVariasEmpresasDifCargo
- **Proposito:** Detecta trabajadores en multiples empresas con cargos diferentes.
- **Fecha:** No.
- **Estados:** No.
- **Categoria/Origen:** Trabajadores Multi-Empresa (Diferente Cargo).
- **Descripcion/Mensaje:** Si - HTML.
- **Destinatarios:** Si - desde parametros `Avisos_TVEMP` y `Avisos_VTVEMPC`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `adam.dbo.VW_TrabActivosmasUnaEmpresa`.

---

### 56. pa_transferencias_vencidas
- **Proposito:** Detecta transferencias temporales vencidas (que excedieron su periodo).
- **Fecha:** Si - GETDATE(), parametro `tranf_vence` para dias.
- **Estados:** Si - estatus de transferencia (3=aprobada).
- **Categoria/Origen:** Transferencias Vencidas.
- **Descripcion/Mensaje:** Si - HTML + correos por analista.
- **Destinatarios:** Si - desde parametro `AL_Tran_Venc` + por analista.
- **Envia correo:** Si - `sp_send_dbmail` (multiple).
- **Tablas principales:** `Asistencia.transferencias`, `RRHH.vw_datosTrabajadores`, `Catalogos.VW_CCO`.

---

### 57. pa_usuarioIngresoCumplea
- **Proposito:** Detecta trabajadores cuya fecha de ingreso es igual a su fecha de nacimiento (posible error de datos).
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Validacion de Datos (Ingreso=Cumpleanos).
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `CambioCumple`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`.

---

### 58. pa_usuarios_sin_datos
- **Proposito:** Detecta usuarios enrolados en biometricos con datos incompletos (nombres, cedula vacios).
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Biometricos (Datos Incompletos).
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `EnrSinDts`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `integracion.Diel_Tbl_Realtime_Enroll_Data`, `RRHH.vw_datosTrabajadores`.

---

### 59. pa_usuarios_sin_datosBiometricos
- **Proposito:** Detecta trabajadores activos sin datos en el sistema biometrico.
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Biometricos (Sin Datos).
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametro `UserSinBiom`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `integracion.Diel_Tbl_Realtime_Enroll_Data`, `RRHH.vw_datosTrabajadores`, `Catalogos.VW_CCO`.

---

### 60. pa_vacacionesPtosE3
- **Proposito:** Consulta vacaciones con estados E3. Retorna datos, NO envia correo directamente.
- **Fecha:** Si.
- **Estados:** Si - estado E3 de vacaciones.
- **Categoria/Origen:** Vacaciones.
- **Descripcion/Mensaje:** No directamente.
- **Destinatarios:** Si - tiene variables @correo y @correoCC pero no se usa sp_send_dbmail directamente.
- **Envia correo:** NO directamente.
- **Tablas principales:** `Vacacion.Solicitud_vacaciones`.

---

### 61. pa_vacaciones_pasantes
- **Proposito:** Detecta pasantes que han tomado mas vacaciones de las que les corresponde.
- **Fecha:** Si - GETDATE().
- **Estados:** No.
- **Categoria/Origen:** Vacaciones de Pasantes.
- **Descripcion/Mensaje:** Si - HTML + CSV adjunto.
- **Destinatarios:** Si - desde parametro `AlrVacPas`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Vacacion.Solicitud_vacaciones`, `RRHH.vw_datosTrabajadores`.

---

### 62. pa_validarJerarquiasCarNoPlanta
- **Proposito:** Valida que CCOs no locales (no planta) con jerarquias J1/J2 tengan cargos homologados menores a 060.
- **Fecha:** No.
- **Estados:** No.
- **Categoria/Origen:** Jerarquias (No Planta).
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametros `Avisos_LTJMNC` y `Avisos_LTJN2`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `Catalogos.centro_costos`.

---

### 63. pa_validarJerarquiasCarPlanta
- **Proposito:** Valida jerarquias J1/J2 para CCOs de planta (clase nomina 27, 11) con cargos homologados menores a 070.
- **Fecha:** No.
- **Estados:** No.
- **Categoria/Origen:** Jerarquias (Planta).
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametros `Avisos_LTJM2` y `Avisos_LTJM2C`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`.

---

### 64. pa_validarJerarquiasLocales
- **Proposito:** Valida jerarquias J1/J2 para CCOs locales (tiendas) con cargos homologados menores a 050.
- **Fecha:** No.
- **Estados:** No.
- **Categoria/Origen:** Jerarquias (Locales/Tiendas).
- **Descripcion/Mensaje:** Si - HTML con tabla.
- **Destinatarios:** Si - desde parametros `Avisos_JQL` y `Avisos_JQLC`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Catalogos.centro_costos`, `RRHH.vw_datosTrabajadores`.

---

### 65. pa_validarMarcajes_correo
- **Proposito:** Envia correo al analista de nomina cuando se administran/modifican marcajes de trabajadores.
- **Fecha:** Si - GETDATE(). Recibe parametros de fecha.
- **Estados:** No.
- **Categoria/Origen:** Administracion de Marcajes.
- **Descripcion/Mensaje:** Si - template desde parametro `AL_Marcaje_Admn`.
- **Destinatarios:** Si - correo del analista (variable @var_Analista). Registra en `Logs.log_envio_correo`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `Asistencia.marcajes`, `Configuracion.parametros`, `Logs.log_envio_correo`.

---

### 66. pa_trabMenos2Benf
- **Proposito:** Lista cargos con menos de 2 beneficios asignados. Solo retorna datos (el envio de correo esta comentado).
- **Fecha:** No.
- **Estados:** No.
- **Categoria/Origen:** Beneficios / Cargos.
- **Descripcion/Mensaje:** No (correo comentado).
- **Destinatarios:** No (comentado).
- **Envia correo:** NO (comentado).
- **Tablas principales:** `Cargos.rel_cargos_beneficios`, `Cargos.cargos`, `catalogos.clases_de_nomina`.

---

### 67. pa_trabVarEmpCorreosDif
- **Proposito:** Detecta trabajadores en varias empresas con correos diferentes. El envio de correo esta comentado.
- **Fecha:** No.
- **Estados:** No.
- **Categoria/Origen:** Trabajadores Multi-Empresa (Correos Diferentes).
- **Descripcion/Mensaje:** No (comentado).
- **Destinatarios:** No (comentado).
- **Envia correo:** NO (comentado).
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `adam.dbo.VW_TrabActivosmasUnaEmpresa`.

---

### 68. pa_trabVariasEmpresasJerDif
- **Proposito:** Detecta trabajadores en varias empresas con jerarquias diferentes.
- **Fecha:** No.
- **Estados:** No.
- **Categoria/Origen:** Trabajadores Multi-Empresa (Jerarquias Diferentes).
- **Descripcion/Mensaje:** Si - HTML.
- **Destinatarios:** Si - desde parametros `Avisos_TMEMJ` y `Avisos_TMEMJC`.
- **Envia correo:** Si - `sp_send_dbmail`.
- **Tablas principales:** `RRHH.vw_datosTrabajadores`, `adam.dbo.VW_TrabActivosmasUnaEmpresa`.

---

## 2. TABLA RESUMEN

| # | SP | Tiene Fecha | Tiene Estado | Origen/Categoria | Tiene Descripcion | Tiene Email Destinatario | Envia Correo |
|---|---|---|---|---|---|---|---|
| 1 | ccoSinPersonal | Si | No | CCO sin Personal | Si | Si (param) | Si |
| 2 | pa_Cambio_Cargo | Si | No | Cambio de Cargo | Si | Si (param) | Si |
| 3 | pa_Cambio_RelacionLaboral | Si | No | Cambio Relacion Laboral | Si | Si (param) | Si |
| 4 | pa_Cambio_cco | Si | No | Cambio de CCO | Si | Si (param) | Si |
| 5 | pa_ConsultaAvisosTiendasCCO | Si | Si | Avisos Tiendas (Multi) | Si | No | NO |
| 6 | pa_Errores_Bajas | Si | Si | Errores en Bajas | Si | Si (param) | Si |
| 7 | pa_JornadaMalCreada | Si | No | Jornadas Erroneas | Si | Si (param) | Si |
| 8 | pa_PersonalActualizadoNA | Si | No | Personal Activo (Info) | Si | Si (param) | Si |
| 9 | pa_TrabajadoresValidacion | Si | No | Validacion Datos | Si | Si (param) | Si |
| 10 | pa_Transferencias | Si | Si | Transferencias | Si | Si (param) | Si |
| 11 | pa_alertaPermisoEnfermedadConMarcajes | Si | Si | Permisos Enfermedad | Si | Si (hardcoded) | Si |
| 12 | pa_aniversario | Si | Si | Aniversarios | Si | Si (hibrido) | Si |
| 13 | pa_avisos_biometricosDiel | Si | No | Biometricos (DIEL) | No | No | NO |
| 14 | pa_avisos_cargasFamiliares | Si | No | Cargas Familiares | No | No | NO |
| 15 | pa_avisos_jerarquias2 | No | No | Jerarquias/Cargos | No | No | NO |
| 16 | pa_avisos_problemas_marcajes_horarios | Si | Si | Marcajes/Horarios | No | No | NO |
| 17 | pa_biometricos_inactivos | Si | Si | Biometricos | Si | Si (param) | Si |
| 18 | pa_calculosHorarios | Si | No | Calculo Costo Horario | Si | Si (param) | Si |
| 19 | pa_cambiosEmpresasAP | Si | Si | Acciones Personal (CE) | Si | Si (funcion) | Si |
| 20 | pa_cambiosFechasBajas | Si | Si | Cambio Fecha Baja | Si | Si (param) | Si |
| 21 | pa_cambiosFechasBajasOLD | Si | Si | Cambio Fecha Baja (OLD) | Si | Si (param) | Si |
| 22 | pa_cargafamiliarimpuestoalarenta | Si | No | Cargas Fam./Imp. Renta | Si | Si (param) | Si |
| 23 | pa_cargasFamiliaresEstadoCivilConyugue | Si | Si | Cargas Familiares | Si | Si (param) | Si |
| 24 | pa_cargosgtesjefoprTiendasMal | No | No | Cargos Jefes Tienda | Si | Si (param) | Si |
| 25 | pa_colaboradores_expatriados | Si | No | Expatriados | Si | Si (param) | Si |
| 26 | pa_colaboradores_reingresos | Si | No | Reingresos | Si | Si (param) | Si |
| 27 | pa_correo_avisos_varios | No | No | Orquestador | No | No | NO (delega) |
| 28 | pa_creditosPrtvsSinCupon | Si | No | Creditos Tienda | Si | No | NO |
| 29 | pa_cuentas_duplicadas | Si | No | Cuentas Bancarias | Si | Si (param) | Si |
| 30 | pa_diferencias_he_a_hea | Si | Si | Horas Extras | No | No | NO |
| 31 | pa_diferencias_usuarios_documentId | Si | Si | Biometricos (UserDoc) | Si | Si (param) | Si |
| 32 | pa_enfermedadconsecutiva | Si | No | Ausentismo/Enfermedad | Si | Si (param+func) | Si |
| 33 | pa_enrolado_mas_un_cco | Si | Si | Biometricos (Multi CCO) | Si | Si (param) | Si |
| 34 | pa_enrolado_no_consta | Si | Si | Biometricos (No Existe) | Si | Si (param) | Si |
| 35 | pa_enviarDatosCCO | Si | No | Datos CCO (Info) | Si | Si (hardcoded) | Si |
| 36 | pa_errorAusencia | Si | Si | Errores Ausencias/Vac | Si | Si (param) | Si |
| 37 | pa_errorAusenciaMarcaje | Si | No | Error Ausencia-Marcaje | Si | Si (param) | Si |
| 38 | pa_errorVacacionMarcaje | Si | No | Error Vacacion-Marcaje | Si | Si (param) | Si |
| 39 | pa_errorVacacionesGeneral | Si | No | Errores Vacaciones | Si | Si (param) | Si |
| 40 | pa_errorVacacionesGeneralDennis | Si | No | Errores Vacaciones | Si | Si (hardcoded) | Si |
| 41 | pa_errorVacacionesGeneralDennisRepara | Si | No | Errores Vac (Repara) | Si | Si (param) | Si |
| 42 | pa_erroresSolVacvsSolVacPre | Si | No | Error Vac Sol vs Pre | Si | Si (param) | Si |
| 43 | pa_erroresVacacionesSinDetalle | Si | No | Error Vac Sin Detalle | Si | Si (param) | Si |
| 44 | pa_existemarcaje | Si | Si | Marcajes Faltantes | Si | Si (param) | Si |
| 45 | pa_faltantecaja | Si | Si | Faltantes de Caja | Si | Si (param) | Si |
| 46 | pa_fechas_calendario | Si | No | Utilidad (Calendario) | No | No | NO |
| 47 | pa_fnjMarcaje | Si | Si | Marcajes FNJ | Si | Si (param) | Si |
| 48 | pa_llenarAvisosTiendas | Si | No | Avisos Tiendas (Orq) | No | No | NO |
| 49 | pa_mismojefe1y2 | No | No | Jerarquias (Mismo Jefe) | Si | Si (param) | Si |
| 50 | pa_notificacionBiometrico | Si | Si | Biometricos (Estado) | Si | Si (dinamico) | Si |
| 51 | pa_permisosconsecutivos | Si | No | Permisos Consecutivos | Si | Si (param+func) | Si |
| 52 | pa_trabajadoresCreados | Si | No | Trabajadores Nuevos | Si | Si (param) | Si |
| 53 | pa_trabajadoresHorariosCostoHorario | Si | No | Horarios/Costo Horario | Si | Si (hardcoded) | Si |
| 54 | pa_trabajadoresHorariosCostoHorario05092022 | Si | No | Horarios/Costo (OLD) | Si | Si (hardcoded) | Si |
| 55 | pa_trabajadoresVariasEmpresasDifCargo | No | No | Multi-Empresa Dif Cargo | Si | Si (param) | Si |
| 56 | pa_transferencias_vencidas | Si | Si | Transferencias Vencidas | Si | Si (param+func) | Si |
| 57 | pa_usuarioIngresoCumplea | Si | No | Validacion Datos | Si | Si (param) | Si |
| 58 | pa_usuarios_sin_datos | Si | No | Biometricos (Sin Datos) | Si | Si (param) | Si |
| 59 | pa_usuarios_sin_datosBiometricos | Si | No | Biometricos (Sin Datos) | Si | Si (param) | Si |
| 60 | pa_vacacionesPtosE3 | Si | Si | Vacaciones E3 | No | Si (variable) | NO |
| 61 | pa_vacaciones_pasantes | Si | No | Vacaciones Pasantes | Si | Si (param) | Si |
| 62 | pa_validarJerarquiasCarNoPlanta | No | No | Jerarquias (No Planta) | Si | Si (param) | Si |
| 63 | pa_validarJerarquiasCarPlanta | No | No | Jerarquias (Planta) | Si | Si (param) | Si |
| 64 | pa_validarJerarquiasLocales | No | No | Jerarquias (Locales) | Si | Si (param) | Si |
| 65 | pa_validarMarcajes_correo | Si | No | Admin. Marcajes | Si | Si (dinamico) | Si |
| 66 | pa_trabMenos2Benf | No | No | Beneficios/Cargos | No | No | NO (comentado) |
| 67 | pa_trabVarEmpCorreosDif | No | No | Multi-Empresa Correos | No | No | NO (comentado) |
| 68 | pa_trabVariasEmpresasJerDif | No | No | Multi-Empresa Jerarquias | Si | Si (param) | Si |

---

## 3. ESTADISTICAS

| Metrica | Cantidad | Porcentaje |
|---|---|---|
| **Total SPs** | 68 | 100% |
| **Envian correo directamente** | 52 | 76% |
| **NO envian correo** (solo retornan datos o estan comentados) | 16 | 24% |
| **Tienen fecha** | 60 | 88% |
| **Manejan estados** | 22 | 32% |
| **Generan descripcion/mensaje** | 56 | 82% |
| **Tienen destinatario de email** | 54 | 79% |

### Metodo de obtencion de destinatarios:
| Metodo | Cantidad |
|---|---|
| Desde `Configuracion.parametros` (campo `valor`) | 42 |
| Hardcoded en el SP | 6 |
| Funcion dinamica (`fn_correosVariosRemitentes`, etc.) | 4 |
| Variables de parametro de entrada | 2 |
| No tiene destinatario | 14 |

### Categorias de alerta identificadas:
| Categoria | Cantidad de SPs |
|---|---|
| Biometricos / DIEL | 10 |
| Vacaciones | 8 |
| Marcajes / Horarios / Asistencia | 8 |
| Jerarquias / Cargos / Estructura | 7 |
| Ausencias / Enfermedad | 5 |
| Bajas / Pre-Bajas | 4 |
| Cambios (CCO, Cargo, Relacion Laboral) | 4 |
| Cargas Familiares | 4 |
| Transferencias | 3 |
| Trabajadores Multi-Empresa | 3 |
| Validacion de Datos | 3 |
| Informativo / Datos | 3 |
| Nomina / Costos | 3 |
| Creditos Tienda | 1 |
| Cuentas Bancarias | 1 |
| Aniversarios / RRHH | 2 |
| Orquestadores / Utilidades | 4 |
| Acciones de Personal | 1 |
| Reingresos | 1 |
| Expatriados | 1 |

---

## 4. CONCLUSIONES

### 4.1 Campos minimos: no todos los SPs los tienen

- **Fecha:** 60 de 68 (88%) manejan fecha. Los 8 que no la usan son mayormente SPs de consulta de jerarquias/cargos que retornan datos estaticos.
- **Estado:** Solo 22 de 68 (32%) manejan estados. La mayoria de los SPs son de tipo "detecta y notifica" sin ciclo de vida de la alerta. No existe un concepto de "alerta resuelta" o "alerta caducada" en ningun SP.
- **Origen/Categoria:** Todos los SPs tienen un origen implicito por su nombre/funcion, pero NO tienen un campo estandarizado de categoria. Se infiere por contexto.
- **Descripcion:** 56 de 68 (82%) generan algun tipo de descripcion o mensaje.
- **Destinatario:** 54 de 68 (79%) tienen destinatario definido, pero de formas muy heterogeneas.

### 4.2 Patron comun identificado

Todos los SPs que envian correo siguen un patron similar:

1. **Consulta datos** en tablas temporales.
2. **Verifica si hay resultados** (COUNT > 0).
3. **Si hay resultados:** Construye HTML con tabla(s) y envia correo.
4. **Si no hay resultados:** Envia correo informando "no se encontraron novedades" (en la mayoria de casos).
5. **Profile de correo:** Siempre `Informacion_Nomina`.
6. **Configuracion:** Tabla `Configuracion.parametros` almacena: destinatarios (`valor`), asunto (`descripcion`), template HTML (`referencia_06`), con llave en campo `parametro`.

### 4.3 Problema principal: NO existe concepto de "alerta como entidad"

- Los SPs **no persisten la alerta** en ninguna tabla. Generan el correo y lo envian. No hay trazabilidad.
- No hay tabla de alertas centralizada.
- No hay estados de alerta (creada, enviada, leida, resuelta, caducada).
- No hay historial de alertas.
- La unica "persistencia" es el log de correo en `Logs.log_envio_correo` que algunos SPs usan (solo para registrar el envio o errores).

### 4.4 Recomendaciones para modelado de tabla de alertas

Se propone una tabla `Alertas.alertas` con los siguientes campos:

```sql
CREATE TABLE Alertas.alertas (
    id_alerta           BIGINT IDENTITY(1,1) PRIMARY KEY,

    -- FECHA
    fecha_creacion      DATETIME NOT NULL DEFAULT GETDATE(),   -- cuando se genero la alerta
    fecha_envio         DATETIME NULL,                         -- cuando se envio el correo
    fecha_resolucion    DATETIME NULL,                         -- cuando se marco como resuelta
    fecha_caducidad     DATETIME NULL,                         -- cuando caduca automaticamente

    -- ESTADO
    id_estado           TINYINT NOT NULL DEFAULT 1,            -- 1=Creada, 2=Enviada, 3=Leida, 4=Resuelta, 5=Caducada

    -- ORIGEN
    categoria           VARCHAR(50) NOT NULL,                  -- Ej: 'Biometricos', 'Vacaciones', 'Marcajes', 'Bajas', etc.
    subcategoria        VARCHAR(100) NULL,                     -- Ej: 'Enrolado en mas de un CCO', 'Sin marcaje', etc.
    sp_origen           VARCHAR(128) NOT NULL,                 -- Nombre del SP que genero la alerta
    parametro_config    VARCHAR(30) NULL,                      -- Llave en Configuracion.parametros

    -- DESCRIPCION
    asunto              VARCHAR(300) NOT NULL,                 -- Asunto del correo
    descripcion_corta   VARCHAR(500) NULL,                     -- Resumen del problema
    descripcion_html    VARCHAR(MAX) NULL,                     -- Body HTML completo para correo
    cantidad_registros  INT NULL,                              -- Cuantos registros afectados

    -- DESTINATARIOS
    destinatarios       VARCHAR(MAX) NULL,                     -- Lista de correos (To)
    destinatarios_cc    VARCHAR(MAX) NULL,                     -- Lista de correos (CC)
    destinatarios_bcc   VARCHAR(MAX) NULL,                     -- Lista de correos (BCC)

    -- CONTEXTO
    periodo_inicio      DATE NULL,                             -- Fecha inicio del periodo evaluado
    periodo_fin         DATE NULL,                             -- Fecha fin del periodo evaluado

    -- AUDITORIA
    fecha_modificacion  DATETIME NULL,
    usuario_resolucion  VARCHAR(100) NULL,
    notas_resolucion    VARCHAR(500) NULL,

    -- DATOS ADJUNTOS
    tiene_adjunto       BIT NOT NULL DEFAULT 0,
    nombre_adjunto      VARCHAR(200) NULL
);
```

**Tabla complementaria de detalle:**

```sql
CREATE TABLE Alertas.alertas_detalle (
    id_detalle          BIGINT IDENTITY(1,1) PRIMARY KEY,
    id_alerta           BIGINT NOT NULL REFERENCES Alertas.alertas(id_alerta),

    -- TRABAJADOR AFECTADO
    codigo_trabajador   VARCHAR(20) NULL,
    trabajador          VARCHAR(10) NULL,
    nombre              VARCHAR(200) NULL,
    cco                 VARCHAR(15) NULL,
    desc_cco            VARCHAR(250) NULL,

    -- DETALLE ESPECIFICO
    observacion         VARCHAR(500) NULL,
    fecha_evento        DATE NULL,
    datos_adicionales   VARCHAR(MAX) NULL     -- JSON para datos variables por tipo de alerta
);
```

**Tabla de catalogo de estados:**

```sql
CREATE TABLE Alertas.estados_alerta (
    id_estado       TINYINT PRIMARY KEY,
    descripcion     VARCHAR(50) NOT NULL
);

INSERT INTO Alertas.estados_alerta VALUES
(1, 'Creada'),
(2, 'Enviada'),
(3, 'Leida'),
(4, 'Resuelta'),
(5, 'Caducada'),
(6, 'Error al enviar');
```

**Tabla de catalogo de categorias:**

```sql
CREATE TABLE Alertas.categorias_alerta (
    id_categoria    SMALLINT IDENTITY(1,1) PRIMARY KEY,
    categoria       VARCHAR(50) NOT NULL,
    descripcion     VARCHAR(200) NULL
);

INSERT INTO Alertas.categorias_alerta (categoria, descripcion) VALUES
('Biometricos',           'Alertas relacionadas con equipos biometricos y enrolamiento DIEL'),
('Vacaciones',            'Errores e inconsistencias en solicitudes y programacion de vacaciones'),
('Marcajes',              'Marcajes faltantes, erroneos o sin asentar'),
('Horarios',              'Jornadas mal creadas, horarios faltantes, costo horario'),
('Ausencias',             'Ausencias por enfermedad, maternidad, paternidad'),
('Bajas',                 'Errores en procesos de baja y pre-baja'),
('Cambios',               'Cambios de CCO, cargo, relacion laboral, empresa'),
('Cargas Familiares',     'Cargas familiares pendientes, estado civil, impuesto renta'),
('Transferencias',        'Transferencias de personal entre CCOs'),
('Jerarquias',            'Validaciones de jefaturas, cargos, estructura organizacional'),
('Trabajadores',          'Nuevos, reingresos, expatriados, validacion de datos'),
('Cuentas Bancarias',     'Cuentas duplicadas o inconsistentes'),
('Creditos Tienda',       'Cuadre de creditos de tienda'),
('Nomina',                'Informacion de personal activo, montos P&G'),
('Aniversarios',          'Felicitaciones por aniversario laboral'),
('Acciones de Personal',  'Cambios de empresa via acciones de personal');
```

### 4.5 Estrategia de migracion sugerida

1. **Fase 1 - Crear tablas:** Crear las tablas propuestas sin modificar los SPs existentes.
2. **Fase 2 - INSERT antes del envio:** Modificar cada SP para que ANTES de llamar `sp_send_dbmail`, haga un INSERT en `Alertas.alertas` y `Alertas.alertas_detalle`.
3. **Fase 3 - Centralizar envio:** Crear un SP generico `Alertas.pa_enviar_alerta` que reciba el `id_alerta`, lea los datos de la tabla, envie el correo y actualice el estado a "Enviada".
4. **Fase 4 - Refactorizar:** Gradualmente mover la logica de envio de cada SP al SP centralizado.
5. **Fase 5 - Gestion:** Crear interfaz web/API para consultar, resolver y gestionar alertas.

### 4.6 Observaciones adicionales

- **SPs duplicados/obsoletos:** Existen pares de SPs que hacen lo mismo (pa_cambiosFechasBajas / pa_cambiosFechasBajasOLD, pa_trabajadoresHorariosCostoHorario / pa_trabajadoresHorariosCostoHorario05092022, pa_errorVacacionesGeneral / pa_errorVacacionesGeneralDennis / pa_errorVacacionesGeneralDennisRepara). Se recomienda consolidar.
- **SPs que no envian correo:** 16 SPs solo retornan datasets. Estos son consumidos por la aplicacion web o por otros SPs orquestadores. Tambien deberian generar registros en la tabla de alertas.
- **Emails hardcodeados:** 6 SPs tienen emails escritos directamente en el codigo. Se recomienda migrar a `Configuracion.parametros`.
- **Tabla `Configuracion.parametros`:** Es la pieza central de configuracion. Almacena destinatarios, asuntos y templates HTML. Cualquier solucion debe mantener compatibilidad con esta tabla.
