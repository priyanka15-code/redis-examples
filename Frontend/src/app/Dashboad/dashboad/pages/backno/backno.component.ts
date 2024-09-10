/* import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoginService } from 'src/app/login.service';

@Component({
  selector: 'app-backno',
  templateUrl: `./backno.component.html`,
  styleUrls: ['./backno.component.css']
})
export class BacknoComponent implements OnInit {
  title: string = '';
  completed: boolean = false;
  taskId: string | null = null;
  undoAvailable: boolean = false;
  error: string | null = null;
  constructor(private http: HttpClient, private api: LoginService,) { }

  ngOnInit(): void {
  }

  // Function to create a new task
  createTask() {
    const task = {
      title: this.title,
      completed: this.completed,
    };

    this.api.createTask(task).subscribe(
      (response) => {
        if (response.error) {
          this.error = response.error;
          this.undoAvailable = response.undoAvailable;
          this.taskId = response.taskId;
          console.log(this.error);
        } else {
          this.taskId = response.taskId;
        this.undoAvailable = true;
           this.error = null;
          console.log('Task created successfully!');
          if (this.taskId !== null) {
            sessionStorage.setItem('taskId', this.taskId);
          }
        }
      },
      (error) => {
        this.error = 'Failed to create task';
        this.undoAvailable = true;
        console.log(error);
      }
    );
  }

  undoTask() {
    if (!this.undoAvailable) return;

    const taskId = sessionStorage.getItem('taskId');
    if (taskId !== null) {
      this.api.undoTask().subscribe(
        (response) => {
          this.undoAvailable = true; 
          this.taskId = null;
          this.error = null;
          sessionStorage.removeItem('taskId');
          console.log(response);
          
        },
        (error) => {
          this.error = 'Failed to undo task';
          console.log(error);
        }
      );
    } else {
      console.error('No task to undo');
    }
  }
} */
  import { Component, OnInit } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { LoginService } from 'src/app/login.service';
  
  @Component({
    selector: 'app-backno',
    templateUrl: `./backno.component.html`,
    styleUrls: ['./backno.component.css']
  })
  export class BacknoComponent implements OnInit {
    title: string = '';
    completed: boolean = false;
    undoAvailable: boolean = false;
    error: string | null = null;
    taskIds: string[] = [];  // Array to store multiple task IDs
  
    constructor(private http: HttpClient, private api: LoginService) { }
  
    ngOnInit(): void {
      const savedTaskIds = sessionStorage.getItem('taskIds');
      if (savedTaskIds) {
        this.taskIds = JSON.parse(savedTaskIds);
        this.undoAvailable = this.taskIds.length > 0;
      }
    }
  
    // Function to create a new task
    createTask() {
      const task = {
        title: this.title,
        completed: this.completed,
      };
  
      this.api.createTask(task).subscribe(
        (response) => {
          if (response.error) {
            this.error = response.error;
            this.undoAvailable = true;
            console.log(this.error);
          } else {
            const taskId = response.taskId;
            if (taskId) {
              this.taskIds.push(taskId);
              sessionStorage.setItem('taskIds', JSON.stringify(this.taskIds));  // Save task IDs
              this.undoAvailable = true;
              this.error = null;
              console.log('Task created successfully!');
            }
          }
        },
        (error) => {
          this.error = 'Failed to create task';
          this.undoAvailable = true;
          console.log(error);
        }
      );
    }
  
    // Function to undo the most recent task
    undoLastTask() {
      if (!this.undoAvailable || this.taskIds.length === 0) return;
    
      const lastTaskId = this.taskIds.pop();  // Remove the last task from the list
      if (lastTaskId) {
        this.api.undoTask(lastTaskId).subscribe(
          (response) => {
            this.error = null;
            sessionStorage.setItem('taskIds', JSON.stringify(this.taskIds));  // Update task IDs
            this.undoAvailable = this.taskIds.length > 0;
            console.log('Task undone successfully!', response);
          },
          (error) => {
            this.error = 'Failed to undo task';
            console.log(error);
          }
        );
      }
    }
    
  
    // Function to undo all tasks
    undoAllTasks() {
      if (!this.undoAvailable || this.taskIds.length === 0) return;
  
      // Loop through all task IDs and undo them
      this.taskIds.forEach((taskId) => {
        this.api.undoTask(taskId).subscribe(
          (response) => {
            console.log(`Task ${taskId} undone successfully!`, response);
          },
          (error) => {
            console.error(`Failed to undo task ${taskId}`, error);
          }
        );
      });
  
      // Clear the task ID list after undoing
      this.taskIds = [];
      sessionStorage.removeItem('taskIds');
      this.undoAvailable = false;
    }
  }
  