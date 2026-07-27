# NextMatch Private Coach OS

Een beveiligde, generieke coachworkspace voor trainers op ieder niveau: jeugd, senioren, recreatief, prestatief en high performance.

## Live app

`https://kaan022.github.io/GPTomgeving/`

De loginpagina is publiek bereikbaar; alle coachdata staat achter Supabase Auth en Row Level Security. Iedere gebruiker krijgt een eigen workspace en ziet alleen de eigen teams, debriefs, principes en instellingen.

## Functionaliteit

- persoonlijke registratie en login;
- uitgebreide intake in vijf stappen;
- meerdere teams per gebruiker;
- profiel, club, team, speelwijze en voorkeuren later wijzigen;
- teams en workspacegegevens verwijderen;
- Manager’s Desk;
- wedstrijddebrief met speech-to-text en text-to-speech;
- trainingsweek en tactiekbord;
- teamidentiteit en principes;
- Video Intelligence-roadmap;
- responsive desktop- en mobiele interface.

## Eenmalige activatie

1. Maak een gratis Supabase-project.
2. Voer `supabase/schema.sql` uit in de SQL Editor.
3. Voeg in GitHub Actions secrets toe: `SUPABASE_URL` en `SUPABASE_ANON_KEY`.
4. Kies bij GitHub Pages als source: **GitHub Actions**.

## Privacy-architectuur

De database bevat één workspace per authenticated user. RLS-policies vergelijken iedere lees-, schrijf-, wijzig- en verwijderactie met `auth.uid()`. De anon key mag in de browser staan; de service-role key hoort nooit in de front-end of GitHub Pages.

## Productiestatus

Login, tenantisolatie, onboarding, wijziging en verwijdering zijn gebouwd. Videoanalyse is nog een transparante productroadmap en geen werkend Veo-alternatief. Echte AI- en video-inferentie worden later via afgeschermde server-side services toegevoegd.
