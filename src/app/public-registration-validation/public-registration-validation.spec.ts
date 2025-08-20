import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicRegistrationValidation } from './public-registration-validation';

describe('PublicRegistrationValidation', () => {
  let component: PublicRegistrationValidation;
  let fixture: ComponentFixture<PublicRegistrationValidation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicRegistrationValidation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicRegistrationValidation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
