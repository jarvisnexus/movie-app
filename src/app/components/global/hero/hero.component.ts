import { Router } from '@angular/router';
import { Component, Input, ViewChild } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';
import { ApiService } from '../../../api/api.service';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss'
})
export class HeroComponent {
  @Input() data: any;

  @ViewChild(ModalComponent) modal!: ModalComponent;

  constructor(private apiService: ApiService,
    private router: Router
  ) { }

  playNow(videoId: any) {
    this.router.navigate([`/video/${videoId}`]);
  }
}