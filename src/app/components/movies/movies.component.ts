import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { ActivatedRoute } from '@angular/router';
import { delay } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { CinemetaService } from '../../api/cinemeta.service';
import { StreamTapeService } from '../../api/stream-tape.service';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
})
export class MoviesComponent implements OnInit {
  hero: any;
  movies_data: any[] = [];
  moviesSlider: any[] = [];
  movieFolderId = 'X-c5Jw4T87E';
  imdbRegex = /\btt\d{7,8}\b/;

  movieCategories: { [key: string]: any[] } = {
    nowPlayingMovies: [],
    popularMovies: [],
    upcomingMovies: [],
    topRatedMovies: [],
  };

  constructor(private apiService: ApiService,
    private cinemetaService: CinemetaService,
    private streamTapeService: StreamTapeService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.getMovies();
    // this.loadMovies();
    // this.getNowPlaying(2);
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

  getNowPlaying(page: number) {
    this.apiService.getNowPlaying('movie', page).pipe(delay(2000)).subscribe(
      (res: any) => {
        this.movies_data = res.results.map((item: any) => ({
          ...item,
          link: `/movie/${item.id}`
        }));
      },
      error => {
        console.error('Error fetching now playing data', error);
      }
    );
  }

  loadMovies(): void {
    this.fetchMovies('now_playing', 'nowPlayingMovies');
    this.fetchMovies('popular', 'popularMovies');
    this.fetchMovies('upcoming', 'upcomingMovies');
    this.fetchMovies('top_rated', 'topRatedMovies');
  }

  fetchMovies(category: string, property: string): void {
    this.apiService.getCategory(category, 1, 'movie').subscribe(
      (response) => {
        this.movieCategories[property] = response.results.map((item: any) => ({
          link: `/movie/${item.id}`,
          linkExplorer: `/movie/category/${category}`,
          imgSrc: item.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${item.poster_path}` : null,
          title: item.title,
          rating: item.vote_average * 10,
          vote: item.vote_average,
        }));
        console.log(`${category} movies:`, response.results);
      },
      (error) => {
        console.error(`Error fetching ${category} movies:`, error);
      });
  }
}
