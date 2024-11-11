import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { StreamTapeService } from './../../api/stream-tape.service';
import { CinemetaService } from './../../api/cinemeta.service';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import videojs from 'video.js';

@Component({
  selector: 'app-video-player',
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss'
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('target', { static: true }) target!: ElementRef;
  player: any;
  videoId!: string;
  videoSourceUrl!: SafeResourceUrl;
  streamTapeBaseUrl: string = 'https://streamtape.com/e/';

  constructor(
    private elementRef: ElementRef,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private cinemetaService: CinemetaService,
    private streamTapeService: StreamTapeService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      this.spinner.show();
      this.videoId = params['videoId'];
      const streamTapeUrl = `${this.streamTapeBaseUrl}${this.videoId}`;
      this.videoSourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(streamTapeUrl);
      //this.loadvideo(this.videoId);
      setTimeout(() => {
        this.spinner.hide();
      }, 2000);
    });
  }

  loadvideo(videoId: string) {
    this.streamTapeService.createDownloadTicket(videoId).subscribe(
      createTicketResponse => {
        if (createTicketResponse) {
          const ticket = createTicketResponse.result.ticket;
          this.streamTapeService.getDownloadLink(videoId, ticket).subscribe(
            downloadLinkResponse => {
              if (downloadLinkResponse) {
                const downloadUrl = downloadLinkResponse.result.url;
                this.videoSourceUrl = downloadUrl
                if (this.videoSourceUrl) {
                  this.initializeVideo();
                }
              }
            }, error => {
              console.error(`Error getting download link. VideoId: ${this.videoId} Ticket: ${ticket}:`, error);
            })
        }
      }, error => {
        console.error(`Error getting download ticket ${this.videoId}:`, error);
      }
    )
  }

  private initializeVideo() {
    const options: any = {
      fluid: true,
      autoplay: false,
      preload: 'auto',
      responsive: true,
      sources: [{
        src: this.videoSourceUrl,
        type: 'video/mp4',
      }],
    };
    this.player = videojs(this.target.nativeElement, options, function onPlayerReady() {
      console.log('onPlayerReady', this);
    });
  }

  ngOnDestroy() {
    if (this.player) {
      this.player.dispose();
    }
  }
}