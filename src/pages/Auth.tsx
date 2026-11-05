import { useState } from 'react';
import { ArrowRight,ArrowUpRight,ShieldCheck,Mail,LockKeyhole,Eye,EyeOff,CheckCircle2 } from 'lucide-react';
import { useReveal } from '../lib/motion';
import { supabase,authReturn } from '../lib/supabase';
import { authRedirectUrl } from '../lib/authRedirect';
import { Button,Field } from '../components/ui';
import { useWorkspace } from '../lib/workspace';
import { errorMessage } from '../lib/domain';

export function Auth(){
 const{enterDemo}=useWorkspace();
 const[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const[mode,setMode]=useState<'login'|'reset'|'magic'>('login');
 const[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(authReturn.error),[showPassword,setShowPassword]=useState(false);
 useReveal('auth');
 const submit=async(e:React.FormEvent)=>{
  e.preventDefault();setBusy(true);setError('');setMessage('');
  try{
   const result=mode==='reset'
    ?await supabase.auth.resetPasswordForEmail(email,{redirectTo:authRedirectUrl(location.origin)})
    :mode==='magic'
     ?await supabase.auth.signInWithOtp({email,options:{shouldCreateUser:false,emailRedirectTo:authRedirectUrl(location.origin)}})
     :await supabase.auth.signInWithPassword({email,password});
   if(result.error)throw result.error;
   if(mode!=='login')setMessage('Jika akun tersedia, tautan telah dikirim. Periksa kotak masuk dan folder spam.');
  }catch(err){setError(errorMessage(err));}finally{setBusy(false);}
 };
 return <div className="auth-page reference-home">
  <header className="reference-header"><a className="reference-wordmark" href="/">kendali<span>BYLT</span></a><nav aria-label="Navigasi halaman masuk"><a href="#alur">Alur kerja</a><a href="#akses">Masuk <ArrowUpRight size={14}/></a></nav></header>
  <section className="reference-hero">
   <div className="hero-aurora" aria-hidden="true"><span/><span/><span/></div>
   <div className="hero-copy">
    <p className="reference-org hero-in" style={{'--d':'0ms'} as React.CSSProperties}>UPT Balai Yasa Lahat</p>
    <h1 className="hero-in" style={{'--d':'80ms'} as React.CSSProperties}>Pengelolaan pekerjaan <span className="hero-gradient-text">Tim Kerja BYLT.</span></h1>
    <p className="hero-lead hero-in" style={{'--d':'160ms'} as React.CSSProperties}>Catat arahan, pantau pelaksanaan, dan laporkan hasilnya dalam satu ruang kerja bersama.</p>
    <div className="reference-actions hero-in" style={{'--d':'240ms'} as React.CSSProperties}><a className="button primary" href="#akses">Masuk ke aplikasi <ArrowRight size={16}/></a><button className="reference-preview" onClick={enterDemo}>Lihat pratinjau <ArrowRight size={16}/></button></div>
   </div>
   <div className="hero-preview hero-in" style={{'--d':'320ms'} as React.CSSProperties} aria-hidden="true">
    <div className="hero-window"><div className="hero-window-bar"><i/><i/><i/><span>Ruang kerja</span></div>
     {([['Arahan EVP','Berjalan','doing',0.66],['Pekerjaan rutin','Menunggu','waiting',0.38],['Laporan periode','Selesai','done',1]] as const).map(([title,label,status,p],i)=><div className="hero-row" key={title} style={{'--i':i,'--p':p} as React.CSSProperties}><span className={`hero-kind ${status}`}/><div><strong>{title}</strong><span className="hero-bar"><i/></span></div><span className={`badge ${status}`}><span className="status-dot"/>{label}</span></div>)}
    </div>
    <div className="hero-float"><CheckCircle2 size={16}/>Tersimpan di cloud</div>
   </div>
  </section>
  <section id="alur" className="reference-workflow" aria-label="Alur kerja aplikasi">
   <div data-reveal><span>01</span><h2>Penugasan</h2><p>Catat arahan EVP dan pekerjaan rutin. Tetapkan PIC, prioritas, dan tenggat.</p></div>
   <div data-reveal style={{'--reveal-delay':'90ms'} as React.CSSProperties}><span>02</span><h2>Pelaksanaan</h2><p>Perbarui progres, bahas kendala, dan simpan bukti pekerjaan bersama tim.</p></div>
   <div data-reveal style={{'--reveal-delay':'180ms'} as React.CSSProperties}><span>03</span><h2>Laporan EVP</h2><p>Tinjau hasil dalam satu periode, finalisasi laporan, lalu ekspor untuk disampaikan.</p></div>
  </section>
  <section id="akses" className="reference-access"><div className="reference-access-intro" data-reveal><span>Akses anggota</span><h2>Masuk ke{' '}<br/>ruang kerja.</h2><p>Gunakan email yang telah diundang oleh admin UPT Balai Yasa Lahat.</p></div>
  <div className="auth-form-area" data-reveal style={{'--reveal-delay':'90ms'} as React.CSSProperties}><div className="auth-form">
   
   <h2>{mode==='reset'?'Pulihkan kata sandi':mode==='magic'?'Masuk dengan tautan':'Selamat datang kembali.'}</h2>
   <p>{mode==='login'?'Lanjutkan pekerjaan dan koordinasi tim Anda.':'Masukkan email akun Anda untuk menerima tautan aman.'}</p>
   <form onSubmit={submit}>
    <Field label="Email"><div className="input-with-icon"><Mail size={18}/><input type="email" placeholder="nama@email.com" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div></Field>
    {mode==='login'&&<Field label="Kata sandi"><div className="input-with-icon password-field"><LockKeyhole size={18}/><input type={showPassword?'text':'password'} autoComplete="current-password" placeholder="Masukkan kata sandi" required value={password} onChange={e=>setPassword(e.target.value)}/><button type="button" className="password-toggle" aria-label={showPassword?'Sembunyikan kata sandi':'Tampilkan kata sandi'} aria-pressed={showPassword} onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></Field>}
    {mode==='login'&&<button className="text-button reset-link" type="button" onClick={()=>{setMode('reset');setError('');setMessage('');}}>Lupa kata sandi?</button>}
    {error&&<div className="inline-alert danger" role="alert">{error}</div>}
    {message&&<div className="inline-alert success" role="status">{message}</div>}
    <Button variant="primary" className="full-width" type="submit" busy={busy}>{mode==='login'?'Masuk ke ruang kerja':'Kirim tautan'}<ArrowRight size={17}/></Button>
   </form>
   <Button variant="secondary" className="full-width magic-link-button" onClick={()=>{setMode(mode==='login'?'magic':'login');setError('');setMessage('');}}>{mode==='login'?<Mail size={16}/>:null}{mode==='login'?'Masuk melalui tautan email':'Kembali ke halaman masuk'}</Button>
   <div className="auth-divider"/><p className="auth-invitation">Belum memiliki akses?<br/>Hubungi admin tim untuk mendapatkan undangan.</p>
  </div><footer><ShieldCheck size={13}/> Akses organisasi hanya untuk anggota yang diundang.</footer></div></section><footer className="reference-footer"><span>Kendali Kerja BYLT</span><span>UPT Balai Yasa Lahat · Asia/Jakarta</span></footer>
 </div>;
}
