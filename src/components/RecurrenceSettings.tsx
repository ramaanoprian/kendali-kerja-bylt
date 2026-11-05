import { useState } from 'react';
import { Plus, Repeat, Pencil, Trash2, Save } from 'lucide-react';
import { useWorkspace } from '../lib/workspace';
import { rpc } from '../lib/supabase';
import { errorMessage, dateLabel } from '../lib/domain';
import { kinds, priorities, weekdays } from '../lib/types';
import type { Recurrence, Kind, Priority, Frequency } from '../lib/types';
import { Button, Field, Modal, Empty } from './ui';

type Draft = Pick<Recurrence, 'title' | 'description' | 'kind' | 'priority' | 'expected_result' | 'team_id' | 'department_id' | 'pic_id' | 'freq' | 'weekday' | 'month_day' | 'due_days' | 'due_time' | 'active'>;
const blank: Draft = { title: '', description: '', kind: 'routine', priority: 'normal', expected_result: '', team_id: null, department_id: null, pic_id: null, freq: 'weekly', weekday: 1, month_day: 1, due_days: 0, due_time: '16:00', active: true };

const isoDate = (d: Date) => d.toISOString().slice(0, 10);
/** Mirrors bylt_private.next_occurrence: first occurrence on or after `from` (YYYY-MM-DD). */
export function nextOccurrence(freq: Frequency, weekday: number | null, monthDay: number | null, from: string): string {
  const base = new Date(from + 'T00:00:00Z');
  if (freq === 'weekly') { const iso = (base.getUTCDay() + 6) % 7 + 1; base.setUTCDate(base.getUTCDate() + ((Number(weekday) - iso + 7) % 7)); return isoDate(base); }
  for (let i = 0; i < 2; i++) {
    const y = base.getUTCFullYear(), m = base.getUTCMonth() + i, last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    const candidate = new Date(Date.UTC(y, m, Math.min(Number(monthDay), last)));
    if (isoDate(candidate) >= from) return isoDate(candidate);
  }
  return from;
}
export const scheduleLabel = (r: Pick<Recurrence, 'freq' | 'weekday' | 'month_day' | 'due_days' | 'due_time'>) => {
  const when = r.freq === 'weekly' ? `Setiap ${weekdays[(r.weekday || 1) - 1]}` : `Setiap tanggal ${r.month_day}`;
  const due = r.due_days ? `tenggat ${r.due_days} hari kemudian` : 'tenggat hari yang sama';
  return `${when} · ${due}, ${r.due_time.slice(0, 5)} WIB`;
};

