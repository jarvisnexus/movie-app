import { CinemetaService } from './../../api/cinemeta.service';
import { StreamTapeService } from './../../api/stream-tape.service';
import { Component } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { delay } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-tv',
  templateUrl: './tv.component.html',
  styleUrl: './tv.component.scss'
})
export class TvComponent {
  tvShowsFolderId = 'OVjqGAovWH4';
  imdbRegex = /\btt\d{7,8}\b/;
  tv_data: any[] = [];
  tvSlider: any[] = [];

  constructor(private apiService: ApiService, 
    private streamTapeService: StreamTapeService,
    private cinemetaService: CinemetaService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.getTvShows();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  getTvShows() {
    this.streamTapeService.listFolderFiles(this.tvShowsFolderId).subscribe(
      streamTapeResponse => {
        if (streamTapeResponse) {
          let tvShowsFolders = streamTapeResponse.result.folders.slice(0, 50);
          tvShowsFolders = tvShowsFolders.sort((a: any, b: any) => b.created_at - a.created_at);
          tvShowsFolders.map((folder: any) => {
            const imdbId = folder.name.match(this.imdbRegex);
            if (imdbId) {
              this.cinemetaService.getTvShow(imdbId).subscribe(cinemetaResponse => {
                const meta = cinemetaResponse.meta;
                const tvShowItem = {
                  link: `/tv/${meta.imdb_id}/${folder.id}`,
                  poster: meta.poster,
                  background: meta.background,
                  title: meta.name,
                  rating: meta.imdbRating,
                  vote: meta.imdbRating,
                  released: meta.released,
                  overview: meta.description,
                  tmdbid: meta.moviedb_id,
                  genre: meta.genre,
                  genres: meta.genres
                }
                this.tvSlider.push(tvShowItem);
                this.tv_data.push(tvShowItem)
              });
            }
          });
        }
      },
      error => {
        console.error(`Error fetching trending ${this.tvShowsFolderId}:`, error);
      }
    )
  }
}
