import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Segmento } from './segmento';

describe('Segmento', () => {
  let component: Segmento;
  let fixture: ComponentFixture<Segmento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Segmento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Segmento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
