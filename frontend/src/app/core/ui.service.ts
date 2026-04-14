import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private openProjectModalSource = new Subject<{ project: any | null, mode: 'edit' | 'view' }>();
  openProjectModal$ = this.openProjectModalSource.asObservable();
  
  private projectEditedSource = new Subject<void>();
  projectEdited$ = this.projectEditedSource.asObservable();
 
  triggerOpenProjectModal(project: any = null, mode: 'edit' | 'view' = 'edit') {
    this.openProjectModalSource.next({ project, mode });
  }

  notifyProjectChanged() {
    this.projectEditedSource.next();
  }
}
