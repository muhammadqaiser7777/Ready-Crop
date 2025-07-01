import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPlantsComponent } from './view-plants.component';

describe('ViewPlantsComponent', () => {
  let component: ViewPlantsComponent;
  let fixture: ComponentFixture<ViewPlantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPlantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewPlantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
