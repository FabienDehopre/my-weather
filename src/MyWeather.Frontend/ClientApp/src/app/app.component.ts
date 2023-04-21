import {Component, inject, OnInit} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {Router, RouterOutlet} from '@angular/router';
import {HttpClient, HttpHeaders} from "@angular/common/http";

interface Claim {
  type: string;
  value: string;
}

interface WeatherData {
  date: string;
  summary: string;
  temperatureC: number;
  temperatureF: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);
  title = 'my-weather-frontend';
  user: Claim[] = [];
  weatherForecast: WeatherData[] =[];

  ngOnInit(): void {
    this.http.get<Claim[]>('/bff/user')
      .subscribe((user) => {
        this.user = user;
      });
  }

  logout() {
    if (this.user) {
      const logoutUrl = this.user.find(x => x.type === 'bff:logout_url')?.value;
      if (logoutUrl) {
        this.document.location.assign(`https://localhost:7293${logoutUrl}`);
      }
    }
  }

  loadWeatherForecast(): void {
    this.http.get<WeatherData[]>('/api/weatherforecast')
      .subscribe(result => {
        this.weatherForecast = result;
      });
  }
}
