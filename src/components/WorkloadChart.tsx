import { ArrowUpRight } from 'lucide-react';
import type { Task,Status } from '../lib/types';
import { statuses } from '../lib/types';

const order:Status[]=['todo','doing','waiting','done','cancelled'];
/** A categorical chart of the filtered records; no simulated trend or history. */
export function WorkloadChart({tasks,onSelect}:{tasks:Task[];onSelect:(status:Status)=>void}){
 const values=order.map(status=>({status,count:tasks.filter(task=>task.status===status).length}));
 const maximum=Math.max(1,...values.map(item=>item.count));
 return <section className="panel workload-panel" aria-label="Distribusi status pekerjaan">
  <div className="panel-heading"><div><span className="section-kicker">PELAKSANAAN</span><h2>Peta pekerjaan</h2><p>Posisi setiap pekerjaan, dari arahan sampai hasil.</p></div><span className="chart-total"><strong>{tasks.length}</strong> pekerjaan</span></div>
  <div className="workload-chart">{values.map(({status,count})=><button className={`workload-column ${status}`} key={status} onClick={()=>onSelect(status)} aria-label={`${statuses[status]}: ${count} pekerjaan`}>
   <span className="workload-number">{count}<ArrowUpRight size={13}/></span>
   <span className="workload-track"><span style={{height:count?`${Math.max(4,count/maximum*100)}%`:'0%'}}/></span>
   <span className="workload-label"><i/>{statuses[status]}</span>
  </button>)}</div>
  <div className="chart-footnote"><span>Data mengikuti filter ringkasan</span><span>Pilih status untuk membuka pekerjaan <ArrowUpRight size={12}/></span></div>
 </section>;
}
