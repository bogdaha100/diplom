import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-header',
  imports: [Button, BadgeModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

}
