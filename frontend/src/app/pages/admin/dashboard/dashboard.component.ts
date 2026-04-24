import { Component, OnInit, ChangeDetectorRef, NgZone, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats = { employees: 0, projects: 0, departments: 0, tasks: 0, completedProjects: 0, activeProjects: 0 };
  projects: any[] = [];
  recentTasks: any[] = [];
  teamPerformance: any[] = [];
  user: any = null;
  loading = true;
  today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  globalStats = { completed: 0, inProgress: 0, pending: 0 };
  overallVelocity = 0;
  weeklyActivity: any[] = [
    { day: 'MON', value: 0 }, { day: 'TUE', value: 0 }, { day: 'WED', value: 0 },
    { day: 'THU', value: 0 }, { day: 'FRI', value: 0 }, { day: 'SAT', value: 0 }, { day: 'SUN', value: 0 }
  ];

  currentDateTime = '';
  private clockInterval: any;

  timerValue = '00:00:00';
  timerRunning = false;
  private refreshInterval: any;

  isLunchBreak = false;
  lunchBreakOver = false;
  lunchSecondsLeft = 3600;
  sessionStartTime: string | null = null;

  // Meeting Modal State
  showMeetingModal = false;
  isSubmittingMeeting = false;
  meetingForm = {
    title: '',
    description: '',
    date: '',
    time: '',
    allDepartments: false,
    selectedDepartments: [] as string[],
    selectedEmployees: [] as string[]
  };
  allDepartments: any[] = [];
  allEmployees: any[] = [];
  filteredEmployees: any[] = [];

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit() {
    this.loadData();
    if (isPlatformBrowser(this.platformId)) {
      this.startLiveClock();
      this.restoreTimerState();
      this.refreshInterval = setInterval(() => {
        this.loadData(true);
      }, 30000);
    }
  }

  ngOnDestroy() {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.clockInterval) clearInterval(this.clockInterval);
  }

  startLiveClock() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.clockInterval) clearInterval(this.clockInterval);

    this.clockInterval = setInterval(() => {
      this.zone.run(() => {
        const nowTs = Date.now();

        // 1. Dashboard Clock
        this.currentDateTime = new Date(nowTs).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        // 2. Work Timer
        if (this.timerRunning && this.sessionStartTime) {
          const startTs = new Date(this.sessionStartTime).getTime();
          let prevSecs = 0;
          if (this.user && this.user.total_work_today) {
            const parts = this.user.total_work_today.split(':');
            if (parts.length === 3) prevSecs = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
          }
          const diff = (nowTs - startTs) + (prevSecs * 1000);
          if (!isNaN(diff)) {
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            this.timerValue = `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
          }
        }

        // 3. Lunch Timer
        if (this.isLunchBreak) {
          const lunchStart = localStorage.getItem('timer_start');
          if (lunchStart) {
            const startTs = parseInt(lunchStart);
            const elapsed = Math.floor((nowTs - startTs) / 1000);
            this.lunchSecondsLeft = Math.max(0, 3600 - elapsed);
            if (this.lunchSecondsLeft > 0) {
              const m = Math.floor(this.lunchSecondsLeft / 60);
              const s = this.lunchSecondsLeft % 60;
              this.timerValue = `LUNCH ${this.pad(m)}:${this.pad(s)}`;
            } else {
              this.lunchBreakOver = true;
              this.timerValue = 'LUNCH OVER';
            }
          }
        }

        // 4. Team Performance
        this.teamPerformance.forEach(m => {
          if (m.isOnline && m.sessionStart) {
            const start = new Date(m.sessionStart).getTime();
            let prev = 0;
            if (m.totalWorkToday) {
              const parts = m.totalWorkToday.split(':');
              if (parts.length === 3) prev = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
            }
            const diff = (nowTs - start) + (prev * 1000);
            const h = Math.floor(diff / 3600000);
            const m_ = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            m.elapsed = `${this.pad(h)}:${this.pad(m_)}:${this.pad(s)}`;
          }
        });

        this.cdr.detectChanges();
      });
    }, 1000);
  }

  private restoreTimerState() {
    const sessionType = localStorage.getItem('timer_mode');
    const startTime = localStorage.getItem('timer_start');
    if (sessionType === 'LUNCH' && startTime) {
      this.isLunchBreak = true;
      this.timerRunning = false;
      const startTs = parseInt(startTime);
      const elapsed = Math.floor((Date.now() - startTs) / 1000);
      this.lunchSecondsLeft = Math.max(0, 3600 - elapsed);
      if (this.lunchSecondsLeft === 0) {
        this.lunchBreakOver = true;
        this.timerValue = 'LUNCH OVER';
      }
    }
  }

  // Meeting Modal Logic
  openMeetingModal() {
    this.showMeetingModal = true;
    this.isSubmittingMeeting = false;
    this.meetingForm = {
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      allDepartments: false,
      selectedDepartments: [],
      selectedEmployees: []
    };
    this.filteredEmployees = [];
  }

  closeMeetingModal() {
    if (this.isSubmittingMeeting) return;
    this.showMeetingModal = false;
  }

  onDepartmentChange() {
    if (this.meetingForm.allDepartments) {
      this.filteredEmployees = [...this.allEmployees];
    } else if (this.meetingForm.selectedDepartments.length > 0) {
      this.filteredEmployees = this.allEmployees.filter(e =>
        this.meetingForm.selectedDepartments.includes(e.department_id)
      );
    } else {
      this.filteredEmployees = [];
    }
    const filteredIds = new Set(this.filteredEmployees.map(e => e.id));
    this.meetingForm.selectedEmployees = this.meetingForm.selectedEmployees.filter(id => filteredIds.has(id));
  }

  toggleDepartment(id: string) {
    const idx = this.meetingForm.selectedDepartments.indexOf(id);
    if (idx > -1) this.meetingForm.selectedDepartments.splice(idx, 1);
    else this.meetingForm.selectedDepartments.push(id);
    this.onDepartmentChange();
  }

  toggleEmployee(id: string) {
    const idx = this.meetingForm.selectedEmployees.indexOf(id);
    if (idx > -1) this.meetingForm.selectedEmployees.splice(idx, 1);
    else this.meetingForm.selectedEmployees.push(id);
  }

  submitMeeting() {
    const title = (this.meetingForm.title || '').trim();
    const date = (this.meetingForm.date || '').trim();
    const time = (this.meetingForm.time || '').trim();
    if (!title || !date || !time) { alert('Please fill in all fields.'); return; }
    this.isSubmittingMeeting = true;
    const meetingData = {
      title,
      description: (this.meetingForm.description || '').trim(),
      date_time: `${date}T${time}:00Z`,
      departments: this.meetingForm.allDepartments ? this.allDepartments.map(d => d.id) : this.meetingForm.selectedDepartments,
      employees: this.meetingForm.selectedEmployees
    };
    this.api.createMeeting(meetingData).subscribe({
      next: () => {
        this.isSubmittingMeeting = false;
        this.showMeetingModal = false;
        this.loadData();
        alert('Meeting scheduled!');
      },
      error: () => { this.isSubmittingMeeting = false; alert('Failed to schedule meeting.'); }
    });
  }

  loadData(isRefresh = false) {
    if (!isPlatformBrowser(this.platformId)) return;

    if (!isRefresh) {
      this.loading = true;
      this.cdr.detectChanges();
    }

    this.api.getProjects().subscribe({
      next: (r: any) => {
        this.projects = r;
        this.stats.projects = r.length;
        const allTasks: any[] = [];
        let doneProjects = 0;
        let activeProjects = 0;
        r.forEach((p: any) => {
          if (p.tasks) allTasks.push(...p.tasks);
          const prog = this.getProjectProgress(p);
          if (prog === 100 && p.tasks && p.tasks.length > 0) doneProjects++;
          else activeProjects++;
        });
        this.stats.completedProjects = doneProjects;
        this.stats.activeProjects = activeProjects;
        this.recentTasks = allTasks.slice(0, 6);
        this.stats.tasks = allTasks.filter((t: any) => t.status !== 'DONE').length;
        const comp = allTasks.filter(t => t.status === 'DONE').length;
        const prog = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
        const todo = allTasks.filter(t => t.status === 'TODO').length;
        if (allTasks.length > 0) {
          this.globalStats = { completed: comp, inProgress: prog, pending: todo };
          this.overallVelocity = Math.round((comp / allTasks.length) * 100);
        }
        this.updateWeeklyActivity(allTasks);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loading = false; this.cdr.detectChanges(); }
    });

    this.api.getEmployees().subscribe({
      next: (r: any) => {
        this.allEmployees = r;
        this.stats.employees = r.length;
        this.teamPerformance = r.slice(0, 4).map((e: any) => ({
          name: e.username,
          role: e.department_name || 'Team Member',
          status: e.is_online ? 'ONLINE' : 'OFFLINE',
          photo: e.profile_photo || null,
          isOnline: e.is_online,
          sessionStart: e.current_session_start,
          totalWorkToday: e.total_work_today,
          elapsed: e.is_online ? '00:00:00' : e.total_work_today,
          lastTask: e.last_task ? e.last_task.title : null,
          taskStatus: e.last_task ? e.last_task.status : 'TODO'
        }));
        this.cdr.detectChanges();
      }
    });

    if (!isRefresh) {
      this.api.getMe().subscribe(r => { this.user = r; this.cdr.detectChanges(); });
      this.api.getCurrentAttendance().subscribe(session => {
        if (session && session.start_time) {
          this.timerRunning = true;
          this.sessionStartTime = session.start_time;
        } else {
          this.timerRunning = false;
          if (!this.isLunchBreak) this.timerValue = '00:00:00';
        }
        this.cdr.detectChanges();
      });
      this.api.getDepartments().subscribe(r => { this.allDepartments = r; this.stats.departments = r.length; this.cdr.detectChanges(); });
    }
  }

  getProjectProgress(p: any): number {
    if (!p || !p.tasks || p.tasks.length === 0) return 0;
    const done = p.tasks.filter((t: any) => t.status === 'DONE').length;
    return Math.round((done / p.tasks.length) * 100);
  }

  updateWeeklyActivity(allTasks: any[]) {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const now = new Date();
    const activityMap: { [key: string]: number } = { 'MON': 0, 'TUE': 0, 'WED': 0, 'THU': 0, 'FRI': 0, 'SAT': 0, 'SUN': 0 };
    const monday = new Date(now);
    monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
    monday.setHours(0, 0, 0, 0);
    allTasks.forEach(t => {
      if (t.status === 'DONE' && t.completed_at) {
        const compDate = new Date(t.completed_at);
        if (compDate >= monday) { activityMap[days[compDate.getDay()]] += 20; }
      }
    });
    this.weeklyActivity = Object.keys(activityMap).map(d => ({ day: d, value: Math.min(activityMap[d], 100) }));
  }

  // Timer Actions
  startTimer(startTime: string) {
    this.sessionStartTime = startTime;
    this.timerRunning = true;
  }

  toggleTimer() {
    if (this.isLunchBreak) {
      this.isLunchBreak = false;
      this.lunchBreakOver = false;
      localStorage.removeItem('timer_mode');
      localStorage.removeItem('timer_start');
      this.timerValue = '00:00:00';
    }
    if (this.timerRunning) {
      this.api.endAttendance().subscribe(() => {
        this.timerRunning = false;
        this.sessionStartTime = null;
        this.timerValue = '00:00:00';
        this.loadData();
      });
    } else {
      this.api.startAttendance().subscribe(() => {
        this.timerRunning = true;
        this.sessionStartTime = new Date().toISOString();
        this.loadData();
      });
    }
  }

  startLunchBreak() {
    if (this.isLunchBreak) return;
    if (this.timerRunning) {
      this.api.endAttendance().subscribe(() => {
        const startTs = Date.now();
        localStorage.setItem('timer_mode', 'LUNCH');
        localStorage.setItem('timer_start', startTs.toString());
        this.timerRunning = false;
        this.isLunchBreak = true;
        this.loadData();
      });
    } else {
      const startTs = Date.now();
      localStorage.setItem('timer_mode', 'LUNCH');
      localStorage.setItem('timer_start', startTs.toString());
      this.isLunchBreak = true;
    }
  }

  pad(n: number): string { return n < 10 ? '0' + n : '' + n; }

  getInitials(name: string): string {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
  }
}
