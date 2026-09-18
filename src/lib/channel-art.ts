import newsImg from "@/assets/hero/cat2-news.png.asset.json";
import sportsImg from "@/assets/hero/cat2-sports.png.asset.json";
import moviesImg from "@/assets/hero/cat2-movies.png.asset.json";
import natureImg from "@/assets/hero/cat2-nature.png.asset.json";
import familyImg from "@/assets/hero/cat2-family.png.asset.json";
import lifestyleImg from "@/assets/hero/cat2-lifestyle.png.asset.json";
import animeImg from "@/assets/hero/cat2-anime.jpg";
import musicImg from "@/assets/hero/cat2-music.jpg";
import type { Channel } from "@/lib/channel-types";

const ART: Record<string, string> = {
  news: newsImg.url,
  sports: sportsImg.url,
  movies: moviesImg.url,
  movie: moviesImg.url,
  documentary: natureImg.url,
  kids: familyImg.url,
  family: familyImg.url,
  lifestyle: lifestyleImg.url,
  animation: animeImg,
  anime: animeImg,
  music: musicImg,
};

export function getChannelArt(channel: Channel): string {
  const category = channel.categories.find((item) => ART[item.toLowerCase()]);
  return category ? ART[category.toLowerCase()] : moviesImg.url;
}