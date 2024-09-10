import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BacknoComponent } from './backno.component';

describe('BacknoComponent', () => {
  let component: BacknoComponent;
  let fixture: ComponentFixture<BacknoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BacknoComponent]
    });
    fixture = TestBed.createComponent(BacknoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
