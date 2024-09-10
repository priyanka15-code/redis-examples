import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';

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
    username: 'xyz',
    password: '1234',
    email: 'xyz@gmail.com',
    businessId: '', 
    userId: ''
  };

  close() {
    this.closeModal.emit();
  }
  onBusinessChange(businessId: string): void {
    this.form.businessId = businessId;
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['businessIds'] && this.isOpen) {
      console.log('Business IDs:', this.businessIds);
      this.initializeForm();
    }
  }


  initializeForm(): void {
    this.form.businessId = this.businessIds[0]._id;
  }

  submitForm() {
    console.log('Form Data:', this.form); 
    this.submitFormEvent.emit(this.form);
    this.close();
  }
  
}
