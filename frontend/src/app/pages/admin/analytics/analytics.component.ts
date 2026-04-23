import { Component, OnInit, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgApexchartsModule, ChartComponent } from 'ng-apexcharts';
import { ApiService } from '../../../core/api.service';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexStroke,
  ApexTooltip,
  ApexDataLabels,
  ApexFill,
  ApexGrid,
  ApexMarkers
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  fill: ApexFill;
  grid: ApexGrid;
  markers: ApexMarkers;
  colors: string[];
};

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.css'
})
export class AnalyticsComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;
  private platformId = inject(PLATFORM_ID);
  employees: any[] = [];
  tasks: any[] = [];
  projects: any[] = [];
  departments: any[] = [];

  stats = {
    totalEmployees: 0,
    activeTasks: 0,
    completedTasks: 0,
    avgCompletionRate: 0,
    avgCompletionChange: '0%',
    weeklyData: [0, 0, 0, 0, 0, 0],
    departmentStats: [] as any[]
  };

  activePulse: any[] = [];
  performanceHours: number[] = Array(48).fill(0);
  
  topPerformer = {
    name: '---',
    first_name: '',
    last_name: '',
    performance: '0%',
    tasksClosed: 0,
    avgResponse: '--',
    projectsLed: 0,
    photoPath: ''
  };
  
  showProfileModal = false;

  constructor(private api: ApiService) {
    this.chartOptions = {
      series: [
        {
          name: 'Completion Rate',
          data: [0, 0, 0, 0, 0, 0]
        }
      ],
      chart: {
        height: 280,
        type: 'area',
        toolbar: {
          show: false
        },
        animations: {
          enabled: true,
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        },
        background: 'transparent',
        sparkline: {
          enabled: false
        }
      },
      colors: ['#FD0000'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#FD0000']
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.4,
          opacityTo: 0.05,
          stops: [0, 90, 100],
          colorStops: [
            {
              offset: 0,
              color: '#FD0000',
              opacity: 0.4
            },
            {
              offset: 100,
              color: '#FD0000',
              opacity: 0
            }
          ]
        }
      },
      grid: {
        show: true,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
          lines: {
            show: false
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        padding: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 10
        }
      },
      xaxis: {
        categories: ['WK 01', 'WK 02', 'WK 03', 'WK 04', 'WK 05', 'WK 06'],
        axisBorder: {
          show: false
        },
        axisTicks: {
          show: false
        },
        labels: {
          style: {
            colors: '#737373',
            fontSize: '10px',
            fontWeight: 600,
            fontFamily: 'Space Grotesk'
          }
        }
      },
      yaxis: {
        show: false,
        min: 0,
        max: 100
      },
      tooltip: {
        theme: 'dark',
        x: {
          show: true
        },
        marker: {
          show: false
        },
        style: {
          fontSize: '12px',
          fontFamily: 'Space Grotesk'
        }
      }
    };
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  loadData() {
    // Parallel fetch for all core entities
    const subs = {
      emps: this.api.getEmployees(),
      tasks: this.api.getTasks(),
      projs: this.api.getProjects(),
      depts: this.api.getDepartments()
    };

    subs.emps.subscribe({ next: (data: any) => { this.employees = data; this.calculateTopPerformer(); }, error: () => {} });
    subs.tasks.subscribe({ next: (data: any) => { this.tasks = data; this.calculateStats(); }, error: () => {} });
    subs.projs.subscribe({ next: (data: any) => { this.projects = data; this.calculatePulse(); }, error: () => {} });
    subs.depts.subscribe({ next: (data: any) => { this.departments = data; this.calculateDepartmentStats(); }, error: () => {} });
    this.api.getActivityHeatmap().subscribe({ next: (data: any) => { this.loadHeatmap(data); }, error: () => {} });
  }

  calculateStats() {
    if (!this.tasks.length) return;

    this.stats.totalEmployees = this.employees.length;
    this.stats.activeTasks = this.tasks.filter(t => t.status !== 'DONE' && t.status !== 'ARCHIVED').length;
    const completed = this.tasks.filter(t => t.status === 'DONE').length;
    this.stats.completedTasks = completed;
    
    const rate = (completed / this.tasks.length) * 100;
    this.stats.avgCompletionRate = parseFloat(rate.toFixed(1));



    // Mock weekly trend based on current data for visual continuity
    this.stats.weeklyData = [
      Math.max(0, rate - 20),
      Math.max(0, rate - 15),
      Math.max(0, rate - 25),
      Math.max(0, rate - 10),
      Math.max(0, rate - 12.4),
      rate
    ];

    // Update chart series
    this.chartOptions.series = [{
      name: 'Completion Rate',
      data: this.stats.weeklyData
    }];

    // Calculate mock growth (difference between last week and this week)
    const lastVal = this.stats.weeklyData[this.stats.weeklyData.length - 2] || 0;
    const growth = rate - lastVal;
    this.stats.avgCompletionChange = (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%';
  }

  calculateDepartmentStats() {
    if (!this.departments.length) return;
    this.stats.departmentStats = this.departments
      .filter((dept: any) => dept.efficiency !== undefined)
      .map((dept: any) => ({
        name: dept.name,
        percent: Math.round(dept.efficiency)
      }))
      .sort((a: any, b: any) => b.percent - a.percent);
  }

  loadHeatmap(data: any) {
    // Backend returns 24 hourly values (0-3 levels).
    // The grid shows 48 cells so we tile the 24-hour data twice to fill it.
    const hourly: number[] = data.hourly || Array(24).fill(0);
    this.performanceHours = [...hourly, ...hourly];
  }

  calculatePulse() {
    this.activePulse = this.projects.slice(0, 3).map(p => {
      const statusRaw = (p.status || '').toUpperCase().replace(' ', '_');
      let type = 'PENDING';
      if (statusRaw === 'IN_PROGRESS') type = 'IN_PROGRESS';
      if (statusRaw === 'COMPLETED' || statusRaw === 'DONE') type = 'DONE';

      return {
        title: p.name,
        status: p.status || 'Pending',
        type: type,
        deadline: p.deadline 
          ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(p.deadline))
          : 'No deadline',
        icon: p.category === 'TECH' ? 'zap' : (p.category === 'DESIGN' ? 'pen-tool' : 'rocket')
      };
    });
  }

  calculateTopPerformer() {
    if (!this.employees.length || !this.tasks.length) return;

    // Find user with most completed tasks
    const completionsMap = new Map<any, number>();
    this.tasks.filter((t: any) => t.status === 'DONE').forEach((t: any) => {
      if (t.assigned_to) {
        completionsMap.set(t.assigned_to, (completionsMap.get(t.assigned_to) || 0) + 1);
      }
    });

    let bestId: any = null;
    let max = -1;
    completionsMap.forEach((count, id) => {
      if (count > max) { max = count; bestId = id; }
    });

    const topUser = this.employees.find(e => e.id === bestId) || this.employees[0];
    if (topUser) {
      this.topPerformer = {
        name: topUser.full_name || topUser.username,
        first_name: topUser.first_name || '',
        last_name: topUser.last_name || '',
        performance: 'Top Tier',
        tasksClosed: max > 0 ? max : 0,
        avgResponse: 'Fast',
        projectsLed: this.projects.filter(p => p.manager === topUser.id).length,
        photoPath: topUser.profile_image || topUser.profile_photo || ''
      };
    }
  }

  // Helper for dynamic initials
  getTopPerformerInitials(): string {
    if (!this.topPerformer.name || this.topPerformer.name === '---') return 'SA';
    return this.topPerformer.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  toggleProfileModal() {
    this.showProfileModal = !this.showProfileModal;
  }
}
