import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  styleUrl: './app.css'
})
export class App {
  constructor() {
    // En la aplicación móvil del establecimiento se solicita acceso en cada inicio.
    if (Capacitor.isNativePlatform()) {
      localStorage.removeItem('digitalWaiterToken');
      localStorage.removeItem('digitalWaiterSession');
    }
  }
}
