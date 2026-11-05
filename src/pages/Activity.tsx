import { useMemo, useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../lib/workspace';
import { dateLabel } from '../lib/domain';
import { statuses, priorities } from '../lib/types';
import type { History, Task, WorkspaceData, Status, Priority } from '../lib/types';
import { Avatar, Button, Empty } from '../components/ui';

type Row = Record<string, unknown> | null;
const PAGE = 30;

const nameOf = (data: WorkspaceData, id: unknown) => (typeof id === 'string' && data.profiles.find(p => p.id === id)?.name) || (id ? 'Anggota' : 'Belum ditetapkan');

/** Human-readable list of what changed between two task snapshots. */
export function describeChanges(h: History, data: WorkspaceData): { title: string; changes: string[]; kind: string } {
  const before = h.before_data as Row, after = h.after_data as Row;
  switch (h.action) {
    case 'created': return { title: 'Mencatat tugas', changes: [], kind: 'created' };
    case 'legacy_import': return { title: 'Mengimpor riwayat lama', changes: [], kind: 'other' };
    case 'recurrence': return { title: 'Membuat tugas dari jadwal rutin', changes: [], kind: 'created' };
    case 'checklist': return { title: 'Memperbarui checklist', changes: [], kind: 'other' };
    case 'supporters': {
      const a = (after?.supporters as string[] | undefined) ?? [], b = (before?.supporters as string[] | undefined) ?? [];
      const added = a.filter(x => !b.includes(x)).map(x => nameOf(data, x)), removed = b.filter(x => !a.includes(x)).map(x => nameOf(data, x));
      return { title: 'Mengubah pendukung', changes: [...added.map(n => `+ ${n}`), ...removed.map(n => `− ${n}`)], kind: 'other' };
    }
  }
  if (!before || !after) return { title: 'Memperbarui pekerjaan', changes: [], kind: 'updated' };
  const changes: string[] = []; let kind = 'updated';
  if (before.status !== after.status) { changes.push(`Status: ${statuses[before.status as Status] ?? before.status} → ${statuses[after.status as Status] ?? after.status}`); kind = 'status'; }
  if (before.progress !== after.progress && after.status !== 'done') changes.push(`Progres: ${before.progress}% → ${after.progress}%`);
  if (before.pic_id !== after.pic_id) changes.push(`PIC: ${nameOf(data, before.pic_id)} → ${nameOf(data, after.pic_id)}`);
  if (before.due_at !== after.due_at) changes.push(`Tenggat: ${dateLabel(before.due_at as string | null)} → ${dateLabel(after.due_at as string | null)}`);
  if (before.priority !== after.priority) changes.push(`Prioritas: ${priorities[before.priority as Priority]} → ${priorities[after.priority as Priority]}`);
  if (before.title !== after.title) changes.push('Judul diperbarui');
  if (before.archived_at !== after.archived_at) { changes.push(after.archived_at ? 'Diarsipkan' : 'Dipulihkan dari arsip'); kind = 'archive'; }
  if (!changes.length) changes.push('Detail pekerjaan diperbarui');
  return { title: kind === 'status' ? 'Mengubah status' : 'Memperbarui pekerjaan', changes, kind };
}

export function Activity({ onOpen }: { onOpen: (t: Task) => void }) {
  const { data } = useWorkspace();
  const [query, setQuery] = useState(''), [actor, setActor] = useState(''), [kind, setKind] = useState(''), [limit, setLimit] = useState(PAGE);
  const rows = useMemo(() => [...data.history].sort((a, b) => b.created_at.localeCompare(a.created_at)).map(h => ({ h, task: data.tasks.find(t => t.id === h.task_id), d: describeChanges(h, data) })), [data]);
  const q = query.trim().toLowerCase();
  const filtered = rows.filter(r => (!actor || (actor === 'system' ? !r.h.actor_id : r.h.actor_id === actor)) && (!kind || r.d.kind === kind) && (!q || (r.task?.title || '').toLowerCase().includes(q) || r.d.changes.join(' ').toLowerCase().includes(q)));
  const actors = [...new Set(data.history.map(h => h.actor_id).filter(Boolean))];
  return <>
    <div className="page-intro"><div><span className="eyebrow">JEJAK KOLABORASI</span><h1>Aktivitas tim</h1><p>Riwayat tercatat oleh server dan tidak dapat diubah anggota biasa.</p></div></div>
    <div className="activity-filters">
      <label className="activity-search"><Search size={16} /><input aria-label="Cari aktivitas" placeholder="Cari judul tugas atau perubahan…" value={query} onChange={e => { setQuery(e.target.value); setLimit(PAGE); }} /></label>
      <select aria-label="Filter orang" value={actor} onChange={e => { setActor(e.target.value); setLimit(PAGE); }}><option value="">Semua orang</option>{actors.map(id => <option key={id} value={id}>{nameOf(data, id)}</option>)}<option value="system">Sistem otomatis</option></select>
      <select aria-label="Filter jenis aktivitas" value={kind} onChange={e => { setKind(e.target.value); setLimit(PAGE); }}><option value="">Semua jenis</option><option value="created">Tugas baru</option><option value="status">Perubahan status</option><option value="updated">Pembaruan lain</option><option value="archive">Arsip</option><option value="other">Checklist, pendukung, impor</option></select>
    </div>
    <section className="panel">{filtered.length ? <div className="timeline activity-timeline">{filtered.slice(0, limit).map(({ h, task, d }) => {
      const who = h.actor_id ? nameOf(data, h.actor_id) : 'Sistem';
      return <button key={h.id} className="timeline-item" disabled={!task} onClick={() => task && onOpen(task)}>
        <Avatar name={who} />
        <div><p><strong>{who}</strong> · {d.title}</p><span>{task?.title || 'Tugas tidak tersedia'}</span>
          {d.changes.length > 0 && <span className="change-list">{d.changes.map(c => <span key={c}>{c}</span>)}</span>}
          {h.reason && !['Pembaruan contoh'].includes(h.reason) && <small>{h.reason}</small>}
        </div><time>{dateLabel(h.created_at, true)}</time></button>;
    })}</div> : <Empty title={rows.length ? 'Tidak ada aktivitas yang cocok' : 'Belum ada aktivitas'} description={rows.length ? 'Ubah pencarian atau filter untuk melihat aktivitas lain.' : 'Pencatatan dan perubahan tugas akan muncul otomatis.'} />}</section>
    {filtered.length > limit && <div className="load-more"><Button onClick={() => setLimit(l => l + PAGE)}>Muat {Math.min(PAGE, filtered.length - limit)} aktivitas lagi<ArrowRight size={16} /></Button></div>}
    <p className="form-help">Menampilkan {Math.min(limit, filtered.length)} dari {filtered.length} aktivitas. Riwayat lengkap juga tersedia pada masing-masing tugas dan ekspor admin.</p>
  </>;
}
