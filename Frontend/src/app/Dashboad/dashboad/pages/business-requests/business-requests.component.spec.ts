import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessRequestsComponent } from './business-requests.component';

describe('BusinessRequestsComponent', () => {
  let component: BusinessRequestsComponent;
  let fixture: ComponentFixture<BusinessRequestsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessRequestsComponent]
    });
    fixture = TestBed.createComponent(BusinessRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
