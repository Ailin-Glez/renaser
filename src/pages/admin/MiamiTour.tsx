import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { formatDateLong } from "../../lib/dates";
import styles from "./MiamiTour.module.css";

interface ExceptionRow {
  id: string;
  date: string;
  allDay: boolean;
  startTime: string;
  endTime: string;
}

function newException(): ExceptionRow {
  return { id: crypto.randomUUID(), date: "", allDay: true, startTime: "09:00", endTime: "12:00" };
}

// El día siguiente a `date` (YYYY-MM-DD), para usar como mínimo del último
// día — así el "último día" no puede ser igual ni anterior al primero.
function dayAfter(date: string): string | undefined {
  if (!date) return undefined;
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

interface EventResult {
  slug: string;
  ok: boolean;
  error?: string;
}

interface ScheduleResult {
  scheduleName: string;
  changedDays: number;
  totalOverrides: number;
  dryRun?: boolean;
}

interface ApiResponse {
  ok?: boolean;
  dryRun?: boolean;
  events?: EventResult[];
  lasVegas?: ScheduleResult;
  miami?: ScheduleResult | null;
  error?: string;
}

export default function MiamiTour() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([]);
  const [dryRun, setDryRun] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  const [currentTour, setCurrentTour] = useState<{ startDate: string; endDate: string } | null>(null);
  const [loadingCurrentTour, setLoadingCurrentTour] = useState(true);
  const [currentTourError, setCurrentTourError] = useState("");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const res = await fetch("/.netlify/functions/miami-tour-status", {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setCurrentTourError(data.error ?? `No se pudo consultar la gira actual (HTTP ${res.status}).`);
        } else if (data.startDate && data.endDate) {
          setCurrentTour({ startDate: data.startDate, endDate: data.endDate });
        }
      } catch {
        if (!cancelled) setCurrentTourError("No se pudo conectar con la función para consultar la gira actual.");
      } finally {
        if (!cancelled) setLoadingCurrentTour(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const willOverwriteCurrentTour =
    currentTour !== null &&
    startDate !== "" &&
    endDate !== "" &&
    (startDate !== currentTour.startDate || endDate !== currentTour.endDate);

  const addException = () => setExceptions((prev) => [...prev, newException()]);
  const removeException = (id: string) => setExceptions((prev) => prev.filter((e) => e.id !== id));
  const updateException = (id: string, patch: Partial<ExceptionRow>) =>
    setExceptions((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!startDate || !endDate || startDate >= endDate) {
      setError("Revisa las fechas: el último día debe ser posterior al primero.");
      return;
    }
    for (const exc of exceptions) {
      if (!exc.date) {
        setError("Falta la fecha de alguna excepción.");
        return;
      }
      if (exc.date < startDate || exc.date > endDate) {
        setError(`La excepción del ${exc.date} está fuera del rango de la gira.`);
        return;
      }
      if (!exc.allDay && exc.startTime >= exc.endTime) {
        setError(`En la excepción del ${exc.date}, la hora de inicio debe ser antes que la de fin.`);
        return;
      }
    }
    if (!user) return;

    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/.netlify/functions/update-miami-tour", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({
          startDate,
          endDate,
          dryRun,
          exceptions: exceptions.map((e) => ({
            date: e.date,
            startTime: e.allDay ? "00:00" : e.startTime,
            endTime: e.allDay ? "00:00" : e.endTime,
          })),
        }),
      });
      const data: ApiResponse = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Error inesperado (HTTP ${res.status}).`);
      } else {
        setResult(data);
      }
    } catch {
      setError("No se pudo conectar con la función. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h1>Fechas de la gira Miami</h1>
      <p className={styles.hint}>
        Abre esas fechas para reservar en Miami, y bloquea automáticamente esos
        mismos días en el calendario de Las Vegas.
      </p>

      {!loadingCurrentTour && currentTourError && (
        <p className={styles.currentTourError}>No se pudo consultar la gira actual: {currentTourError}</p>
      )}

      {!loadingCurrentTour && !currentTourError && (
        <p className={styles.currentTour}>
          {currentTour ? (
            <>
              Gira actual: <strong>{formatDateLong(currentTour.startDate)}</strong> al{" "}
              <strong>{formatDateLong(currentTour.endDate)}</strong>
            </>
          ) : (
            "No hay ninguna gira con fechas configuradas todavía."
          )}
        </p>
      )}

      {willOverwriteCurrentTour && currentTour && (
        <p className={styles.overwriteWarning}>
          ⚠ Al continuar, se reemplazará la gira actual ({formatDateLong(currentTour.startDate)} al{" "}
          {formatDateLong(currentTour.endDate)}) por estas fechas nuevas.
        </p>
      )}

      <form className={styles.card} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <label className={styles.field}>
            <span>Primer día en Miami</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </label>
          <label className={styles.field}>
            <span>Último día en Miami</span>
            <input
              type="date"
              value={endDate}
              min={dayAfter(startDate)}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>
        </div>

        <div className={styles.exceptions}>
          <div className={styles.exceptionsHead}>
            <div>
              <span className={styles.exceptionsTitle}>Días libres u horario reducido en Miami</span>
              <p className={styles.exceptionsHint}>
                Opcional — para los días que no trabajan, o que solo tienen disponible una parte del día.
              </p>
            </div>
            <button type="button" className={styles.addButton} onClick={addException}>
              + Agregar
            </button>
          </div>

          {exceptions.map((exc) => (
            <div key={exc.id} className={styles.exceptionRow}>
              <input
                type="date"
                value={exc.date}
                min={startDate || undefined}
                max={endDate || undefined}
                onChange={(e) => updateException(exc.id, { date: e.target.value })}
                required
              />

              <div className={styles.exceptionTabs}>
                <button
                  type="button"
                  className={`${styles.exceptionTab} ${exc.allDay ? styles.exceptionTabActive : ""}`}
                  onClick={() => updateException(exc.id, { allDay: true })}
                >
                  Día libre
                </button>
                <button
                  type="button"
                  className={`${styles.exceptionTab} ${!exc.allDay ? styles.exceptionTabActive : ""}`}
                  onClick={() => updateException(exc.id, { allDay: false })}
                >
                  Horario reducido
                </button>
              </div>

              {!exc.allDay && (
                <div className={styles.exceptionTimesWrap}>
                  <div className={styles.exceptionTimes}>
                    <span>Disponible de</span>
                    <input
                      type="time"
                      value={exc.startTime}
                      onChange={(e) => updateException(exc.id, { startTime: e.target.value })}
                    />
                    <span>a</span>
                    <input
                      type="time"
                      value={exc.endTime}
                      onChange={(e) => updateException(exc.id, { endTime: e.target.value })}
                    />
                  </div>
                  <p className={styles.exceptionTimesHint}>
                    Fuera de ese horario no se podrá reservar ese día.
                  </p>
                </div>
              )}

              <button
                type="button"
                className={styles.removeButton}
                onClick={() => removeException(exc.id)}
                aria-label="Quitar excepción"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <label className={styles.dryRunField}>
          <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
          <span>
            Modo de prueba — revisa todo pero <strong>no cambia nada</strong> en Cal.com todavía.
          </span>
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <button type="submit" className={styles.submitButton} disabled={saving}>
            {saving ? "Procesando…" : dryRun ? "Ver vista previa" : "Actualizar fechas de la gira"}
          </button>
        </div>
      </form>

      {result && (
        <div className={styles.results}>
          <h2>{result.dryRun ? "Vista previa (nada se cambió todavía)" : "Resultado"}</h2>
          <ul className={styles.eventList}>
            {result.events?.map((e) => (
              <li key={e.slug} className={e.ok ? styles.eventOk : styles.eventFail}>
                {e.ok ? "✓" : "✕"} {e.slug}
                {!e.ok && e.error && <span className={styles.eventError}> — {e.error}</span>}
              </li>
            ))}
          </ul>
          {result.lasVegas && (
            <p className={styles.summary}>
              {result.lasVegas.scheduleName}: {result.lasVegas.changedDays} días{" "}
              {result.dryRun ? "se bloquearían" : "bloqueados"} ({result.lasVegas.totalOverrides} excepciones en
              total en ese horario).
            </p>
          )}
          {result.miami && (
            <p className={styles.summary}>
              {result.miami.scheduleName}: {result.miami.changedDays} días con excepción{" "}
              {result.dryRun ? "se aplicarían" : "aplicada"} ({result.miami.totalOverrides} en total en ese horario).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
