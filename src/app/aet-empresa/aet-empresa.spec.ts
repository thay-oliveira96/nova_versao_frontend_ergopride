import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AetEmpresa } from './aet-empresa';

describe('AetEmpresa', () => {
  let component: AetEmpresa;
  let fixture: ComponentFixture<AetEmpresa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AetEmpresa]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AetEmpresa);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
