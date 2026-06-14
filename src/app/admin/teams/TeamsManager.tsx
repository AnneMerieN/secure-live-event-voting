"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Team } from "@/lib/types";

export function TeamsManager({ initialTeams }: { initialTeams: Team[] }) {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>(initialTeams);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      setError("Couldn't add team.");
      return;
    }
    const created: Team = await res.json();
    setTeams((t) => [...t, created].sort((a, b) => a.name.localeCompare(b.name)));
    setName("");
    setDescription("");
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this team? Any votes for it will also be removed.")) return;
    const res = await fetch(`/api/admin/teams/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Couldn't delete team.");
      return;
    }
    setTeams((t) => t.filter((row) => row.id !== id));
    router.refresh();
  }

  function startEdit(team: Team) {
    setEditingId(team.id);
    setEditName(team.name);
    setEditDescription(team.description);
  }

  async function handleSaveEdit() {
    if (!editingId || !editName.trim()) return;
    const id = editingId;
    const res = await fetch(`/api/admin/teams/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: editName.trim(), description: editDescription.trim() }),
    });
    if (!res.ok) {
      setError("Couldn't update team.");
      return;
    }
    const updated: Team = await res.json();
    setTeams((t) =>
      t
        .map((row) => (row.id === id ? updated : row))
        .sort((a, b) => a.name.localeCompare(b.name))
    );
    setEditingId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form className="card space-y-4" onSubmit={handleCreate}>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Add a team
        </h3>
        <div>
          <label htmlFor="name" className="label">
            Name
          </label>
          <input
            id="name"
            className="input"
            placeholder="Team Aurora"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="label">
            Description (optional)
          </label>
          <input
            id="description"
            className="input"
            placeholder="What this team is presenting"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Adding…" : "Add team"}
        </button>
      </form>

      <div className="space-y-3">
        {teams.length === 0 && (
          <div className="card text-sm text-slate-400">No teams yet — add one above.</div>
        )}
        {teams.map((team) => (
          <div key={team.id} className="card">
            {editingId === team.id ? (
              <div className="space-y-3">
                <input
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <input
                  className="input"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
                <div className="flex gap-2">
                  <button type="button" className="btn-primary" onClick={handleSaveEdit}>
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-100">{team.name}</h4>
                  {team.description && (
                    <p className="mt-1 text-sm text-slate-400">{team.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => startEdit(team)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDelete(team.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
