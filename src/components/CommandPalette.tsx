import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import { Search, CornerDownLeft, Plus, SunMoon, HelpCircle, ClipboardList, LayoutDashboard, CalendarDays, FileText, UsersRound, History, Archive, Settings } from 'lucide-react';
import { useWorkspace } from '../lib/workspace';
import { taskNumber } from '../lib/domain';
import { statuses } from '../lib/types';
import type { Page, Task } from '../lib/types';

type Item = { id: string; group: 'Pekerjaan' | 'Halaman' | 'Tindakan'; label: string; hint?: string; icon: ComponentType<{ size?: number }>; run: () => void };
const pages: [Page, string, ComponentType<{ size?: number }>][] = [
  ['dashboard', 'Ringkasan', LayoutDashboard], ['tasks', 'Pekerjaan', ClipboardList], ['agenda', 'Agenda', CalendarDays], ['reports', 'Laporan EVP', FileText],
  ['contacts', 'Kontak bagian', UsersRound], ['activity', 'Aktivitas', History], ['archive', 'Arsip pekerjaan', Archive], ['settings', 'Pengaturan', Settings],
];
const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Spotlight-style palette: jump to a task, a page, or run an action from the keyboard. */
export function CommandPalette({ onClose, onPage, onOpenTask, onNew, onToggleTheme, onHelp }: { onClose: () => void; onPage: (p: Page) => void; onOpenTask: (t: Task) => void; onNew: () => void; onToggleTheme: () => void; onHelp: () => void }) {
  const { data, role } = useWorkspace();
  const ref = useRef<HTMLDialogElement>(null), input = useRef<HTMLInputElement>(null), listId = useId();
  const [query, setQuery] = useState(''), [index, setIndex] = useState(0);
  useEffect(() => { const d = ref.current; d?.showModal(); input.current?.focus(); return () => d?.close(); }, []);
  const items = useMemo<Item[]>(() => {
    const q = normalize(query.trim());
    const match = (text: string) => !q || normalize(text).includes(q);
    const tasks = data.tasks.filter(t => !t.archived_at && (match(t.title) || match(taskNumber(t.number))))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, q ? 8 : 5)
      .map<Item>(t => ({ id: 'task-' + t.id, group: 'Pekerjaan', label: t.title, hint: `${taskNumber(t.number)} · ${statuses[t.status]}`, icon: ClipboardList, run: () => onOpenTask(t) }));
    const nav = pages.filter(([, label]) => match(label)).map<Item>(([id, label, icon]) => ({ id: 'page-' + id, group: 'Halaman', label, icon, run: () => onPage(id) }));
    const actions: Item[] = [
      ...(role !== 'viewer' ? [{ id: 'new', group: 'Tindakan' as const, label: 'Catat tugas baru', icon: Plus, run: onNew }] : []),
      { id: 'theme', group: 'Tindakan' as const, label: 'Ganti tampilan terang/gelap', icon: SunMoon, run: onToggleTheme },
      { id: 'help', group: 'Tindakan' as const, label: 'Buka panduan singkat', icon: HelpCircle, run: onHelp },
    ].filter(a => match(a.label));
    return [...tasks, ...actions, ...nav];
  }, [data.tasks, query, role, onOpenTask, onPage, onNew, onToggleTheme, onHelp]);
  useEffect(() => setIndex(0), [query]);
  useEffect(() => { document.getElementById(`${listId}-${index}`)?.scrollIntoView({ block: 'nearest' }); }, [index, listId]);
  const choose = (item?: Item) => { if (!item) return; onClose(); item.run(); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(items.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex(i => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(items[index]); }
  };
  let last = '';
  return <dialog ref={ref} className="dialog command-palette" aria-label="Pencarian cepat" onCancel={e => { e.preventDefault(); onClose(); }} onClick={e => { if (e.target === ref.current) onClose(); }}>
    <div className="palette-input"><Search size={18} />
      <input ref={input} role="combobox" aria-expanded="true" aria-controls={listId} aria-activedescendant={items[index] ? `${listId}-${index}` : undefined} aria-label="Cari pekerjaan, halaman, atau tindakan" placeholder="Cari pekerjaan, halaman, atau tindakan…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKey} />
      <kbd>Esc</kbd></div>
    <div className="palette-list" id={listId} role="listbox" aria-label="Hasil">
      {items.length ? items.map((item, i) => {
        const header = item.group !== last ? (last = item.group) : null;
        return <div key={item.id} role="presentation">{header && <div className="palette-group" role="presentation">{header}</div>}
          <div id={`${listId}-${i}`} role="option" aria-selected={i === index} className={`palette-item ${i === index ? 'active' : ''}`} onMouseMove={() => setIndex(i)} onClick={() => choose(item)}>
            <span className="palette-icon"><item.icon size={16} /></span><span className="palette-label">{item.label}</span>{item.hint && <small>{item.hint}</small>}{i === index && <CornerDownLeft size={15} className="palette-enter" />}
          </div></div>;
      }) : <p className="palette-empty">Tidak ada hasil untuk “{query}”.</p>}
    </div>
    <footer className="palette-footer"><span><kbd>↑</kbd><kbd>↓</kbd> pilih</span><span><kbd>Enter</kbd> buka</span><span><kbd>Esc</kbd> tutup</span></footer>
  </dialog>;
}
