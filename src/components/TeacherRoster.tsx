import { useState } from "react";
import { Pencil, Plus, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PERIODS, CATEGORIES, type Teacher } from "@/lib/substitution";
import { TimetableImport } from "@/components/TimetableImport";
import { cn } from "@/lib/utils";


type Props = {
  teachers: Teacher[];
  onChange: (teachers: Teacher[]) => void;
};

export function TeacherRoster({ teachers, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Teacher | null>(null);

  const startEdit = (t: Teacher) => {
    setEditingId(t.id);
    setDraft({ ...t, busy: { ...t.busy } });
  };

  const save = () => {
    if (!draft) return;
    onChange(teachers.map((t) => (t.id === draft.id ? draft : t)));
    setEditingId(null);
    setDraft(null);
  };

  const cancel = () => {
    setEditingId(null);
    setDraft(null);
  };

  const addTeacher = () => {
    const t: Teacher = {
      id: `t${Date.now()}`,
      name: "New Teacher",
      subject: "General",
      category: "TGT",
      busy: {},
    };
    onChange([...teachers, t]);
    startEdit(t);
  };

  const remove = (id: string) => {
    onChange(teachers.filter((t) => t.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const toggleSlot = (period: number) => {
    if (!draft) return;
    setDraft({ ...draft, busy: { ...draft.busy, [period]: !draft.busy[period] } });
  };

  const slotClass = (busy: boolean, editing: boolean) =>
    cn(
      "inline-flex h-7 w-full min-w-11 items-center justify-center rounded-md border-2 text-xs font-semibold transition-colors sm:w-11",
      busy
        ? "border-primary bg-primary text-foreground"
        : "border-secondary bg-secondary text-foreground",
      editing ? "cursor-pointer hover:opacity-80" : "cursor-default",
    );

  return (
    <section className="panel overflow-hidden">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-4 sm:flex sm:flex-wrap sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2 className="text-base font-semibold">Teacher Schedule</h2>
          <p className="text-sm text-muted-foreground">
            {teachers.length} teachers · tap a period chip while editing to flip Free / Busy
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <TimetableImport teachers={teachers} onChange={onChange} />
          <Button onClick={addTeacher} size="sm" className="shrink-0">
            <Plus /> <span className="hidden sm:inline">Add teacher</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

      </header>

      {/* Mobile: stacked cards */}
      <ul className="divide-y divide-border lg:hidden">
        {teachers.map((t) => {
          const editing = editingId === t.id && draft;
          const row = editing ? draft! : t;
          return (
            <li key={t.id} className="px-4 py-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0 space-y-2">
                  {editing ? (
                    <>
                      <Input
                        value={row.name}
                        onChange={(e) => setDraft({ ...row, name: e.target.value })}
                        className="h-8"
                        placeholder="Name"
                      />
                      <Input
                        value={row.subject}
                        onChange={(e) => setDraft({ ...row, subject: e.target.value })}
                        className="h-8"
                        placeholder="Subject"
                      />
                      <div className="flex gap-1.5">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setDraft({ ...row, category: cat })}
                            className={cn(
                              "flex-1 rounded px-2 py-1.5 text-xs font-semibold transition-colors",
                              row.category === cat
                                ? "bg-primary text-primary-foreground"
                                : "border border-border bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="truncate font-medium">{row.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm text-muted-foreground">{row.subject}</p>
                        <span className="shrink-0 rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary">
                          {row.category}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  {editing ? (
                    <>
                      <Button size="icon" variant="ghost" onClick={save} aria-label="Save">
                        <Check />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={cancel} aria-label="Cancel">
                        <X />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(t)}
                        aria-label={`Edit ${t.name}`}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(t.id)}
                        aria-label={`Remove ${t.name}`}
                      >
                        <Trash2 className="text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
                {PERIODS.map((p) => (
                  <div key={p} className="text-center">
                    <p className="mb-1 text-[10px] uppercase tracking-wide text-primary">
                      P{p}
                    </p>
                    <button
                      type="button"
                      disabled={!editing}
                      onClick={() => toggleSlot(p)}
                      className={slotClass(!!row.busy[p], !!editing)}
                    >
                      {row.busy[p] ? "Busy" : "Free"}
                    </button>
                  </div>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: table */}
      <div className="hidden max-h-[calc(100vh-13rem)] overflow-auto lg:block">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="bg-muted/95 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="sticky top-0 z-10 bg-muted/95 px-5 py-3 font-medium">Teacher</th>
              <th className="sticky top-0 z-10 bg-muted/95 px-3 py-3 font-medium">Subject</th>
              {PERIODS.map((p) => (
                <th key={p} className="sticky top-0 z-10 bg-muted/95 px-2 py-3 text-center font-medium text-primary">
                  P{p}
                </th>
              ))}
              <th className="sticky top-0 z-10 bg-muted/95 px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => {
              const editing = editingId === t.id && draft;
              const row = editing ? draft! : t;
              return (
                <tr key={t.id} className="border-t border-border align-middle odd:bg-background even:bg-muted/30">
                  <td className="px-5 py-3.5">
                    {editing ? (
                      <Input
                        value={row.name}
                        onChange={(e) => setDraft({ ...row, name: e.target.value })}
                        className="h-8 w-40"
                      />
                    ) : (
                      <span className="font-medium">{row.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-3.5">
                    {editing ? (
                      <div className="flex flex-col gap-2">
                        <Input
                          value={row.subject}
                          onChange={(e) => setDraft({ ...row, subject: e.target.value })}
                          className="h-8 w-36"
                          placeholder="Subject"
                        />
                        <div className="flex gap-1">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setDraft({ ...row, category: cat })}
                              className={cn(
                                "flex-1 rounded px-1.5 py-1 text-xs font-semibold transition-colors",
                                row.category === cat
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border bg-muted text-muted-foreground hover:bg-muted/80"
                              )}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{row.subject}</span>
                        <span className="shrink-0 rounded-full bg-secondary/15 px-2 py-0.5 text-xs font-semibold text-secondary">
                          {row.category}
                        </span>
                      </div>
                    )}
                  </td>
                  {PERIODS.map((p) => (
                    <td key={p} className="px-2 py-3.5 text-center">
                      <button
                        type="button"
                        disabled={!editing}
                        onClick={() => toggleSlot(p)}
                        className={slotClass(!!row.busy[p], !!editing)}
                      >
                        {row.busy[p] ? "Busy" : "Free"}
                      </button>
                    </td>
                  ))}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1">
                      {editing ? (
                        <>
                          <Button size="icon" variant="ghost" onClick={save} aria-label="Save">
                            <Check />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={cancel} aria-label="Cancel">
                            <X />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => startEdit(t)}
                            aria-label={`Edit ${t.name}`}
                          >
                            <Pencil />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => remove(t.id)}
                            aria-label={`Remove ${t.name}`}
                          >
                            <Trash2 className="text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
