# src/gta6_tracker/sources.py

from dataclasses import dataclass


@dataclass
class RSSSource:
    name: str   # human readable name
    url: str    # the RSS feed URL


SOURCES = [
    # --- Tier 1: Most likely to have GTA 6 specific news ---
    RSSSource(
        name="Rockstar Newswire",
        url="https://www.rockstargames.com/newswire/feed"
    ),
    RSSSource(
        name="IGN",
        url="https://feeds.ign.com/ign/all"
    ),
    RSSSource(
        name="Eurogamer",
        url="https://www.eurogamer.net/feed"
    ),
    RSSSource(
        name="Kotaku",
        url="https://kotaku.com/rss"
    ),
    RSSSource(
        name="VGC",
        url="https://www.videogameschronicle.com/feed"
    ),

    # --- Tier 2: Broad gaming news, Claude filters GTA 6 ---
    RSSSource(
        name="IGN All",
        url="https://feeds.ign.com/ign/all"
    ),
    RSSSource(
        name="GameSpot",
        url="https://www.gamespot.com/feeds/mashup"
    ),
    RSSSource(
        name="Polygon",
        url="https://www.polygon.com/rss/index.xml"
    ),
    RSSSource(
        name="GamesRadar",
        url="https://www.gamesradar.com/rss/"
    ),
    RSSSource(
        name="PCGamer",
        url="https://www.pcgamer.com/rss/"
    ),
    RSSSource(
        name="TechRadar Gaming",
        url="https://www.techradar.com/rss/news/gaming"
    ),
    RSSSource(
        name="The Verge Games",
        url="https://www.theverge.com/games/rss/index.xml"
    ),
    RSSSource(
        name="Game Rant",
        url="https://gamerant.com/feed/"
    ),

    # --- Tier 3: Reddit (free, no API key needed) ---
    RSSSource(
        name="Reddit r/GTA6",
        url="https://www.reddit.com/r/GTA6/new/.rss"
    ),
    RSSSource(
        name="Reddit r/GrandTheftAutoVI",
        url="https://www.reddit.com/r/GrandTheftAutoVI/.rss"
    ),
    RSSSource(
        name="Reddit r/rockstargames",
        url="https://www.reddit.com/r/rockstargames/new/.rss"
    ),
]
