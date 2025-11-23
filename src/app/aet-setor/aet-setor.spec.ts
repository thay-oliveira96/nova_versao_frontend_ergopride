import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AetSetor } from './aet-setor';

describe('AetSetor', () => {
  let component: AetSetor;
  let fixture: ComponentFixture<AetSetor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AetSetor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AetSetor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
