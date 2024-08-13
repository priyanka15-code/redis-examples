import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.css']
})
export class ModelComponent {
  @Input() isOpen = false;
  @Input() businessIds: any[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() submitFormEvent = new EventEmitter<any>();

  form = {
    username: 'abcd',
    password: '1234',
    email: 'abcd@gmail.com',
    businessName: '',
    userId: '00213'
  };

  close() {
    this.closeModal.emit();
  }


submitForm() {
    console.log('Form Data:', this.form); 
    this.submitFormEvent.emit(this.form);
    this.close();
  }
  
}
