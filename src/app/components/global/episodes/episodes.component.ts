import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../../../api/api.service';

@Component({
  selector: 'app-episodes',
  templateUrl: './episodes.component.html',
  styleUrl: './episodes.component.scss'
})
export class EpisodesComponent implements OnInit {
  @Input() data: any;

  id!: number;
  episodes_data: any[] = [];
  selectedSeason: number = 1;
  seasons: any[] = [];
  seasonEpisodes: any[] = [];

  constructor(private apiService: ApiService, 
    private route: ActivatedRoute, 
    private router: Router,
    private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.groupSeasonAndEpisodes(this.data);
    this.loadEpisodes(this.selectedSeason);
  }

  groupSeasonAndEpisodes(data: any) {
    this.seasonEpisodes = data.videos.reduce((acc: any, episode: any) => {
      const { season } = episode;
      if (!acc[season]) {
        acc[season] = [];
      }
      acc[season].push(episode);
      return acc;
    }, {});
  }

  loadEpisodes(seasonNumber: number) {
    const episodes = this.seasonEpisodes[seasonNumber];
    this.episodes_data = episodes;
  }

  onSeasonChange(event: any): void {
    const selectedSeason = event.target.value;
    this.loadEpisodes(selectedSeason);
  }

  onEpisodeChoose(episode: any): void {
    const episodeSearch = this.formatSeasonEpisode(episode.season, episode.episode);
    const episodeFile = this.data.episodeFiles.find((file:any) => file.name.includes(episodeSearch));
    const videoId = episodeFile.linkid;
    this.playNow(videoId)
  }

  formatSeasonEpisode(season: any, episode: any) {
    const seasonStr = String(season).padStart(2, '0');
    const episodeStr = String(episode).padStart(2, '0');
    return `S${seasonStr}E${episodeStr}`;
  }

  playNow(videoId: any) {
    this.router.navigate([`/video/${videoId}`]);
  }
}
