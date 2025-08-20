import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicRegistration } from './public-registration';

describe('PublicRegistration', () => {
  let component: PublicRegistration;
  let fixture: ComponentFixture<PublicRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicRegistration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PublicRegistration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
