// src/app/aet-funcao/aet-funcao.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AetFuncaoComponent } from './aet-funcao';

describe('AetFuncaoComponent', () => {
  let component: AetFuncaoComponent;
  let fixture: ComponentFixture<AetFuncaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AetFuncaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AetFuncaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});