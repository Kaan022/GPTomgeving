# NextMatch Private Coach OS — Product Blueprint

## Kernworkflow

`wedstrijd → debrief → analyse → weekdoel → trainingen → wedstrijdplan → uitvoering → evaluatie`

NextMatch is bewust ingericht als een voetbal-operating-system en niet als chatbot of algemene oefenstoffendatabase.

## Doelgroep

Iedere trainer, ongeacht opleiding, leeftijdscategorie, gender, niveau of speelwijze. De tool schrijft geen standaardvoetbal voor, maar leert de eigen context, taal, principes, middelen en ambities van de gebruiker.

## Modules

1. **Manager’s Desk** — prioriteiten, open beslissingen en de actuele trainingsweek.
2. **Debrief Room** — spraak- of tekstreflectie, gescheiden in feiten, hypotheses, interventies en criteria.
3. **Training Centre** — sessies met samenhang, representatieve weerstand en wedstrijdtransfer.
4. **Tactics Board** — eigen formaties, teamtaken, triggers en afstemming.
5. **Video Lab** — roadmap voor upload, tracking, events, 2D-posities en menselijke clipreview.
6. **Teamidentiteit** — versieerbare principes en coachtaal.
7. **Instellingen** — trainer, club, teams, voorkeuren, privacy en verwijdering.

## Personalisatie

De onboarding verzamelt uitsluitend informatie die de output aantoonbaar verbetert:

- rol, ervaring en gewenste diepgang;
- club, team, categorie, niveau en seizoen;
- selectie, trainingsdagen, duur, veldruimte en staf;
- formaties in en uit balbezit;
- speelwijze, prioriteiten en teamprincipes;
- feedbackstijl, speechfuncties, bewaartermijn en videotoestemming.

Alles blijft later wijzigbaar. Een gebruiker kan meerdere teams beheren en ieder team afzonderlijk verwijderen.

## Privacy en tenantisolatie

- Iedere authenticated gebruiker heeft één eigen workspace.
- Database-RLS controleert `auth.uid()` bij select, insert, update en delete.
- Browsermanipulatie kan de databasepolicy niet omzeilen.
- Geen service-role key in de front-end.
- Werk primair op teamniveau en vermijd onnodige persoonsgegevens en medische gegevens.

## Commerciële volgorde

1. Betaalde coachbeta: debrief, trainingsweek en teamgeheugen.
2. Retentie: terugkerende weekcyclus en correcties van trainers.
3. Clubpilot: meerdere trainers, gedeelde principes en rollen.
4. Video-add-on: clips en tactische teammetrics.
5. Opt-in datavliegwiel: menselijke correcties verbeteren gespecialiseerde modellen.

## Niet doen in de eerste betaalde release

- automatische spelersidentiteit;
- medisch of individueel belastbaarheidsadvies;
- onbegeleide talentscores;
- claims dat videoanalyse foutloos is;
- native apps voordat terugkerend webgebruik bewezen is.
