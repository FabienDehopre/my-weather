import {Component, inject, OnInit} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {Router, RouterOutlet} from '@angular/router';
import {HttpClient, HttpHeaders} from "@angular/common/http";

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
  user: unknown;

  ngOnInit(): void {
    const headers = new HttpHeaders()
      .set('X-CSRF', '1');
    this.http.get('/bff/user', { headers }).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.log('Error', error);
        this.document.location.assign('https://localhost:7293/bff/login?redirectUrl=https://localhost:44449/');
      }
    });
  }
}
