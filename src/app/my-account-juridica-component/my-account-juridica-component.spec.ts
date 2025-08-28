import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAccountJuridicaComponent } from './my-account-juridica-component';

describe('MyAccountJuridicaComponent', () => {
  let component: MyAccountJuridicaComponent;
  let fixture: ComponentFixture<MyAccountJuridicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAccountJuridicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyAccountJuridicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
