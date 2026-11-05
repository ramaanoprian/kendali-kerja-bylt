export type Role='admin'|'member'|'viewer';
export type Status='todo'|'doing'|'waiting'|'done'|'cancelled';
export type Priority='normal'|'high'|'urgent';
export type Kind='evp'|'routine';
export interface Task {
 id:string; organization_id:string; number:number; title:string; description:string; kind:Kind; assigned_by:string;
 received_at:string; due_at:string|null; team_id:string|null; department_id:string|null; pic_id:string|null;
 priority:Priority; status:Status; progress:number; expected_result:string; actual_result:string; obstacles:string;
 decision_needed:string; next_action:string; waiting_reason:string; waiting_on:string; change_reason:string;
 created_by:string; updated_by:string; created_at:string; updated_at:string; completed_at:string|null; archived_at:string|null;
 version:number; request_id:string;
}
export type TaskInput=Omit<Task,'id'|'organization_id'|'number'|'created_by'|'updated_by'|'created_at'|'updated_at'|'completed_at'|'archived_at'|'version'|'request_id'>;
export interface Named {id:string;organization_id:string;name:string}
export interface Profile {id:string;name:string;reminders:boolean}
export interface Membership {organization_id:string;user_id:string;role:Role;active:boolean}
export interface TeamMember {organization_id:string;team_id:string;user_id:string}
export interface Supporter {organization_id:string;task_id:string;user_id:string}
export interface Subtask {id:string;organization_id:string;task_id:string;title:string;done:boolean}
export interface Comment {id:string;organization_id:string;task_id:string;author_id:string;body:string;mentions:string[];created_at:string}
export interface Attachment {id:string;organization_id:string;task_id:string;name:string;path:string;size:number;mime:string;caption:string;uploaded_by:string;created_at:string}
export interface History {id:string;organization_id:string;task_id:string;actor_id:string;action:string;before_data:Task|null;after_data:Task|null;reason:string;created_at:string}
export interface Notification {id:string;task_id:string;title:string;read_at:string|null;created_at:string}
export interface Contact extends Named {position:string;department_id:string|null;phone:string;email:string;notes:string}
export interface Snapshot {tasks:Task[];attachments:Attachment[];captured_at:string;mode:'current'|'historical'}
export interface Report {id:string;organization_id:string;title:string;start_date:string;end_date:string;version:number;mode:'current'|'historical';snapshot:Snapshot;narrative:string;created_by:string;created_at:string;filters:Record<string,string>}
export interface Invitation {id:string;email:string;name:string;role:Role}
export type Frequency='weekly'|'monthly';
export interface Recurrence {id:string;organization_id:string;title:string;description:string;kind:Kind;priority:Priority;assigned_by:string;expected_result:string;team_id:string|null;department_id:string|null;pic_id:string|null;supporters:string[];freq:Frequency;weekday:number|null;month_day:number|null;due_days:number;due_time:string;active:boolean;next_run:string;last_run:string|null;created_by:string;created_at:string;updated_at:string}
export const weekdays=['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
export interface WorkspaceData {tasks:Task[];profiles:Profile[];memberships:Membership[];teams:Named[];departments:Named[];teamMembers:TeamMember[];supporters:Supporter[];subtasks:Subtask[];comments:Comment[];attachments:Attachment[];history:History[];notifications:Notification[];contacts:Contact[];reports:Report[];invitations:Invitation[];recurrences:Recurrence[]}
export type Page='dashboard'|'tasks'|'agenda'|'reports'|'contacts'|'activity'|'archive'|'settings';
export interface Filters {search:string;preset:string;team:string;member:string;department:string;kind:string;status:string;priority:string;from:string;to:string;attention:string}
export const emptyFilters:Filters={search:'',preset:'all',team:'',member:'',department:'',kind:'',status:'',priority:'',from:'',to:'',attention:''};
export const statuses:Record<Status,string>={todo:'Belum mulai',doing:'Berjalan',waiting:'Menunggu',done:'Selesai',cancelled:'Dibatalkan'};
export const priorities:Record<Priority,string>={normal:'Normal',high:'Tinggi',urgent:'Mendesak'};
export const kinds:Record<Kind,string>={evp:'Arahan EVP',routine:'Pekerjaan rutin'};
export const roles:Record<Role,string>={admin:'Admin',member:'Anggota tim kerja',viewer:'Pimpinan / pemantau'};