export function RecurrenceSettings() {
  const w = useWorkspace(), { data, orgId, demo, userId } = w;
  const [editing, setEditing] = useState<Recurrence | null | undefined>(undefined), [draft, setDraft] = useState<Draft>(blank);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const members = data.memberships.filter(m => m.active && m.role !== 'viewer');
  const open = (r: Recurrence | null) => { setError(''); setEditing(r); setDraft(r ? { ...r, due_time: r.due_time.slice(0, 5) } : blank); };
  const persist = async (r: Recurrence | null, next: Draft) => {
    setBusy(true); setError('');
    try {
      await w.run(async () => {
        if (!demo) { await rpc('save_recurrence', { p_org: orgId, p_id: r?.id || null, p_data: next, p_supporters: r?.supporters || [] }); return; }
        const today = new Date().toISOString().slice(0, 10), now = new Date().toISOString();
        const row: Recurrence = { ...(r || { id: crypto.randomUUID(), organization_id: orgId, supporters: [], assigned_by: '', last_run: null, created_by: userId, created_at: now }), ...next, weekday: next.freq === 'weekly' ? next.weekday : null, month_day: next.freq === 'monthly' ? next.month_day : null, next_run: nextOccurrence(next.freq, next.weekday, next.month_day, today), updated_at: now } as Recurrence;
        w.setData(d => ({ ...d, recurrences: r ? d.recurrences.map(x => x.id === r.id ? row : x) : [...d.recurrences, row] }));
      });
      w.notify({ text: demo ? 'Jadwal pratinjau disimpan.' : 'Jadwal pekerjaan berulang tersimpan.' });
      return true;
    } catch (e) { setError(errorMessage(e)); return false; } finally { setBusy(false); }
  };
  const remove = async (r: Recurrence) => {
    if (!confirm(`Hapus jadwal "${r.title}"? Tugas yang sudah dibuat tidak ikut terhapus.`)) return;
    setBusy(true); setError('');
    try { await w.run(async () => { if (demo) w.setData(d => ({ ...d, recurrences: d.recurrences.filter(x => x.id !== r.id) })); else await rpc('delete_recurrence', { p_org: orgId, p_id: r.id }); }); w.notify({ text: 'Jadwal dihapus.' }); }
    catch (e) { setError(errorMessage(e)); } finally { setBusy(false); }
  };
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(d => ({ ...d, [key]: value }));
  const valid = draft.title.trim().length > 0 && (draft.freq === 'weekly' ? !!draft.weekday : !!draft.month_day);
  return <>
    <div className="section-heading"><div><h2>Pekerjaan berulang</h2><p>Tugas rutin dibuat otomatis setiap pukul 00.05 WIB sesuai jadwal.</p></div><Button variant="primary" onClick={() => open(null)}><Plus size={17} />Tambah jadwal</Button></div>
    {error && editing === undefined && <div className="inline-alert danger" role="alert">{error}</div>}
    {data.recurrences.length ? <div className="recurrence-list">{[...data.recurrences].sort((a, b) => a.title.localeCompare(b.title)).map(r => <div className={`recurrence-row ${r.active ? '' : 'inactive'}`} key={r.id}>
      <span className="recurrence-icon"><Repeat size={18} /></span>
      <div><strong>{r.title}</strong><small>{scheduleLabel(r)}</small><small>{r.active ? `Berikutnya: ${dateLabel(r.next_run + 'T00:00:00+07:00')}` : 'Dijeda'} · PIC: {data.profiles.find(p => p.id === r.pic_id)?.name || 'belum ditetapkan'}</small></div>
      <span className="recurrence-actions"><label className="recurrence-toggle"><input type="checkbox" role="switch" aria-label={`Aktifkan jadwal ${r.title}`} checked={r.active} disabled={busy} onChange={e => void persist(r, { ...r, due_time: r.due_time.slice(0, 5), active: e.target.checked })} /></label>
      <Button variant="ghost" aria-label={`Ubah jadwal ${r.title}`} onClick={() => open(r)}><Pencil size={16} /></Button>
      <Button variant="ghost" aria-label={`Hapus jadwal ${r.title}`} disabled={busy} onClick={() => void remove(r)}><Trash2 size={16} /></Button></span>
    </div>)}</div> : <Empty icon={<Repeat size={28} />} title="Belum ada pekerjaan berulang" description="Buat jadwal untuk pekerjaan rutin mingguan atau bulanan agar tidak perlu dicatat ulang." action={<Button onClick={() => open(null)}><Plus size={16} />Tambah jadwal pertama</Button>} />}
    <div className="inline-alert info">Setiap kemunculan hanya dibuat sekali. Bila sistem sempat tertunda, hanya jadwal terbaru yang dibuat agar daftar tidak menumpuk. Pengingat tenggat berjalan seperti tugas biasa.</div>
    {editing !== undefined && <Modal title={editing ? 'Ubah jadwal' : 'Jadwal pekerjaan berulang'} onClose={() => setEditing(undefined)}>
      <form onSubmit={async e => { e.preventDefault(); if (await persist(editing, draft)) setEditing(undefined); }}>
        <div className="dialog-body form-stack">
          <Field label="Judul pekerjaan *"><input required maxLength={240} value={draft.title} onChange={e => set('title', e.target.value)} /></Field>
          <div className="form-grid">
            <Field label="Frekuensi"><select value={draft.freq} onChange={e => set('freq', e.target.value as Frequency)}><option value="weekly">Mingguan</option><option value="monthly">Bulanan</option></select></Field>
            {draft.freq === 'weekly'
              ? <Field label="Hari"><select value={draft.weekday || 1} onChange={e => set('weekday', Number(e.target.value))}>{weekdays.map((d, i) => <option key={d} value={i + 1}>{d}</option>)}</select></Field>
              : <Field label="Tanggal" hint="29–31 otomatis menjadi akhir bulan bila bulan lebih pendek."><input type="number" min={1} max={31} value={draft.month_day || 1} onChange={e => set('month_day', Math.max(1, Math.min(31, Number(e.target.value) || 1)))} /></Field>}
            <Field label="Tenggat (hari setelah dibuat)"><input type="number" min={0} max={60} value={draft.due_days} onChange={e => set('due_days', Math.max(0, Math.min(60, Number(e.target.value) || 0)))} /></Field>
            <Field label="Jam tenggat (WIB)"><input type="time" value={draft.due_time} onChange={e => set('due_time', e.target.value || '16:00')} /></Field>
            <Field label="Jenis"><select value={draft.kind} onChange={e => set('kind', e.target.value as Kind)}>{Object.entries(kinds).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label="Prioritas"><select value={draft.priority} onChange={e => set('priority', e.target.value as Priority)}>{Object.entries(priorities).map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label="PIC"><select value={draft.pic_id || ''} onChange={e => set('pic_id', e.target.value || null)}><option value="">Belum ditetapkan</option>{members.map(m => <option key={m.user_id} value={m.user_id}>{data.profiles.find(p => p.id === m.user_id)?.name}</option>)}</select></Field>
            <Field label="Tim"><select value={draft.team_id || ''} onChange={e => set('team_id', e.target.value || null)}><option value="">Belum ditetapkan</option>{data.teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
            <Field label="Bagian"><select value={draft.department_id || ''} onChange={e => set('department_id', e.target.value || null)}><option value="">Belum ditetapkan</option>{data.departments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></Field>
          </div>
          <Field label="Hasil yang diharapkan"><textarea rows={2} value={draft.expected_result} onChange={e => set('expected_result', e.target.value)} /></Field>
          <Field label="Deskripsi"><textarea rows={2} value={draft.description} onChange={e => set('description', e.target.value)} /></Field>
          <label className="switch-row"><div><strong>Jadwal aktif</strong><p>Jadwal yang dijeda tidak membuat tugas baru.</p></div><input type="checkbox" role="switch" checked={draft.active} onChange={e => set('active', e.target.checked)} /></label>
          <p className="form-help">{scheduleLabel({ ...draft, due_time: draft.due_time })}</p>
          {error && <div className="inline-alert danger" role="alert">{error}</div>}
        </div>
        <footer className="dialog-footer"><Button type="button" onClick={() => setEditing(undefined)}>Batal</Button><Button type="submit" variant="primary" busy={busy} disabled={!valid}><Save size={16} />Simpan jadwal</Button></footer>
      </form>
    </Modal>}
  </>;
}
