import { StreamTapeService } from './../../api/stream-tape.service';
import { CinemetaService } from './../../api/cinemeta.service';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../api/api.service';
import { ActivatedRoute, Params } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-tv-info',
  templateUrl: './tv-info.component.html',
  styleUrls: ['./tv-info.component.scss']
})
export class TvInfoComponent implements OnInit {
  id!: string;
  folderId!: string;
  tv_data: any;
  external_data: any;
  activeTab: string = 'overview';
  video_data: any;
  videos: any[] = [];
  filteredVideos: any[] = [];
  videoTypes: string[] = [];
  backdrops: any[] = [];
  posters: any[] = [];
  cast_data: any;
  recom_data: any[] = [];
  type: 'tv' = 'tv';

  constructor(private apiService: ApiService,
    private cinemetaService: CinemetaService,
    private streamTapeService: StreamTapeService,
    private router: ActivatedRoute,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.router.params.subscribe((params: Params) => {
      this.id = params['id'];
      this.folderId = params['folderId'];
      this.getTvShow(this.id);
    });
  }

  getTvShow(imdbId: string) {
    this.streamTapeService.listFolderFiles(this.folderId).subscribe(
      streamTapeResponse => {
        let episodeFiles = streamTapeResponse.result.files;
        this.cinemetaService.getTvShow(imdbId).subscribe(cinemetaResponse => {
          const meta = cinemetaResponse.meta;
          const tvShowItem = {
            link: `/tv/${meta.imdb_id}`,
            poster: meta.poster,
            background: meta.background,
            title: meta.name,
            rating: meta.imdbRating,
            vote: meta.imdbRating,
            released: meta.released,
            overview: meta.description,
            director: meta.director,
            writer: meta.writer,
            popularity: meta.popularity?.toFixed(2),
            awards: meta.awards,
            country: meta.country,
            genre: meta.genre,
            genres: meta.genres,
            status: meta.status,
            runtime: meta.runtime,
            videos: meta.videos,
            tmdbid: meta.moviedb_id,
            episodeFiles: episodeFiles
          }
          this.tv_data = tvShowItem;
          this.external_data = {
            imdb_id: meta.imdb_id,
            moviedb_id: meta.moviedb_id
          }
        });
      });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
