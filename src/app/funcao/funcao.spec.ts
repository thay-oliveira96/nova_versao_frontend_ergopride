import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Funcao } from './funcao';

describe('Funcao', () => {
  let component: Funcao;
  let fixture: ComponentFixture<Funcao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Funcao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Funcao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
