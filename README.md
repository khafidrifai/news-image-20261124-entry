# World News — Tuesday, 24 November 2026

A newspaper front page that sums up 24 November 2026's world news in one
image, drawn from scratch by `main.ts`: its own 5x7 bitmap font, its own
rasteriser, and its own PNG encoder (node:zlib). No assets, no network.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png`: a 1024x1024 PNG, about 19 KB.

## Stories

- Lead: Russian corvette Merkury sunk off Benghazi, Libya, by seven
  Ukrainian sea drones; cargo ship MV Angara also hit.
- Trump warns Iran of "bad things" if it rejects a nuclear deal, giving
  Tehran 10 to 15 days; a second US carrier is moving to the region.
- COP31 in Antalya ends with no deal.
- Nvidia's board reinstates Jensen Huang as CEO; Nvidia shares up 31%.
- Asian markets surge: Nikkei +4%, South Korea +6.7%, Taiwan +9.1%.
- Heavy fighting in Ituri, DR Congo, disrupts the Ebola response.

## Entry

Built for the make.fun bounty "Sum up 24 November's world news in one
image" (news-image-20261124).

## Verification

Two runs of `main.ts` produce byte-identical PNGs (same sha256), 1024x1024
pixels and well under the 1 MiB cap. The page was viewed at full size:
masthead, date line, lead headline and illustration, all five stories and
the footer are legible with no overlapping text.
