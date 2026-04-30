import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/api.service';

@Component({
  selector: 'app-employee-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  user: any = null;

  // Notification preferences
  emailNotifications = true;
  pushNotifications = true;
  taskReminders = true;
  meetingAlerts = true;
  projectUpdates = false;

  // Appearance
  darkMode = true;
  compactView = false;

  // Privacy
  showOnlineStatus = true;
  showEmail = false;

  saved = false;

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getMe().subscribe({
      next: (r: any) => {
        this.user = r;
        if (r.preferences) {
          this.emailNotifications = r.preferences.email_notifications ?? true;
          this.pushNotifications = r.preferences.push_notifications ?? true;
          this.taskReminders = r.preferences.task_reminders ?? true;
          this.meetingAlerts = r.preferences.meeting_alerts ?? true;
          this.projectUpdates = r.preferences.project_updates ?? false;
        }
      },
      error: () => {}
    });
  }

  saveSettings() {
    this.saved = true;
    setTimeout(() => this.saved = false, 2500);
  }
}
