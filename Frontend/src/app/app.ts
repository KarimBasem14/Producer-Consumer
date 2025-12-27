import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {MainPage} from './main-page/main-page';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MainPage],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Product line Simulator');

  private http = inject(HttpClient);

  ngOnInit() {
    this.clearBackend();
  }

  clearBackend() {
    this.http.delete('http://localhost:8080/layout/clear', {responseType: 'text'}).subscribe({
      next: () => console.log('Backend cleared successfully'),
      error: (err) => console.error('Error clearing backend', err),
    });
  }
}
