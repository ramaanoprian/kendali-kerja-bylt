import { useState } from 'react';
import { ArrowRight,ArrowUpRight,ShieldCheck,Check,Layers3,Mail,LockKeyhole,ClipboardCheck,UsersRound,FileCheck2 } from 'lucide-react';
import { supabase,authReturn } from '../lib/supabase';
import { authRedirectUrl } from '../lib/authRedirect';
import { Button,Field } from '../components/ui';
import { useWorkspace } from '../lib/workspace';
import { errorMessage } from '../lib/domain';

export function Auth(){
 const{enterDemo}=useWorkspace();
 const[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const[mode,setMode]=useState<'login'|'reset'|'magic'>('login');
 const[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(authReturn.error);
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
   <p className="reference-org">UPT Balai Yasa Lahat</p>
   <h1>Pengelolaan pekerjaan Tim Kerja BYLT.<span> Catat arahan, pantau pelaksanaan, dan laporkan hasilnya.</span></h1>
   <div className="reference-actions"><a className="button primary" href="#akses">Masuk ke aplikasi <ArrowRight size={16}/></a><button className="reference-preview" onClick={enterDemo}>Lihat pratinjau <ArrowRight size={16}/></button></div>
  </section>
  <section id="alur" className="reference-workflow" aria-label="Alur kerja aplikasi">
   <div><span>01</span><h2>Penugasan</h2><p>Catat arahan EVP dan pekerjaan rutin. Tetapkan PIC, prioritas, dan tenggat.</p></div>
   <div><span>02</span><h2>Pelaksanaan</h2><p>Perbarui progres, bahas kendala, dan simpan bukti pekerjaan bersama tim.</p></div>
   <div><span>03</span><h2>Laporan EVP</h2><p>Tinjau hasil dalam satu periode, finalisasi laporan, lalu ekspor untuk disampaikan.</p></div>
  </section>
  <section id="akses" className="reference-access"><div className="reference-access-intro"><span>Akses anggota</span><h2>Masuk ke<br/>ruang kerja.</h2><p>Gunakan email yang telah diundang oleh admin UPT Balai Yasa Lahat.</p></div>
  <div className="auth-form-area"><div className="auth-form">
   
   <h2>{mode==='reset'?'Pulihkan kata sandi':mode==='magic'?'Masuk dengan tautan':'Selamat datang kembali.'}</h2>
   <p>{mode==='login'?'Lanjutkan pekerjaan dan koordinasi tim Anda.':'Masukkan email akun Anda untuk menerima tautan aman.'}</p>
   <form onSubmit={submit}>
    <Field label="Email"><div className="input-with-icon"><Mail size={18}/><input type="email" placeholder="nama@kai.id" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></div></Field>
    {mode==='login'&&<Field label="Kata sandi"><div className="input-with-icon"><LockKeyhole size={18}/><input type="password" autoComplete="current-password" placeholder="Masukkan kata sandi" required value={password} onChange={e=>setPassword(e.target.value)}/></div></Field>}
    {mode==='login'&&<button className="text-button reset-link" type="button" onClick={()=>{setMode('reset');setError('');setMessage('');}}>Lupa kata sandi?</button>}
    {error&&<div className="inline-alert danger" role="alert">{error}</div>}
    {message&&<div className="inline-alert success" role="status">{message}</div>}
    <Button variant="primary" className="full-width" type="submit" busy={busy}>{mode==='login'?'Masuk ke ruang kerja':'Kirim tautan'}<ArrowRight size={17}/></Button>
   </form>
   <Button variant="secondary" className="full-width magic-link-button" onClick={()=>{setMode(mode==='login'?'magic':'login');setError('');setMessage('');}}>{mode==='login'?<Mail size={16}/>:null}{mode==='login'?'Masuk melalui tautan email':'Kembali ke halaman masuk'}</Button>
   <div className="auth-divider"/><p className="auth-invitation">Belum memiliki akses?<br/>Hubungi admin tim untuk mendapatkan undangan.</p>
   <button className="demo-link" onClick={enterDemo}>Jelajahi tampilan dengan data contoh<ArrowUpRight size={16}/></button>
  </div><footer><ShieldCheck size={13}/> Akses organisasi hanya untuk anggota yang diundang.</footer></div></section><footer className="reference-footer"><span>Kendali Kerja BYLT</span><span>UPT Balai Yasa Lahat · Asia/Jakarta</span></footer>
 </div>;
}
