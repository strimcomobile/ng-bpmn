import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgDmnComponent } from './ng-dmn.component';

describe('NgDmnComponent', () => {
  let component: NgDmnComponent;
  let fixture: ComponentFixture<NgDmnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgDmnComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(NgDmnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
