import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { delay } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { CinemetaService } from '../../api/cinemeta.service';
import { StreamTapeService } from '../../api/stream-tape.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  moviesSlider: any[] = [];
  tvSlider: any[] = [];
  movies_data: any[] = [];
  movieFolderId = 'X-c5Jw4T87E';
  tvShowsFolderId = 'OVjqGAovWH4';
  imdbRegex = /\btt\d{7,8}\b/;


  constructor(private apiService: ApiService,
    private cinemetaService: CinemetaService,
    private streamTapeService: StreamTapeService,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.getMovies();
    this.getTvShows();
    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  getMovies() {
    this.streamTapeService.listFolderFiles(this.movieFolderId).subscribe(
      streamTapeResponse => {
        if (streamTapeResponse) {
          let movieFiles = streamTapeResponse.result.files.slice(0, 50);
          movieFiles = movieFiles.sort((a: any, b: any) => b.created_at - a.created_at);
          movieFiles.map((file: any) => {
            const imdbId = file.name.match(this.imdbRegex);
            if (imdbId) {
              this.cinemetaService.getMovie(imdbId).subscribe(cinemetaResponse => {
                const meta = cinemetaResponse.meta;
                const movieItem = {
                  link: `/movie/${meta.imdb_id}/${file.linkid}`,
                  poster: meta.poster,
                  background: meta.background,
                  title: meta.name,
                  rating: meta.imdbRating,
                  vote: meta.imdbRating,
                  released: meta.released,
                  overview: meta.description,
                  tmdbid: meta.moviedb_id,
                  genre: meta.genre,
                  genres: meta.genres,
                  videoId: file.linkid
                }
                this.moviesSlider.push(movieItem);
                this.movies_data.push(movieItem);                
              });
            }
          });
        }
      },
      error => {
        console.error(`Error fetching trending ${this.movieFolderId}:`, error);
      }
    )
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
              this.cinemetaService.getMovie(imdbId).subscribe(cinemetaResponse => {
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
