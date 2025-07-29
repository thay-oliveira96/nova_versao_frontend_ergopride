import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Departamento } from './departamento';

describe('Departamento', () => {
  let component: Departamento;
  let fixture: ComponentFixture<Departamento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Departamento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Departamento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
