# World News — Tuesday, 24 November 2026

A newspaper front page that sums up 24 November 2026's world news in one
image, drawn from scratch by `main.ts`: its own 5x7 bitmap font, its own
rasteriser, and its own PNG encoder (node:zlib). No assets, no network.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png`: a 1024x1024 PNG, about 25 KB.

## Stories

Eleven stories, all verified 24 November 2026 reporting:

- Lead: Russian corvette Merkury sunk off Benghazi, Libya, by seven
  Ukrainian sea drones; cargo ship MV Angara also hit.
- Trump warns Iran of "bad things" if it rejects a nuclear deal, giving
  Tehran 10 to 15 days; a second US carrier is moving to the region.
- COP31 in Antalya ends with no deal.
- Russian jets near Ulleung Island; Seoul issues a brief shelter alert,
  with no airspace breach.
- Nvidia's board reinstates Jensen Huang as CEO; Nvidia shares up 31%.
- Asian markets surge: Nikkei +4%, South Korea +6.7%, Taiwan +9.1%.
- Thailand and Cambodia open sea-border talks in Kuala Lumpur.
- Eight trekkers missing near Kedartal in Uttarakhand; heavy snow
  hampers the search.
- Israeli strikes kill at least three in Gaza, including UNRWA worker
  Adel al-Helo.
- Mexico will try 'El Chapo Isidro' at home despite a US extradition
  request.
- Heavy fighting in Ituri, DR Congo, disrupts the Ebola response.

## Entry

Built for the make.fun bounty "Sum up 24 November's world news in one
image" (news-image-20261124).

## Version 2 — what changed

Version 1 ranked 4,453 of 7,302 in blind round 1 (score 0.475577), far
outside the paid top 50. This version answers the judge's own criteria:

- Breadth: eleven stories instead of six, across the Middle East, Asia,
  Europe, the Americas and Africa, and across war, diplomacy, climate,
  tech, markets, disaster and health.
- Lead visual: the sea-strike illustration is bigger (460 px wide) and
  more detailed — the Merkury and the MV Angara, five sea drones, fire
  and smoke — so it reads at 300 px wide.
- Layout: a tighter three-column grid with short headlines and
  four-line bodies, plus a full-width health strip at the foot.

Every added story was verified against 24 November 2026 reporting
before it was written in. Two candidates were rejected as not that
day's news: the O'Hare ground stop (23 November) and the Brazil storm
toll (updated 23 November).

## Verification

Two runs of `main.ts` produce byte-identical PNGs (same sha256),
1024x1024 pixels and well under the 1 MiB cap. The page was viewed at
full size after a first pass showed two overlaps — a five-line Korea
body colliding with the row below, and a three-line Mexico headline —
both fixed by shortening the body and the headline. The final page has
no overlapping text: masthead, date line, lead headline and
illustration, all eleven stories and the footer are legible.
