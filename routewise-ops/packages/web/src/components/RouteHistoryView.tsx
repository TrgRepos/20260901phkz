import { useRouteHistory } from "../hooks/useRouteHistory";

interface RouteHistoryViewProps {
  routeId: string;
}

const STATUS_LABEL: Record<string, string> = {
  planned: "Planned",
  in_progress: "In Progress",
  completed: "Completed",
  delayed: "Delayed",
};

export function RouteHistoryView({ routeId }: RouteHistoryViewProps) {
  const { data, isPending, isError, error } = useRouteHistory(routeId);

  if (isPending) {
    return <p role="status">Loading history…</p>;
  }

  if (isError) {
    return (
      <p role="alert">
        Could not load history: {error instanceof Error ? error.message : "Unknown error"}
      </p>
    );
  }

  if (data.length === 0) {
    return <p>No status changes recorded for this route yet.</p>;
  }

  return (
    <section aria-label="Route history" className="route-history">
      <h3>History</h3>
      <ul className="history-list">
        {data.map((entry) => (
          <li key={entry.id}>
            <span className="history-date">{new Date(entry.changedAt).toLocaleString()}</span>
            <span className="history-change">
              {STATUS_LABEL[entry.previousStatus]} → {STATUS_LABEL[entry.newStatus]}
            </span>
            <p className="history-note">{entry.note}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
