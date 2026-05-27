import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderNew } from './order-new';

describe('OrderNew', () => {
  let component: OrderNew;
  let fixture: ComponentFixture<OrderNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderNew]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
