import { useEffect, useState } from 'react';
import { ArrowRight, ArrowDown, ShieldCheck, Mail, LockKeyhole, Eye, EyeOff, BellRing, UsersRound, FileBarChart2, ClipboardList, CalendarClock, MessagesSquare, Paperclip, Repeat, KeyRound, Cloud, History, Clock3, CheckCircle2 } from 'lucide-react';
import { useReveal } from '../lib/motion';
import { supabase, authReturn } from '../lib/supabase';
import { authRedirectUrl } from '../lib/authRedirect';
import { Button, Field } from '../components/ui';
import { Locomotive } from '../components/Locomotive';
import { useWorkspace } from '../lib/workspace';
import { errorMessage } from '../lib/domain';

const css = (v: Record<string, string | number>) => v as React.CSSProperties;
const wib = (d: Date) => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).format(d).replace(' pukul ', ' · ') + ' WIB';

/** Current time, refreshed every 30 s, for the live WIB clock on the sign-in screen. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);
  return now;
}

const features: [typeof ClipboardList, string, string][] = [
  [ClipboardList, 'Arahan & pekerjaan rutin', 'Catat arahan EVP dan tugas rutin dengan PIC, pendukung, prioritas, dan tenggat yang jelas.'],
  [CalendarClock, 'Agenda tenggat', 'Kalender bersama dalam WIB untuk melihat tenggat hari ini, tujuh hari ke depan, dan yang terlambat.'],
  [BellRing, 'Pengingat otomatis', 'PIC dan pendukung diingatkan menjelang tenggat; tugas tanpa PIC diteruskan ke admin.'],
  [MessagesSquare, 'Diskusi & mention', 'Bahas kendala pada tiap tugas dan sebut rekan agar tindak lanjut tidak tercecer.'],
  [Paperclip, 'Bukti pekerjaan', 'Lampirkan PDF, foto dari HP, dan dokumen Office hingga 20 MB di penyimpanan privat.'],
  [FileBarChart2, 'Laporan EVP', 'Susun laporan periode, finalisasi sebagai snapshot, lalu cetak, simpan PDF, atau ekspor CSV.'],
  [Repeat, 'Pekerjaan berulang', 'Jadwalkan tugas mingguan atau bulanan agar dibuat otomatis tanpa dicatat ulang.'],
  [KeyRound, 'Akses berbasis peran', 'Admin, anggota, dan pimpinan/pemantau melihat dan mengubah sesuai kewenangannya.'],
];
const steps: [string, string][] = [
  ['Penugasan', 'Catat arahan dan pekerjaan rutin. Tetapkan PIC, prioritas, dan tenggat.'],
  ['Pelaksanaan', 'Perbarui progres, bahas kendala, dan simpan bukti pekerjaan bersama tim.'],
  ['Laporan EVP', 'Tinjau hasil dalam satu periode, finalisasi laporan, lalu ekspor untuk disampaikan.'],
];
const trust: [typeof Cloud, string][] = [
  [Cloud, 'Data tersimpan di cloud, bukan di perangkat'],
  [ShieldCheck, 'Akses hanya untuk anggota yang diundang admin'],
  [History, 'Riwayat perubahan dicatat oleh server'],
  [Clock3, 'Seluruh waktu menggunakan WIB'],
];

export function Auth() {
  const { enterDemo } = useWorkspace();
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'reset' | 'magic'>('login');
  const [busy, setBusy] = useState(false), [message, setMessage] = useState(''), [error, setError] = useState(authReturn.error), [showPassword, setShowPassword] = useState(false);
  const now = useNow();
  useReveal('auth');
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setError(''); setMessage('');
    try {
      const result = mode === 'reset'
        ? await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUrl(location.origin) })
        : mode === 'magic'
          ? await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: authRedirectUrl(location.origin) } })
          : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) throw result.error;
      if (mode !== 'login') setMessage('Jika akun tersedia, tautan telah dikirim. Periksa kotak masuk dan folder spam.');
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  };
  const switchMode = (next: typeof mode) => { setMode(next); setError(''); setMessage(''); };

  return <div className="login-page">
    <section className="login-hero">
      <div className="login-visual">
        <div className="login-aurora" aria-hidden="true"><span /><span /><span /></div>
        <div className="login-gridlines" aria-hidden="true" />
        <header className="login-brand hero-in" style={css({ '--d': '0ms' })}>
          <a className="login-wordmark" href="/">kendali<span>BYLT</span></a>
          <span className="login-clock"><span className="login-clock-dot" />{wib(now)}</span>
        </header>
        <div className="login-copy">
          <p className="login-org hero-in" style={css({ '--d': '60ms' })}>UPT Balai Yasa Lahat · Tim Kerja</p>
          <h1 className="hero-in" style={css({ '--d': '120ms' })}>Pengelolaan pekerjaan <span className="login-gradient">Tim Kerja BYLT.</span></h1>
          <p className="login-lead hero-in" style={css({ '--d': '200ms' })}>Catat arahan, pantau pelaksanaan bersama tim, dan susun laporan periode dalam satu ruang kerja yang tersinkron.</p>
          <ul className="login-points">
            {([[BellRing, 'Pengingat tenggat otomatis'], [UsersRound, 'Koordinasi PIC & pendukung'], [FileBarChart2, 'Laporan EVP siap ekspor']] as const).map(([Icon, label], i) =>
              <li key={label} className="hero-in" style={css({ '--d': `${280 + i * 70}ms` })}><Icon size={16} />{label}</li>)}
          </ul>
        </div>
        <div className="login-scene"><Locomotive /></div>
      </div>

      <div className="login-panel">
        <nav className="login-nav" aria-label="Navigasi halaman masuk"><a href="#fitur">Fitur</a><a href="#alur">Alur kerja</a></nav>
        <div className="auth-form login-card hero-in" style={css({ '--d': '160ms' })}>
          <span className="login-eyebrow">Akses anggota</span>
          <h2>{mode === 'reset' ? 'Pulihkan kata sandi' : mode === 'magic' ? 'Masuk dengan tautan' : 'Selamat datang kembali.'}</h2>
          <p>{mode === 'login' ? 'Masuk dengan email yang telah diundang oleh admin UPT Balai Yasa Lahat.' : 'Masukkan email akun Anda untuk menerima tautan aman.'}</p>
          <form onSubmit={submit}>
            <Field label="Email"><div className="input-with-icon"><Mail size={18} /><input type="email" placeholder="nama@email.com" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div></Field>
            {mode === 'login' && <Field label="Kata sandi"><div className="input-with-icon password-field"><LockKeyhole size={18} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Masukkan kata sandi" required value={password} onChange={e => setPassword(e.target.value)} /><button type="button" className="password-toggle" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword} onClick={() => setShowPassword(v => !v)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></Field>}
            {mode === 'login' && <button className="text-button reset-link" type="button" onClick={() => switchMode('reset')}>Lupa kata sandi?</button>}
            {error && <div className="inline-alert danger" role="alert">{error}</div>}
            {message && <div className="inline-alert success" role="status">{message}</div>}
            <Button variant="primary" className="full-width" type="submit" busy={busy}>{mode === 'login' ? 'Masuk ke ruang kerja' : 'Kirim tautan'}<ArrowRight size={17} /></Button>
          </form>
          <Button variant="secondary" className="full-width magic-link-button" onClick={() => switchMode(mode === 'login' ? 'magic' : 'login')}>{mode === 'login' ? <Mail size={16} /> : null}{mode === 'login' ? 'Masuk melalui tautan email' : 'Kembali ke halaman masuk'}</Button>
          <div className="login-help">
            <p className="auth-invitation">Belum memiliki akses? Hubungi admin tim untuk mendapatkan undangan.</p>
            <button className="login-demo" onClick={enterDemo}>Lihat pratinjau dengan data contoh<ArrowRight size={15} /></button>
          </div>
        </div>
        <footer className="login-panel-foot"><ShieldCheck size={14} />Akses organisasi hanya untuk anggota yang diundang.</footer>
        <a className="login-scroll" href="#fitur" aria-label="Lihat fitur aplikasi"><ArrowDown size={16} /></a>
      </div>
    </section>

    <section id="fitur" className="login-section">
      <div className="login-section-head" data-reveal>
        <span className="login-kicker">Fitur</span>
        <h2>Semua yang dibutuhkan untuk mengendalikan pekerjaan tim.</h2>
        <p>Dari arahan pertama sampai laporan ke EVP, setiap langkah tercatat dan dapat ditelusuri.</p>
      </div>
      <div className="login-features">
        {features.map(([Icon, title, text], i) => <article key={title} className="login-feature" data-reveal style={css({ '--reveal-delay': `${(i % 4) * 70}ms` })}>
          <span className="login-feature-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p>
        </article>)}
      </div>
    </section>

    <section className="login-section login-product" data-reveal>
      <div className="login-product-copy">
        <span className="login-kicker">Satu pandangan</span>
        <h2>Status setiap pekerjaan, terlihat oleh seluruh tim.</h2>
        <p>Ringkasan menampilkan pekerjaan aktif, tenggat terdekat, dan yang perlu tindak lanjut. Perubahan dari anggota lain muncul otomatis, dan konflik penyuntingan dicegah sebelum data tertimpa.</p>
        <ul>{['Ringkasan dan peta status pekerjaan', 'Tabel dan papan Kanban', 'Pencarian cepat dengan ⌘K / Ctrl+K'].map(t => <li key={t}><CheckCircle2 size={16} />{t}</li>)}</ul>
      </div>
      <div className="hero-preview" aria-hidden="true">
        <div className="hero-window"><div className="hero-window-bar"><i /><i /><i /><span>Ruang kerja</span></div>
          {([['Arahan EVP', 'Berjalan', 'doing', 0.66], ['Pekerjaan rutin', 'Menunggu', 'waiting', 0.38], ['Laporan periode', 'Selesai', 'done', 1]] as const).map(([title, label, status, p], i) => <div className="hero-row" key={title} style={css({ '--i': i, '--p': p })}><span className={`hero-kind ${status}`} /><div><strong>{title}</strong><span className="hero-bar"><i /></span></div><span className={`badge ${status}`}><span className="status-dot" />{label}</span></div>)}
        </div>
        <div className="hero-float"><CheckCircle2 size={16} />Tersimpan di cloud</div>
      </div>
    </section>

    <section id="alur" className="login-section">
      <div className="login-section-head" data-reveal><span className="login-kicker">Alur kerja</span><h2>Tiga langkah, satu sumber data.</h2></div>
      <ol className="login-steps" data-reveal>
        {steps.map(([title, text], i) => <li key={title} style={css({ '--i': i })}><span className="login-step-no">{String(i + 1).padStart(2, '0')}</span><h3>{title}</h3><p>{text}</p></li>)}
      </ol>
    </section>

    <section className="login-trust" aria-label="Keamanan dan data">
      {trust.map(([Icon, text], i) => <div key={text} data-reveal style={css({ '--reveal-delay': `${i * 70}ms` })}><Icon size={18} /><span>{text}</span></div>)}
    </section>

    <footer className="login-footer"><span>Kendali Kerja BYLT · UPT Balai Yasa Lahat</span><span>Asia/Jakarta · WIB</span></footer>
  </div>;
}
