import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleCard } from './module-card';

describe('ModuleCard', () => {
  let component: ModuleCard;
  let fixture: ComponentFixture<ModuleCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
