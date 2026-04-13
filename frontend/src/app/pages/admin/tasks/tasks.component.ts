import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api.service';

@Component({
  selector: 'app-admin-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: any[] = [];
  employees: any[] = [];
  projects: any[] = [];
  departments: any[] = [];
  
  isSubmitting = false;
  errorMsg = '';
  isModalOpen = false;
  viewMode: 'board' | 'list' = 'board';

  // New task form fields
  taskTitle = '';
  taskDesc = '';
  taskEmployeeId = '';
  taskProjectId = '';
  taskDepartmentId = '';
  taskPriority = 'MEDIUM';
  taskStatus = 'IN PROGRESS';
  taskDeadline = '';
  taskProgress = 0;
  assignedMembers: any[] = [];

  editTaskId: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.getTasks().subscribe({ 
      next: (r: any) => { 
        this.tasks = r.map((t: any) => ({
          ...t,
          status: this.mapStatus(t.status),
          priority: t.priority || this.getRandomPriority(), // Mocking if not in backend
          progress: t.progress || Math.floor(Math.random() * 100), // Mocking
          deadline: t.deadline || 'MAY 16' // Mocking
        }));
      }, 
      error: () => {} 
    });
    this.api.getEmployees().subscribe({ next: (r: any) => { this.employees = r; }, error: () => {} });
    this.api.getProjects().subscribe({ next: (r: any) => { this.projects = r; }, error: () => {} });
    this.api.getDepartments().subscribe({ next: (r: any) => { this.departments = r; }, error: () => {} });
  }

  mapStatus(status: string): string {
    const s = status?.toUpperCase();
    if (s === 'TODO' || s === 'BLOCKED') return 'BLOCKED';
    if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') return 'IN PROGRESS';
    if (s === 'REVIEW') return 'REVIEW';
    if (s === 'DONE') return 'DONE';
    return 'IN PROGRESS';
  }

  getRandomPriority() {
    const ps = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    return ps[Math.floor(Math.random() * ps.length)];
  }

  getTasksByStatus(status: string) {
    return this.tasks.filter(t => t.status === status);
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  resetForm() {
    this.taskTitle = '';
    this.taskDesc = '';
    this.taskEmployeeId = '';
    this.taskProjectId = '';
    this.taskDepartmentId = '';
    this.taskPriority = 'MEDIUM';
    this.taskStatus = 'IN PROGRESS';
    this.taskDeadline = '';
    this.taskProgress = 0;
    this.assignedMembers = [];
  }

  createTask() {
    if (!this.taskTitle || !this.taskEmployeeId) { this.errorMsg = 'Please fill all fields.'; return; }
    this.isSubmitting = true;
    
    // We send what the backend supports, but we can include other fields which might be ignored or handled if we update backend later
    const taskData = {
      title: this.taskTitle,
      description: this.taskDesc,
      employee_id: this.taskEmployeeId,
      status: this.taskStatus.replace(' ', '_'), // Backend uses underscores
      priority: this.taskPriority,
      project_id: this.taskProjectId,
      deadline: this.taskDeadline,
      progress: this.taskProgress
    };

    this.api.createTask(taskData).subscribe({
      next: () => { 
        this.isSubmitting = false; 
        this.closeModal();
        this.loadData(); 
      },
      error: (err: any) => { 
        this.errorMsg = err.error?.error || 'Failed to create task.'; 
        this.isSubmitting = false; 
      }
    });
  }

  startEditTask(t: any) { this.editTaskId = t.id; t.editTitle = t.title; t.editDesc = t.description; t.editEmployeeId = t.employee_id; }
  
  saveEditTask(t: any) {
    this.api.updateTask(t.id, { title: t.editTitle, description: t.editDesc, employee_id: t.editEmployeeId }).subscribe({
      next: () => { this.editTaskId = null; this.loadData(); },
      error: (err: any) => { this.errorMsg = err.error?.error || 'Failed to update task.'; }
    });
  }
}
