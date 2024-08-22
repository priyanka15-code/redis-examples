import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-backno',
  templateUrl: `./backno.component.html`,
  styleUrls: ['./backno.component.css']
})
export class BacknoComponent implements OnInit {
  task: any = [];
  taskId: string = '';
  error: string = '';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  createTask(): void {
    this.http.post('http://localhost:3000/api/test/tasks', this.task)
      .subscribe((response: any) => {
        this.taskId = response.taskId;
      }, (error: any) => {
        this.error = error.error;
      });
  }

  undoTask(): void {
    this.http.post('http://localhost:3000/api/tasks/undo', {})
      .subscribe((response: any) => {
        /* this.taskId = null; */
      }, (error: any) => {
        this.error = error.error;
      });
  }

  confirmTask(): void {
    this.http.post('http://localhost:3000/api/tasks/confirm', {})
      .subscribe((response: any) => {
       /*  this.taskId = null; */
      }, (error: any) => {
        this.error = error.error;
      });
  }
}