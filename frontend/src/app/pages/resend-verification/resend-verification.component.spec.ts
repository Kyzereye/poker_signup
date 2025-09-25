import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResendVerificationComponent } from './resend-verification.component';

describe('ResendVerificationComponent', () => {
  let component: ResendVerificationComponent;
  let fixture: ComponentFixture<ResendVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResendVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResendVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
