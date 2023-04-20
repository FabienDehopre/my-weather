import {Component, inject, OnInit} from '@angular/core';
import {CommonModule, DOCUMENT} from '@angular/common';
import {Router, RouterOutlet} from '@angular/router';
import {HttpClient, HttpHeaders} from "@angular/common/http";

interface Claim {
  type: string;
  value: string;
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

  ngOnInit(): void {
    const headers = new HttpHeaders()
      .set('X-CSRF', '1');
    this.http.get<Claim[]>('/bff/user', { headers }).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (error) => {
        console.log('Error', error);
        this.document.location.assign('https://localhost:7293/bff/login?redirectUrl=https://localhost:44449/');
      }
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
}
