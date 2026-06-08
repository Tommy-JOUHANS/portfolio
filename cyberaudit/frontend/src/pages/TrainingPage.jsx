import { useState, useEffect } from "react";
import { getTrainingModules, updateModuleStatus } from "../services/dataService.js";

const STATUS_LABELS = {
  completed:   { label: "Completed",   classes: "text-green-600" },
  in_progress: { label: "In progress", classes: "text-amber-500" },
  to_start:    { label: "To start",    classes: "text-gray-500"  },
};

export default function TrainingPage() {
  const [modules, setModules]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getTrainingModules();
      setModules(Array.isArray(data) ? data : []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleAdvance(module) {
    if (module.status === "completed") return;
    const next = module.status === "to_start" ? "in_progress" : "completed";
    const updated = await updateModuleStatus(module.id, next);
    setModules(Array.isArray(updated) ? updated : []);
  }

  function buttonLabel(status) {
    if (status === "completed")   return "Review";
    if (status === "in_progress") return "Continue";
    return "Start";
  }

  const completedCount = modules.filter((m) => m.status === "completed").length;
  const total          = modules.length;
  const percent        = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-brand" />
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-brand">Awareness {"&"} Training</h1>
        <p className="text-sm italic text-gray-500">
          Build your team's cybersecurity reflexes - simple, useful, no jargon.
        </p>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-bold text-brand">My progress</span>
          <span className="text-sm text-gray-500">{completedCount} / {total} modules completed</span>
        </div>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => {
          const statusInfo = STATUS_LABELS[module.status] || STATUS_LABELS.to_start;
          return (
            <div key={module.id} className="flex flex-col rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-brand">{module.title}</h2>
              <p className="mt-1 flex-1 text-sm text-gray-600">{module.description}</p>
              <p className="mt-3 text-sm">
                <span className="text-gray-500">Status: </span>
                <span className={`font-semibold ${statusInfo.classes}`}>{statusInfo.label}</span>
              </p>
              <button type="button" onClick={() => handleAdvance(module)}
                className={`mt-3 rounded-md py-2 text-sm font-semibold transition ${
                  module.status === "completed"
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-brand text-white hover:bg-brand-dark"
                }`}>
                {buttonLabel(module.status)}
              </button>
            </div>
          );
        })}
      </div>

      <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        The detailed content of the modules (videos, documentation) will be added later.
      </p>
    </div>
  );
}
