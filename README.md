# NextMatch Manager OS

Een data-rijk voetbalmanagementsysteem voor ambitieuze JO13–JO19-trainers en jeugdopleidingen.

## Live demo

`https://kaan022.github.io/GPTomgeving/`

GitHub Pages moet mogelijk éénmalig onder **Settings → Pages → Source: GitHub Actions** worden geactiveerd.

## Wat de demo bevat

- Football Manager-achtige managementcockpit met een eigen visuele identiteit;
- Manager’s Desk, wedstrijddebrief, Training Centre en Tactics Board;
- browser speech-to-text en text-to-speech;
- Wilhelmus O17-2 speelwijze: 1-3-2-5 in balbezit en 4-1-2-1-2 zonder bal;
- periodisering met hoofdthema, tegenhangend thema en wedstrijdtransfer;
- Video Lab met transparant gemarkeerde demoanalyse;
- VC2/VC3 Portfolio Cockpit en PVB-evidencematrix;
- responsive mobiele interface.

## Documentatie

- `docs/PRODUCT_BLUEPRINT.md` — product, voetbalmethodiek, VC-koppeling en commerciële volgorde.
- `docs/MODEL_ARCHITECTURE.md` — speech-, video- en tactische modelarchitectuur.

## Eerlijke productiestatus

De publieke demo is een statische front-end en gebruikt geen echte accounts, betalingen of server-side AI-inferentie. De volledige lokale bronset bevat daarnaast een FastAPI ML-service scaffold, Supabase-schema met Row Level Security, uitgebreidere UI en deploymentbestanden.

Voor Veo-achtige productieanalyse zijn een consented video-dataset, labels, GPU-inferentie, modellicentiecontrole en human-in-the-loop validatie noodzakelijk.
