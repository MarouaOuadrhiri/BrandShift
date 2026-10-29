import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import {
  ADMIN_USER, DEMO_DEPARTMENTS, DEMO_DEPARTMENT_LIST, DEMO_EMPLOYEES, DEMO_HEATMAP,
  DEMO_MEETINGS, DEMO_PROJECTS, DEMO_SESSIONS, DEMO_TASKS, DEMO_USERS,
  demoAttendanceLogs, demoDepartmentDetail, demoEmployeeHistory, demoThread,
} from './demo-data';

// ─────────────────────────────────────────────────────────────
// DEMO MODE: every /api/ call is answered locally with fake
// data — the app runs fully without a backend.
// ─────────────────────────────────────────────────────────────

let currentUser: any = null;

function storedRole(): string | null {
  try { return localStorage.getItem('role'); } catch { return null; }
}

function me(): any {
  if (currentUser) return currentUser;
  return storedRole() === 'ADMIN' ? ADMIN_USER : DEMO_USERS[0];
}

const ok = (body: any, status = 200) => of(new HttpResponse({ status, body }));

export const demoInterceptor: HttpInterceptorFn = (req, next) => {
  const apiIdx = req.url.indexOf('/api/');
  if (apiIdx === -1) return next(req);

  const path = req.url.substring(apiIdx + 5); // after '/api/'
  const method = req.method;
  const body: any = (req as any).body || {};

  // ── Auth ──
  if (path === 'users/login/' && method === 'POST') {
    const email = (body.email || '').toLowerCase();
    if (email.includes('admin')) {
      currentUser = ADMIN_USER;
      return ok({ token: 'demo-admin-token', role: 'ADMIN', user: ADMIN_USER });
    }
    currentUser = DEMO_USERS.find((u) => u.email === email) || DEMO_USERS[0];
    return ok({ token: 'demo-token', role: 'EMPLOYEE', user: currentUser });
  }

  // ── Me / profile ──
  if (path === 'users/me/' && method === 'GET') return ok(me());
  if (path === 'users/me/' && method === 'PATCH') return ok({ message: 'Profile updated successfully.', user: { ...me(), ...body } });
  if (path === 'users/me/preferences/' && method === 'PATCH') return ok({ message: 'Preferences saved.', preferences: body.preferences ?? body });
  if (path === 'users/me/sessions/' && method === 'GET') return ok(DEMO_SESSIONS);
  if (path === 'users/me/sessions/revoke/' && method === 'POST') return ok({ message: 'Session revoked successfully' });
  if (path === 'users/verify-password/' && method === 'POST') return ok({ success: true });

  // ── Employees ──
  if (path === 'users/employees/' && method === 'GET') return ok(DEMO_EMPLOYEES);
  if (path === 'users/employees/' && method === 'POST') {
    return ok({ ...DEMO_EMPLOYEES[0], ...body, id: `u${Date.now()}` }, 201);
  }
  const empHist = path.match(/^users\/employees\/([^/]+)\/history\/$/);
  if (empHist && method === 'GET') return ok(demoEmployeeHistory(empHist[1]));
  const empAtt = path.match(/^users\/employees\/([^/]+)\/attendance\/$/);
  if (empAtt && method === 'GET') return ok(demoAttendanceLogs(empAtt[1]));
  const empDetail = path.match(/^users\/employees\/([^/]+)\/$/);
  if (empDetail && method === 'PATCH') {
    const u = DEMO_EMPLOYEES.find((x) => x.id === empDetail[1]) || DEMO_EMPLOYEES[0];
    return ok({ ...u, ...body });
  }
  if (empDetail && method === 'DELETE') return ok(null);
  if (path === 'users/my-team/' && method === 'GET') {
    const m = me();
    if (m.role === 'ADMIN' || !m.department_id) return ok(m.role === 'ADMIN' ? DEMO_USERS : [m]);
    return ok(DEMO_USERS.filter((u) => u.department_id === m.department_id));
  }

  // ── Attendance ──
  if (path === 'users/attendance/current/' && method === 'GET') {
    const start = new Date(); start.setHours(9, 2, 0, 0);
    return ok({ start_time: start.toISOString(), status: 'ACTIVE' });
  }
  if (path === 'users/attendance/start/' && method === 'POST') return ok({ message: 'Attendance session started.' });
  if (path === 'users/attendance/end/' && method === 'POST') return ok({ message: 'Attendance session ended.' });
  if (path === 'users/activity-heatmap/' && method === 'GET') return ok(DEMO_HEATMAP);

  // ── Departments ──
  if (path === 'departments/' && method === 'GET') return ok(DEMO_DEPARTMENT_LIST);
  if (path === 'departments/' && method === 'POST') return ok({ id: `d${Date.now()}`, name: body.name }, 201);
  const deptDetail = path.match(/^departments\/([^/]+)\/$/);
  if (deptDetail && method === 'GET') return ok(demoDepartmentDetail(deptDetail[1]));
  if (deptDetail && method === 'PUT') return ok({ id: deptDetail[1], name: body.name });

  // ── Tasks (flat list) ──
  if (path === 'tasks/' && method === 'GET') return ok(DEMO_TASKS);
  if (path === 'tasks/' && method === 'POST') {
    return ok({ id: `p1:new${Date.now()}`, title: body.title || 'New task', description: body.description || '', status: body.status || 'TODO', employees: [], project_id: body.project_id || 'p1', project_name: 'Chronos Glass UI', is_project_task: true, deadline: body.deadline || null, rejection_reason: '', refusal_pending: false, refused_by: null }, 201);
  }
  const taskStatus = path.match(/^tasks\/(.+)\/status\/$/);
  if (taskStatus && method === 'PATCH') {
    const t = DEMO_TASKS.find((x) => x.id === taskStatus[1]);
    return ok(t ? { ...t, status: body.status ?? t.status } : { id: taskStatus[1], status: body.status });
  }
  const taskDetail = path.match(/^tasks\/([^/]+)\/$/);
  if (taskDetail && method === 'PUT') return ok({ ...body, id: taskDetail[1] });

  // ── Projects ──
  if (path === 'projects/' && method === 'GET') return ok(DEMO_PROJECTS);
  if (path === 'projects/my/' && method === 'GET') {
    const m = me();
    return ok(DEMO_PROJECTS.filter((p) => p.employees.some((e: any) => e.id === m.id)));
  }
  if (path === 'projects/' && method === 'POST') {
    return ok({ ...DEMO_PROJECTS[0], ...body, id: `p${Date.now()}`, tasks: [] }, 201);
  }
  const projTaskStatus = path.match(/^projects\/([^/]+)\/tasks\/([^/]+)\/status\/$/);
  if (projTaskStatus && method === 'PATCH') {
    const p = DEMO_PROJECTS.find((x) => x.id === projTaskStatus[1]);
    const t = p?.tasks.find((x: any) => x.id === projTaskStatus[2]);
    return ok(t ? { ...t, status: body.status ?? t.status } : { status: body.status });
  }
  const projDetail = path.match(/^projects\/([^/]+)\/$/);
  if (projDetail && method === 'PUT') {
    const p = DEMO_PROJECTS.find((x) => x.id === projDetail[1]) || DEMO_PROJECTS[0];
    return ok({ ...p, ...body });
  }
  if (projDetail && method === 'DELETE') return ok(null);

  // ── Meetings ──
  if (path === 'meetings/' && method === 'GET') return ok(DEMO_MEETINGS);
  if (path === 'meetings/create/' && method === 'POST') return ok({ message: 'Meeting created successfully.', id: `m${Date.now()}` }, 201);
  const meetingStatus = path.match(/^meetings\/([^/]+)\/status\/$/);
  if (meetingStatus && method === 'PATCH') return ok({ message: 'Status updated.', status: body.status });

  // ── Messages ──
  if (path.startsWith('messages/') && method === 'GET') {
    const m = req.url.match(/with_user=([^&]+)/);
    return ok(demoThread(me().id, m ? decodeURIComponent(m[1]) : 'u2'));
  }
  if (path === 'messages/' && method === 'POST') {
    return ok({ id: `msg-${Date.now()}`, sender: me().id, receiver: body.receiver, text: body.text, timestamp: new Date().toISOString(), is_read: false }, 201);
  }

  // ── Fallback: never let a demo call hit the network ──
  return ok(method === 'GET' ? [] : {});
};
