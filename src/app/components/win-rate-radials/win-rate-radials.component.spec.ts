import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WinRateRadialsComponent } from './win-rate-radials.component';

describe('WinRateRadialsComponent', () => {
  let component: WinRateRadialsComponent;
  let fixture: ComponentFixture<WinRateRadialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WinRateRadialsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WinRateRadialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
