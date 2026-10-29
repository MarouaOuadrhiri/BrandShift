// ─────────────────────────────────────────────────────────────
// BrandShift DEMO data — baked-in fake dataset (frontend-only mode).
// Shapes mirror the Django API serializers exactly.
// ─────────────────────────────────────────────────────────────

const dayMs = 24 * 60 * 60 * 1000;
const iso = (d: Date) => d.toISOString();
const daysFromNow = (n: number, hour = 12, min = 0) => {
  const d = new Date(Date.now() + n * dayMs);
  d.setHours(hour, min, 0, 0);
  return d;
};

// ── Departments (from seed_data.py) ──────────────────────────
export const DEMO_DEPARTMENTS = [
  { id: 'd1', name: 'Engineering', subtitle: 'Software & Hardware', description: 'Building the future of BrandShift through code and innovation.', icon: 'code', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800' },
  { id: 'd2', name: 'Marketing', subtitle: 'Growth & Presence', description: 'Spreading the word and growing our user base globally.', icon: 'megaphone', image: 'https://images.unsplash.com/photo-1533750516457-a7f992034fce?auto=format&fit=crop&w=800' },
  { id: 'd3', name: 'Design', subtitle: 'Visuals & UX', description: 'Crafting beautiful and intuitive experiences for our users.', icon: 'palette', image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800' },
  { id: 'd4', name: 'Human Resources', subtitle: 'People & Talent', description: 'Finding and nurturing the best talent in the industry.', icon: 'users', image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800' },
  { id: 'd5', name: 'Finance', subtitle: 'Strategy & Numbers', description: 'Managing our resources to ensure long-term stability.', icon: 'chart-bar', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800' },
];

// Department list metrics (as returned by GET /departments/)
export const DEMO_DEPARTMENT_LIST = [
  { ...DEMO_DEPARTMENTS[0], employees_count: 2, active_tasks_count: 3, efficiency: 82, status: 'STABLE' },
  { ...DEMO_DEPARTMENTS[1], employees_count: 2, active_tasks_count: 5, efficiency: 76, status: 'STABLE' },
  { ...DEMO_DEPARTMENTS[2], employees_count: 2, active_tasks_count: 4, efficiency: 91, status: 'OPTIMAL' },
  { ...DEMO_DEPARTMENTS[3], employees_count: 2, active_tasks_count: 2, efficiency: 88, status: 'STABLE' },
  { ...DEMO_DEPARTMENTS[4], employees_count: 2, active_tasks_count: 1, efficiency: 95, status: 'OPTIMAL' },
];

// ── Users (from seed_data.py) ────────────────────────────────
const ALL_SKILLS = ['Visual Architecture', 'Design Systems', 'Creative Strategy', '3D Motion', 'UX Research', 'Prototyping', 'Frontend', 'Backend', 'DevOps', 'Management'];

interface RawUser { id: string; first: string; last: string; dept: number; tenure: string; online: boolean; work: string; points: number; eff: number; load: number; hours: number; active: number; progress: number; }

const RAW_USERS: RawUser[] = [
  { id: 'u1', first: 'Alice', last: 'Vance', dept: 0, tenure: '1.8 Years', online: true, work: '05:12:40', points: 180, eff: 86, load: 50, hours: 36.5, active: 4, progress: 67 },
  { id: 'u2', first: 'Bob', last: 'Ross', dept: 1, tenure: '2.1 Years', online: true, work: '04:47:05', points: 150, eff: 78, load: 62, hours: 33.0, active: 5, progress: 58 },
  { id: 'u3', first: 'Charlie', last: 'Sheen', dept: 2, tenure: '11 Months', online: false, work: '03:58:31', points: 120, eff: 74, load: 38, hours: 29.5, active: 3, progress: 62 },
  { id: 'u4', first: 'Diana', last: 'Prince', dept: 3, tenure: '1.4 Years', online: true, work: '05:30:12', points: 165, eff: 83, load: 45, hours: 35.0, active: 4, progress: 71 },
  { id: 'u5', first: 'Edward', last: 'Norton', dept: 4, tenure: '8 Months', online: false, work: '02:41:56', points: 90, eff: 69, load: 30, hours: 26.0, active: 2, progress: 55 },
  { id: 'u6', first: 'Fiona', last: 'Apple', dept: 0, tenure: '1.1 Years', online: true, work: '04:22:18', points: 135, eff: 80, load: 55, hours: 31.5, active: 4, progress: 64 },
  { id: 'u7', first: 'George', last: 'Clooney', dept: 1, tenure: '2.4 Years', online: true, work: '05:05:47', points: 195, eff: 88, load: 48, hours: 37.0, active: 4, progress: 73 },
  { id: 'u8', first: 'Hannah', last: 'Baker', dept: 2, tenure: '9 Months', online: false, work: '03:15:29', points: 105, eff: 72, load: 35, hours: 28.0, active: 3, progress: 60 },
  { id: 'u9', first: 'Ian', last: 'Somerhalder', dept: 3, tenure: '1.6 Years', online: true, work: '04:51:33', points: 155, eff: 81, load: 52, hours: 34.5, active: 4, progress: 66 },
  { id: 'u10', first: 'Julia', last: 'Roberts', dept: 4, tenure: '2.0 Years', online: true, work: '05:19:08', points: 175, eff: 85, load: 44, hours: 36.0, active: 3, progress: 70 },
];

function skillsFor(i: number): string[] {
  return [ALL_SKILLS[i % 10], ALL_SKILLS[(i + 3) % 10], ALL_SKILLS[(i + 5) % 10], ALL_SKILLS[(i + 7) % 10]];
}

// Mirrors serialize_user() in users/views.py
export function serializeDemoUser(u: RawUser, i: number): any {
  const dept = DEMO_DEPARTMENTS[u.dept];
  return {
    id: u.id,
    email: `${u.first.toLowerCase()}@brandshift.com`,
    first_name: u.first,
    last_name: u.last,
    role: 'EMPLOYEE',
    profile_photo: `https://i.pravatar.cc/150?u=${u.first}`,
    bio: `Dedicated member of the ${dept.name} team at BrandShift.`,
    skills: skillsFor(i),
    is_online: u.online,
    current_session_start: u.online ? iso(daysFromNow(0, 9, 2)) : null,
    total_work_today: u.work,
    preferences: { theme: 'dark', notifications: true },
    stats: {
      tenure: u.tenure,
      ongoing_projects_count: 2,
      global_points: u.points,
      efficiency: u.eff,
      feedback: 4.9,
      sprint_load: u.load,
      weekly_hours: u.hours,
      lead_time: 1.4,
      milestones: [
        { date: daysFromNow(1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), title: 'Core development', project: 'Project: Active', current: true },
        { date: daysFromNow(4).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), title: 'Unit testing', project: 'Project: Active', current: false },
        { date: daysFromNow(8).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), title: 'UAT', project: 'Project: Active', current: false },
      ],
      portfolio: [
        { image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=300' },
        { image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=300' },
      ],
    },
    department_id: dept.id,
    department_name: dept.name,
  };
}

export const DEMO_USERS: any[] = RAW_USERS.map((u, i) => serializeDemoUser(u, i));

// Employees list adds workload fields (employee_list_create)
export const DEMO_EMPLOYEES: any[] = DEMO_USERS.map((u, i) => ({
  ...u,
  workload_progress: RAW_USERS[i].progress,
  workload_status: RAW_USERS[i].active === 0 ? 'Available' : RAW_USERS[i].active <= 5 ? 'Busy' : 'At Capacity',
  active_tasks: RAW_USERS[i].active,
}));

export const ADMIN_USER: any = {
  id: 'u0',
  email: 'admin@brandshift.com',
  first_name: 'Maroua',
  last_name: 'Ouadrhiri',
  role: 'ADMIN',
  profile_photo: 'https://i.pravatar.cc/150?u=Maroua',
  bio: 'BrandShift workspace administrator.',
  skills: ['Management', 'Creative Strategy', 'Design Systems', 'Frontend'],
  is_online: true,
  current_session_start: iso(daysFromNow(0, 8, 45)),
  total_work_today: '06:03:21',
  preferences: { theme: 'dark', notifications: true },
  stats: {
    tenure: '2.6 Years',
    ongoing_projects_count: 3,
    global_points: 240,
    efficiency: 92,
    feedback: 4.9,
    sprint_load: 40,
    weekly_hours: 38.0,
    lead_time: 1.4,
    milestones: [
      { date: daysFromNow(1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), title: 'Sprint Planning', project: 'Project: Active', current: true },
    ],
    portfolio: [{ image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=300' }],
  },
};

// ── Projects (from seed_data.py, deterministic assignment) ──
const TASK_TEMPLATES = ['Research phase', 'Wireframe design', 'Core development', 'Unit testing', 'UAT', 'Final Deployment'];

interface RawProject {
  id: string; name: string; client: string; description: string; owner: string;
  status: string; priority: string; high: boolean; budget: string; duration: string;
  tags: string[]; dept: number; members: number[]; startOff: number; deadlineOff: number;
  taskStatuses: string[];
}

const RAW_PROJECTS: RawProject[] = [
  { id: 'p1', name: 'Chronos Glass UI', client: 'Internal', description: 'Modernizing the entire BrandShift interface with glassmorphism and high-fidelity animations.', owner: 'Maroua Ouadrhiri', status: 'In Progress', priority: 'URGENT', high: true, budget: '$50,000', duration: '3 months', tags: ['UI/UX', 'Frontend', 'Design System'], dept: 2, members: [0, 2, 3, 5], startOff: -10, deadlineOff: 45, taskStatuses: ['DONE', 'DONE', 'IN_PROGRESS', 'REVIEW', 'TODO', 'TODO'] },
  { id: 'p2', name: 'Global Expansion Strategy', client: 'Strategy Group', description: 'Planning and executing the market entry for the APAC region.', owner: 'John Smith', status: 'Pending', priority: 'HIGH', high: true, budget: '$120,000', duration: '6 months', tags: ['Marketing', 'Strategy', 'Global'], dept: 1, members: [1, 6, 7, 9], startOff: 0, deadlineOff: 75, taskStatuses: ['DONE', 'IN_PROGRESS', 'TODO', 'TODO', 'TODO', 'BLOCKED'] },
  { id: 'p3', name: 'Alpha Engine Refactor', client: 'Engineering', description: 'Backend optimization and migration to a high-concurrency architecture.', owner: 'Alice Vance', status: 'In Progress', priority: 'MEDIUM', high: false, budget: '$30,000', duration: '2 months', tags: ['Backend', 'Performance', 'Cloud'], dept: 0, members: [0, 4, 5, 8], startOff: -5, deadlineOff: 60, taskStatuses: ['DONE', 'DONE', 'DONE', 'IN_PROGRESS', 'REVIEW', 'TODO'] },
];

const userName = (i: number) => `${RAW_USERS[i].first} ${RAW_USERS[i].last}`;
const userPhoto = (i: number) => `https://i.pravatar.cc/150?u=${RAW_USERS[i].first}`;

// Mirrors serialize_project() in projects/views.py
export const DEMO_PROJECTS: any[] = RAW_PROJECTS.map((p) => {
  const deadline = daysFromNow(p.deadlineOff, 18, 0);
  return {
    id: p.id,
    name: p.name,
    client: p.client,
    description: p.description,
    owner: p.owner,
    status: p.status,
    priority: p.priority,
    is_high_priority: p.high,
    isPriority: p.high,
    budget: p.budget,
    duration: p.duration,
    tags: p.tags,
    department_id: DEMO_DEPARTMENTS[p.dept].id,
    department_name: DEMO_DEPARTMENTS[p.dept].name,
    employees: p.members.map((m) => ({ id: RAW_USERS[m].id, name: userName(m), profile_photo: userPhoto(m) })),
    start_date: iso(daysFromNow(p.startOff, 9, 0)),
    deadline: iso(deadline),
    tasks: TASK_TEMPLATES.map((title, ti) => {
      const assignee = p.members[ti % p.members.length];
      const st = p.taskStatuses[ti];
      return {
        id: `${p.id}t${ti + 1}`,
        title,
        description: `Project-specific task for ${p.name}.`,
        note: '',
        status: st,
        deadline: iso(new Date(deadline.getTime() - (6 - ti) * 2 * dayMs)),
        assigned_to: RAW_USERS[assignee].id,
        assigned_to_name: userName(assignee),
        completed_by_name: st === 'DONE' ? userName(assignee) : null,
        completed_at: st === 'DONE' ? iso(daysFromNow(-2, 15, 30)) : null,
        rejection_reason: '',
        refusal_pending: false,
        refused_by: null,
        refused_by_name: null,
        is_archived: false,
      };
    }),
  };
});

// Mirrors serialize_project_task() — the flat GET /tasks/ list
export const DEMO_TASKS: any[] = DEMO_PROJECTS.flatMap((p) =>
  p.tasks.map((t: any) => ({
    id: `${p.id}:${t.id}`,
    title: t.title,
    description: t.description,
    status: t.status,
    employees: [{ id: t.assigned_to, name: t.assigned_to_name, photo: userPhoto(RAW_USERS.findIndex((u) => u.id === t.assigned_to)) }],
    project_id: p.id,
    project_name: p.name,
    is_project_task: true,
    deadline: t.deadline ? t.deadline.slice(0, 10) : null,
    rejection_reason: '',
    refusal_pending: false,
    refused_by: null,
  }))
);

// ── Meetings (from seed_data.py) ─────────────────────────────
export const DEMO_MEETINGS: any[] = [
  { title: 'Sprint Planning', creator: 0, dept: 0, members: [0, 5, 8], off: 1, hour: 10 },
  { title: 'Client Feedback', creator: 1, dept: 1, members: [1, 6, 9], off: 2, hour: 14 },
  { title: 'Team Sync', creator: 2, dept: 2, members: [2, 7, 0], off: 3, hour: 9 },
  { title: 'Design Critique', creator: 3, dept: 3, members: [3, 8, 2], off: 4, hour: 15 },
  { title: 'Post-Mortem Analysis', creator: 4, dept: 4, members: [4, 9, 1], off: 5, hour: 11 },
].map((m, i) => ({
  id: `m${i + 1}`,
  title: m.title,
  description: `Weekly sync regarding ${m.title}.`,
  date_time: daysFromNow(m.off, m.hour, 0).toISOString().replace(/\.\d{3}Z$/, 'Z'),
  departments: [{ id: DEMO_DEPARTMENTS[m.dept].id, name: DEMO_DEPARTMENTS[m.dept].name }],
  employees: m.members.map((x) => ({ id: RAW_USERS[x].id, name: userName(x) })),
  created_by: userName(m.creator),
  status: 'TODO',
}));

// ── Messages ─────────────────────────────────────────────────
const THREAD_TEXTS = [
  'Hey, did you finish the design?',
  'Yes, just uploaded it.',
  'Great work!',
  'Can you check the API docs?',
  'Sure, will do it in 5 mins.',
  'Thanks!',
  'Are we still on for the meeting?',
  'Yes, see you there.',
];

export function demoThread(meId: string, otherId: string): any[] {
  const now = Date.now();
  return THREAD_TEXTS.map((text, i) => ({
    id: `msg-${otherId}-${i}`,
    sender: i % 2 === 0 ? otherId : meId,
    receiver: i % 2 === 0 ? meId : otherId,
    text,
    timestamp: new Date(now - (THREAD_TEXTS.length - i) * 37 * 60 * 1000).toISOString(),
    is_read: true,
  }));
}

// ── Misc endpoints ───────────────────────────────────────────
export const DEMO_HEATMAP = {
  hourly: [0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 2, 2, 3, 3, 2, 1, 1, 0, 0, 0, 0, 0, 0],
  raw: [0, 0, 0, 0, 0, 0, 0, 1, 3, 5, 6, 4, 4, 6, 5, 3, 2, 1, 0, 0, 0, 0, 0, 0],
};

export const DEMO_SESSIONS: any[] = [
  { id: 'sess1', device_info: 'Chrome on Windows', ip_address: '105.67.12.44', created_at: iso(daysFromNow(0, 8, 45)), is_current: true },
  { id: 'sess2', device_info: 'Safari on iPhone', ip_address: '105.67.12.44', created_at: iso(daysFromNow(-1, 21, 15)), is_current: false },
];

export function demoAttendanceLogs(userId: string): any[] {
  return [0, -1, -2].map((off, i) => ({
    id: `att-${userId}-${i}`,
    start_time: iso(daysFromNow(off, 9, 0)),
    end_time: iso(daysFromNow(off, 17, 30)),
    status: 'COMPLETED',
    duration: '8:30:00',
  }));
}

// Employee history (projects summary for one employee)
export function demoEmployeeHistory(userId: string): any[] {
  return DEMO_PROJECTS
    .filter((p) => p.employees.some((e: any) => e.id === userId))
    .map((p) => {
      const mine = p.tasks.filter((t: any) => t.assigned_to === userId);
      const done = mine.filter((t: any) => t.status === 'DONE').length;
      const progress = mine.length ? Math.round((done / mine.length) * 1000) / 10 : 0;
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        progress,
        status: progress === 100 && mine.length > 0 ? 'DONE' : progress > 0 ? 'IN_PROGRESS' : 'TODO',
        start_date: p.start_date,
        deadline: p.deadline,
        tasks: mine.map((t: any) => ({ id: t.id, title: t.title, status: t.status, deadline: t.deadline })),
      };
    });
}

// Department detail (GET /departments/:id/)
export function demoDepartmentDetail(id: string): any {
  const dept = DEMO_DEPARTMENTS.find((d) => d.id === id) || DEMO_DEPARTMENTS[0];
  const employees = DEMO_USERS.filter((u) => u.department_id === dept.id).map((u) => ({
    id: u.id, first_name: u.first_name, last_name: u.last_name, email: u.email, role: u.role, profile_photo: u.profile_photo,
  }));
  const projects = DEMO_PROJECTS.filter((p) => p.department_id === dept.id).map((p) => {
    const total = p.tasks.length;
    const done = p.tasks.filter((t: any) => t.status === 'DONE').length;
    const progress = total ? Math.round((done / total) * 1000) / 10 : 0;
    return {
      id: p.id, name: p.name, description: p.description, progress,
      tasks_count: total, done_tasks_count: done,
      status: progress === 100 && total > 0 ? 'DONE' : progress > 0 ? 'IN_PROGRESS' : 'TODO',
      tasks: p.tasks.map((t: any) => ({ title: t.title, status: t.status, completed_by_name: t.completed_by_name })),
    };
  });
  return { id: dept.id, name: dept.name, description: dept.description, image: dept.image, employees, projects };
}
