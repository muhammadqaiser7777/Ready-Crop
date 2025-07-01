import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgePredictorComponent } from './age-predictor.component';

describe('AgePredictorComponent', () => {
  let component: AgePredictorComponent;
  let fixture: ComponentFixture<AgePredictorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgePredictorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgePredictorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
