import { StreamTapeService } from './../../api/stream-tape.service';
import { CinemetaService } from './../../api/cinemeta.service';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../api/api.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-movie-category',
  templateUrl: './movie-category.component.html',
  styleUrls: ['./movie-category.component.scss']
})
export class MovieCategoryComponent implements OnInit {

  category!: string;
  page: number = 1;
  isLoading: boolean = false;
  movieFolderId = 'X-c5Jw4T87E';
  imdbRegex = /\btt\d{7,8}\b/;
  movieCategories: { [key: string]: any[] } = {
    all: [],
    popularMovies: [],
    topRatedMovies: [],
    upcomingMovies: [],
    nowPlayingMovies: [],
  };
  streamTapeMovies: any[] = [];
  currentIndex!: number;
  moviesPerLoad: number = 10;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private spinner: NgxSpinnerService,
    private cinemetaService: CinemetaService,
    private streamTapeService: StreamTapeService
  ) { }

  ngOnInit() {
    this.spinner.show();

    this.route.url.subscribe(url => {
      this.category = url[2].path;
      this.page = 1;
      this.loadCategoryMovies(this.category);
    });

    setTimeout(() => {
      this.spinner.hide();
    }, 2000);
  }

  loadCategoryMovies(category: string) {
    this.fetchMovies(category, this.getCategoryProperty(category));
  }

  fetchMovies(category: string, property: string): void {
    if (this.isLoading) return;
    this.isLoading = true;
    this.streamTapeService.listFolderFiles(this.movieFolderId).subscribe(
      streamTapeResponse => {
        if (streamTapeResponse) {
          let movieFiles = streamTapeResponse.result.files;
          movieFiles = movieFiles.sort((a: any, b: any) => b.created_at - a.created_at).slice(0, 100);
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
                this.movieCategories[category].push(movieItem);
              });
            }
          });
          this.isLoading = false;
        }     
      },
      error => {
        console.error(`Error fetching movies ${this.movieFolderId}:`, error);
      }
    )
  }

  getCategoryProperty(category: string): string {
    switch (category) {
      case 'popular':
        return 'popularMovies';
      case 'top_rated':
        return 'topRatedMovies';
      case 'upcoming':
        return 'upcomingMovies';
      case 'now_playing':
        return 'nowPlayingMovies';
      default:
        return 'all';
    }
  }

  // @HostListener('window:scroll', ['$event'])
  // onScroll(event: Event) {
  //   const pos = (document.documentElement.scrollTop || document.body.scrollTop) + window.innerHeight;
  //   const max = document.documentElement.scrollHeight || document.body.scrollHeight;

  //   if (pos > max - 100) {
  //     this.loadMoreMovies();
  //   }
  // }
}
