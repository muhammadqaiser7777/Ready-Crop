import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlantRecordsComponent } from './plant-records.component';

describe('PlantRecordsComponent', () => {
  let component: PlantRecordsComponent;
  let fixture: ComponentFixture<PlantRecordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlantRecordsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlantRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
