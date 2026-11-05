import { ArrowUpRight, ArrowRight, BriefcaseBusiness, Clock3, TriangleAlert, CheckCheck, CalendarDays, Flag, CheckCircle2, Plus, Users, ChevronRight, FileText, Target } from 'lucide-react';
import { useWorkspace } from '../lib/workspace';
import { active, overdue, soon, needsAttention, dateLabel, taskNumber, timeLabel, filterTasks, relativeDue, greeting, longDate, dateKey, dayDiff } from '../lib/domain';
import type { Task, Filters } from '../lib/types';
import { Badge, Avatar, Button, Empty, Progress, CountUp, DueLabel } from '../components/ui';
import { WorkloadChart } from '../components/WorkloadChart';
import { Filters as FilterBar } from '../components/Filters';

const byDue = (a: Task, b: Task) => (a.due_at || '9999').localeCompare(b.due_at || '9999');
const weekday = new Intl.DateTimeFormat('id-ID', { weekday: 'short', timeZone: 'Asia/Jakarta' });
const dayNum = new Intl.DateTimeFormat('id-ID', { day: 'numeric', timeZone: 'Asia/Jakarta' });

export function Dashboard({ tasks, filters, setFilters, onOpen, onList, onReports, onNew, onAgenda }: { tasks: Task[]; filters: Filters; setFilters: (f: Filters) => void; onOpen: (t: Task) => void; onList: (attention?: string) => void; onReports: () => void; onNew: () => void; onAgenda: () => void }) {
  const { data, userId, role, demo } = useWorkspace();
  const fullName = data.profiles.find(p => p.id === userId)?.name || 'Tim Kerja';
  const activeTasks = tasks.filter(active), done = filterTasks(data.tasks, { ...filters, attention: 'done' }, userId, data);
  const attentionAll = tasks.filter(needsAttention), attention = [...attentionAll].sort((a, b) => Number(overdue(b)) - Number(overdue(a))).slice(0, 4);
  const late = tasks.filter(t => overdue(t)), upcoming = tasks.filter(t => soon(t)).sort(byDue);
  const total = tasks.filter(t => t.status !== 'cancelled').length, completion = total ? Math.round(done.length / total * 100) : 0;
  const evp = activeTasks.filter(t => t.kind === 'evp').length, routine = activeTasks.length - evp;
  const mine = activeTasks.filter(t => t.pic_id === userId || data.supporters.some(s => s.task_id === t.id && s.user_id === userId)).sort(byDue).slice(0, 5);
  const now = new Date();
  // Deadline density for today + the next six days (WIB calendar days).
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(now.getTime() + i * 86400000); const key = dateKey(d); return { key, d, items: activeTasks.filter(t => t.due_at && dateKey(t.due_at) === key) }; });
  const weekMax = Math.max(1, ...week.map(w => w.items.length));
  const summary = [
    attentionAll.length ? `${attentionAll.length} pekerjaan perlu perhatian` : 'Tidak ada pekerjaan yang perlu perhatian',
    late.length ? `${late.length} melewati tenggat` : '',
    upcoming.length ? `${upcoming.length} tenggat dalam 7 hari` : '',
  ].filter(Boolean).join(' · ');
  const next = upcoming[0];
  const kpis = [
    { key: 'active', label: 'Pekerjaan aktif', value: activeTasks.length, icon: BriefcaseBusiness, tone: 'blue', detail: `${evp} arahan EVP · ${routine} rutin`, viz: <span className="kpi-split" aria-hidden="true"><i style={{ flexGrow: evp || 0.0001 }} /><i style={{ flexGrow: routine || 0.0001 }} /></span> },
    { key: 'soon', label: 'Tenggat terdekat', value: upcoming.length, icon: Clock3, tone: 'orange', detail: next ? `Berikutnya ${relativeDue(next).label.toLowerCase()}` : 'Dalam 7 hari ke depan', viz: null },
    { key: 'overdue', label: 'Perlu tindak lanjut', value: late.length, icon: TriangleAlert, tone: late.length ? 'red alert' : 'red', detail: 'Pekerjaan melewati tenggat', viz: null },
    { key: 'done', label: 'Pekerjaan selesai', value: done.length, icon: CheckCheck, tone: 'green', detail: `${completion}% dari ${total} pekerjaan`, viz: <span className="kpi-meter" aria-hidden="true"><i style={{ width: `${completion}%` }} /></span> },
  ];
  const recent = data.history.filter(h => tasks.some(t => t.id === h.task_id)).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 4);

  return <>
    <div className="page-intro dashboard-intro">
      <div>
        <div className="eyebrow">UPT BALAI YASA LAHAT</div>
        <h1>Ringkasan pekerjaan</h1>
        <p className="dashboard-greeting"><strong>{greeting(now)}, {fullName.split(' ')[0]}.</strong> {summary}.</p>
      </div>
      <div className="intro-actions">
        <span className="date-pill"><CalendarDays size={16} />{longDate(now)}</span>
        <FilterBar value={filters} onChange={setFilters} compact />
        {role !== 'viewer' && <Button variant="primary" onClick={onNew}><Plus size={17} />Catat tugas</Button>}
      </div>
    </div>

    <div className="kpi-grid">{kpis.map(k => <button key={k.key} className={`kpi-card ${k.tone}`} onClick={() => onList(k.key)}>
      <span className="kpi-icon"><k.icon size={18} /></span>
      <span className="kpi-value"><CountUp value={k.value} /></span>
      <span className="kpi-label">{k.label}</span>
      <span className="kpi-detail">{k.detail}</span>
      {k.viz}
      <ArrowUpRight size={16} className="kpi-arrow" />
    </button>)}</div>


    <div className="attention-summary-links"><button onClick={() => onList('waiting')}><Clock3 size={15} /><strong>{tasks.filter(t => t.status === 'waiting').length}</strong> menunggu data / keputusan<ArrowRight size={13} /></button><button onClick={() => onList('missing')}><Users size={15} /><strong>{tasks.filter(t => active(t) && !t.pic_id).length}</strong> belum memiliki PIC<ArrowRight size={13} /></button><button onClick={() => onList('nodue')}><CalendarDays size={15} /><strong>{tasks.filter(t => active(t) && !t.due_at).length}</strong> perlu konfirmasi tenggat<ArrowRight size={13} /></button></div>

    <div className="dashboard-grid"><div className="dashboard-main">
      <section className="panel attention-panel"><div className="panel-heading"><div><h2><span className="attention-indicator" />Perlu perhatian <span className="neutral-count">{attentionAll.length}</span></h2><p>Dahulukan hal yang membutuhkan langkah Anda.</p></div><Button variant="ghost" onClick={() => onList('attention')}>Lihat semua<ArrowRight size={16} /></Button></div>{attention.length ? <div className="attention-list">{attention.map(t => <button key={t.id} className="attention-row" onClick={() => onOpen(t)}><span className={`attention-row-icon ${overdue(t) ? 'red' : t.status === 'waiting' ? 'orange' : 'blue'}`}>{overdue(t) ? <Clock3 size={19} /> : t.status === 'waiting' ? <Flag size={19} /> : <Users size={19} />}</span><div><strong>{t.title}</strong><p><span>{taskNumber(t.number)}</span><span>·</span>{overdue(t) ? relativeDue(t).label : !t.pic_id ? 'PIC belum ditetapkan' : !t.due_at ? 'Perlu konfirmasi tenggat' : t.waiting_reason || 'Keputusan diperlukan'}</p></div><Badge status={t.status} /><ChevronRight size={17} /></button>)}</div> : <Empty title="Semua terkendali" description={tasks.length ? 'Tidak ada pekerjaan yang perlu perhatian dalam filter ini.' : 'Catat arahan pertama. Tindak lanjut yang perlu perhatian akan muncul di sini.'} icon={<CheckCircle2 size={28} />} action={!tasks.length && role !== 'viewer' ? <Button onClick={onNew}><Plus size={16} />Catat tugas pertama</Button> : undefined} />}</section>

      <section className="week-strip" aria-label="Tenggat tujuh hari ke depan">
        <div className="week-head"><h2>Tenggat 7 hari ke depan</h2>{late.length > 0 && <button className="week-late" onClick={() => onList('overdue')}><TriangleAlert size={14} />{late.length} terlambat</button>}<Button variant="ghost" onClick={onAgenda}>Buka agenda<ArrowRight size={16} /></Button></div>
        <div className="week-days">{week.map((w, i) => <button key={w.key} className={`week-day ${i === 0 ? 'today' : ''} ${w.items.length ? 'has' : ''}`} onClick={onAgenda} aria-label={`${i === 0 ? 'Hari ini' : weekday.format(w.d)} ${dayNum.format(w.d)}: ${w.items.length} tenggat`} title={w.items.map(t => t.title).join('\n') || undefined}>
          <span className="week-name">{i === 0 ? 'Hari ini' : i === 1 ? 'Besok' : weekday.format(w.d)}</span>
          <span className="week-date">{dayNum.format(w.d)}</span>
          <span className="week-bar"><i style={{ height: `${w.items.length / weekMax * 100}%` }} /></span>
          <span className="week-count">{w.items.length ? `${w.items.length} tenggat` : '—'}</span>
        </button>)}</div>
      </section>
      <section className="panel focus-panel"><div className="panel-heading"><div><h2><Target size={18} className="heading-icon" />Fokus Anda</h2><p>Pekerjaan aktif di mana Anda menjadi PIC atau pendukung, urut tenggat.</p></div><Button variant="ghost" onClick={() => { setFilters({ ...filters, preset: 'mine', attention: '' }); onList(); }}>Pekerjaan saya<ArrowRight size={16} /></Button></div>
        {mine.length ? <div className="focus-list">{mine.map(t => <button key={t.id} className="focus-row" onClick={() => onOpen(t)}>
          <span className={`kind-marker ${t.kind}`} /><span className="focus-main"><strong>{t.title}</strong><small>{taskNumber(t.number)} · {t.pic_id === userId ? 'PIC' : 'Pendukung'} · {data.teams.find(x => x.id === t.team_id)?.name || 'Tim belum ditetapkan'}</small></span>
          <DueLabel task={t} /><Progress value={t.progress} />
        </button>)}</div> : <div className="quiet-empty">{role === 'viewer' ? 'Sebagai pimpinan/pemantau, Anda tidak memegang pekerjaan. Gunakan Perlu perhatian dan Laporan EVP untuk memantau tim.' : 'Belum ada pekerjaan aktif untuk Anda. Pekerjaan yang menugaskan Anda akan muncul di sini.'}</div>}
      </section>

      <WorkloadChart tasks={tasks} onSelect={status => { setFilters({ ...filters, status, preset: 'all', attention: '' }); onList(); }} />

      <section className="panel"><div className="panel-heading"><div><h2>Pekerjaan yang berjalan</h2><p>Tugas aktif tim, PIC, dan progres terakhir.</p></div><Button variant="ghost" onClick={() => onList('active')}>Semua tugas<ArrowRight size={16} /></Button></div>{activeTasks.length ? <div className="compact-tasks">{activeTasks.slice(0, 4).map(t => <button key={t.id} onClick={() => onOpen(t)} className="compact-task"><div><span className={`kind-marker ${t.kind}`} /><span><strong>{t.title}</strong><small>{data.teams.find(x => x.id === t.team_id)?.name || 'Tim belum ditetapkan'} <span>·</span> <DueLabel task={t} /></small></span></div><Avatar size="small" name={data.profiles.find(p => p.id === t.pic_id)?.name || 'Belum ditetapkan'} /><Progress value={t.progress} /></button>)}</div> : <Empty title="Ruang untuk langkah berikutnya" description="Pekerjaan aktif akan ditampilkan di sini." />}</section>

      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Aktivitas terbaru</h2><p>Perubahan terakhir yang tercatat.</p></div><span className="subtle">Waktu Indonesia Barat</span></div>{recent.length ? <div className="timeline">{recent.map(h => <button className="timeline-item" key={h.id} onClick={() => { const t = data.tasks.find(t => t.id === h.task_id); if (t) onOpen(t); }}><Avatar name={data.profiles.find(p => p.id === h.actor_id)?.name || 'Anggota'} /><div><p><strong>{data.profiles.find(p => p.id === h.actor_id)?.name || 'Anggota'}</strong> {h.action === 'created' ? 'mencatat tugas' : 'memperbarui pekerjaan'}</p><span>{data.tasks.find(t => t.id === h.task_id)?.title}</span></div><time>{dayDiff(h.created_at, now) === 0 ? timeLabel(h.created_at) : dateLabel(h.created_at)}</time></button>)}</div> : <div className="quiet-empty">Belum ada aktivitas. Setiap perubahan akan tercatat di sini.</div>}</section>
    </div>

    <aside className="dashboard-aside">
      <section className="progress-panel composition-panel"><div className="panel-heading"><div><span className="section-kicker">HASIL BERSAMA</span><h2>Penyelesaian tugas</h2></div><CheckCircle2 size={19} /></div><div className="completion-summary"><strong><CountUp value={completion} /><span>%</span></strong><p>{done.length} dari {total} pekerjaan selesai</p></div><div className="completion-meter" role="progressbar" aria-label="Persentase pekerjaan selesai" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, completion)}%` }} /></div><div className="work-kind-list">{(['evp', 'routine'] as const).map(kind => <div key={kind}><span><i className={`kind-marker ${kind}`} />{kind === 'evp' ? 'Arahan EVP' : 'Pekerjaan rutin'}</span><strong>{tasks.filter(t => t.kind === kind).length}</strong></div>)}</div><div className="progress-legend"><span><i className="dot green" />Selesai<strong>{done.length}</strong></span><span><i className="dot blue" />Berjalan<strong>{tasks.filter(t => t.status === 'doing').length}</strong></span><span><i className="dot orange" />Menunggu<strong>{tasks.filter(t => t.status === 'waiting').length}</strong></span><span><i className="dot gray" />Belum mulai<strong>{tasks.filter(t => t.status === 'todo').length}</strong></span></div></section>
      <section className="panel team-panel"><div className="panel-heading"><h2>Beban kerja tim</h2><Users size={17} /></div>{data.teams.length ? data.teams.map((team, i) => { const n = activeTasks.filter(t => t.team_id === team.id).length; return <button className="team-load" key={team.id} onClick={() => { setFilters({ ...filters, team: team.id }); onList(); }}><div><span className={`team-symbol team-${i % 3}`}><Users size={17} /></span><strong>{team.name}</strong><span>{n} tugas</span></div><div className="team-track"><span style={{ width: `${activeTasks.length ? n / activeTasks.length * 100 : 0}%` }} /></div></button>; }) : <p className="quiet-empty">Tambahkan tim melalui Pengaturan untuk melihat distribusi pekerjaan.</p>}{data.profiles.length > 0 && <div className="member-distribution">{data.profiles.filter(p => data.memberships.some(m => m.user_id === p.id && m.active)).map(p => <div key={p.id}><Avatar size="small" name={p.name} /><span>{p.name}</span><strong>{activeTasks.filter(t => t.pic_id === p.id).length}</strong></div>)}</div>}</section>
      <div className="coordination-note"><span className="note-icon"><FileText size={21} /></span><span className="section-kicker">LAPORAN EVP</span><h3>Laporan EVP</h3><p>Pilih periode untuk meninjau hasil, kendala, dan kebutuhan keputusan.</p><button onClick={onReports}>Tinjau laporan<ArrowRight size={16} /></button></div>
    </aside></div>
    <footer className="page-footer"><span>Kendali Kerja BYLT · UPT Balai Yasa Lahat</span><span>{demo ? 'Data contoh · tidak tersimpan di cloud' : 'Sumber data: Supabase'} <span>•</span> Asia/Jakarta</span></footer>
  </>;
}
