# Web App manifest

Een webapplicatie kan een “native” look en feel krijgen met een web app manifest. Dit is een webmanifest-bestand dat informatie bevat die je browser gebruikt wanneer de applicatie op het startscherm is geïnstalleerd. Als je een webapplicatie die geïnstalleerd is op je homescreen en je opent deze, dan opent deze zichzelf met een splash screen. Ook zijn de browseronderdelen zoals de URL balk weggehaald

Je maakt in je project een webmanifest-bestand aan. Deze wordt meestal manifest.webmanifest genoemd. Dit bestand heeft dezelfde syntax als een json-bestand. Hierin bepaal je eigenschappen over hoe de webapplicatie zich moet gedragen. Deze laad je vervolgens in de head van je Html-pagina.

```html
<html>
<head>
  <title>RoutiDo</title>
  <link rel="manifest" href="/manifest.webmanifest" />
  <!-- rest van de head... -->
</head>
<body>
  <!-- de content van je webpagina -->
</body>
</html>
```
Aan de web app manifest geef je de volgende eigenschappen mee:
- **Name** De name property geeft de naam van de applicatie aan. Deze wordt gebruikt op het splash screen en wordt weergegeven bij het schakelen tussen apps op android en IOS.

- **Short\_name**
Deze wordt gebruikt als naam onder het icoontje op telefoons.

- **Start\_url**
Dit is de url waar naartoe wordt genavigeerd als de gebruiker de applicatie opent vanaf zijn/haar startscherm.

- **Background\_color**
De achtergrondkleur van het splash screen van het splashscreen van de applicatie. De waarde die hiervoor wordt gebruikt is een hexwaarde.

- **Theme\_color**
 Met de theme\_color eigenschap wordt aangegeven welke kleur statusbalk moet hebben als de applicatie wordt gebruikt. Ook wordt deze kleur gebruikt bij het als kleur voor de bovenste balk bij het schakelen tussen applicaties in android.

- **Scope**
De scope waarin de web app manifest zich bevind. Als een pagina wordt geopend die buiten de scope valt zal deze worden geopend in de 'normale' browser. Zo kan worden aangegeven dat de de PWA alleen geld voor alle pagina's die beginnen met `/nieuws`. Als de gebruiker nu vanaf `https://somesite.com/nieuws` navigeert naar `https://somesite.com/about` dan wordt deze pagina geopend in een gewoon browservenster

- **Display**
Met display geef je aan op welke manier hoe je applicatie wordt gepresenteerd. Je hebt hiervoor een aantal opties. Dit zijn fullscreen, standalone, minimal-ui en browser.

  Fullscreen zorgt ervoor dat de progressive web app in volledig scherm wordt geopend de browser, Deze heeft mist dan alle browser onderdelen, zoals de url. Ook wordt de ui van het besturingssysteem verborgen zoals de statusbalk en de navigatieknoppen. Deze manier is vooral games.

  Standalone verbergt alleen de browser ui zoals de URL-balk. Deze mode is gebruikelijk voor applicaties, omdat hiermee de webapplicatie het meeste op een native applicatie lijkt.

  Met Browser wordt aangegeven dat de webapplicatie gewoon in de browser wordt geopend.

Om te controleren in welke stand de browser is geopend kan het volgende if statement worden gebruikt:
  
  ```javascript
  If(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standAlone) {
      // in this block the app is in standalone mode
  }
  ```
  
  ```css
  @media all and (display-mode: standalone) {
      /* css for standalone only goes here */
  }
  
  ```

- **Dir**
hiermee geef je aan hoe de leesrichting aan van de applicatie. Dit is standaard &quot;ltr&quot; (left to right), maar dit kun je ook aanpassen naar &quot;rtl&quot; (right to left).

- **Orientation**
Hiermee wordt de schermoriëntatie afgedwongen. De opties zijn &quot;landscape&quot; en &quot;portrait&quot;.

- **Icons**
In deze lijst staan welke icoontjes gebruikt moeten worden voor de applicatie als deze op het startscherm wordt geïnstalleerd. Een icon bestaat uit de eigenschappen `src`, `type` en `size`. `src` is de url van het icoon, `type` is het type afbeelding en `size` is de grootte van de afbeelding.

  ```json
  {
    "src": "/img/favicon/favicon192.png",
    "type": "image/png",
    "sizes": "192x192"
  }
  ```
  
  Het is aan te raden om in de lijst meerdere icoontjes van verschillende groottes aan te geven. Het apparaat waarop de webapplicatie wordt geïnstalleerd kiest dan zelf de beste grootte om te gebruiken. Echter wordt het wel aangeraden om een icoon te hebben van minsten 192 bij 192 pixels.
  
Uiteindelijk heb je een webmanifest-bestand wat er zo uitziet:
```json
{
  "name": "Routido",
  "short_name": "Routido",
  "theme_color": "#285f84",
  "background_color": "#285f84",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    {
      "src": "assets/icons/icon48.png",
      "sizes": "48x48",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}

```
## Overige metatags

Niet alle browsers ondersteunen een Web app manifest, maar bieden andere mogelijkheden voor het aanpassen van het icoontje of voor het aanpassen van de kleur van de statusbalk en de balk van de browser. Dit kunnen we bereiken door de meta tags toe te voegen aan de browser.

Zo kan voor oudere versie van Safari voor IOS aangeven welke icoontjes gebruikt moeten worden. Dit kun je ook door voor Edge. Ook daarvoor kan worden aangegeven welk icoon voor de tegel moet worden gebruikt en wat de achtergrondkleur van de tegel moet zijn.

De volgende link-elementen en metatags kunnen worden toevoegd aan de browser, zodat deze als native webapplicatie beschikbaar is oudere browsers. Alles boven de witregel is voor Apple IOS en alles eronder is voor Microsoft Edge.


```html
<head>
    <meta charset="utf-8">
    <title>RoutiDo</title>
    <base href="/">
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobule-web-app-status-bar-style" content="#285f84">
    <meta name="apple-mobule-web-app-title" content="Todo">
    <link rel="apple-touch-icon" href="/assets/icons/icon48.png" sizes="48x48">
    <link rel="apple-touch-icon" href="/assets/icons/icon72.png" sizes="72x72">
    <link rel="apple-touch-icon" href="/assets/icons/icon96.png" sizes="96x96">
    <link rel="apple-touch-icon" href="/assets/icons/icon144.png" sizes="144x144">
    <link rel="apple-touch-icon" href="/assets/icons/icon192.png" sizes="192x192">
    <link rel="apple-touch-icon" href="/assets/icons/icon512.png" sizes="512x512">
  
    <meta name="msapplication-TileImage" content="/assets/icon/icon144.png">
    <meta name="msapplication-TileColor" content="#285f84">
    <meta name="theme-color" content="#285f84">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&amp;display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link rel="manifest" href="/manifest.webmanifest">
    <meta name="theme-color" content="#285f84">
</head>
```

## browsersupport
Voor het installeren op het startscherm met behulp van een web app manifest is vooral aan mobiel gedacht. Dat zie je ook terug in het browsersupport. Op desktop wordt dit alleen ondersteund oor Google Chrome. 
Op mobiel werkt het echter wel op alle vijf de geteste browsers. Er zijn bij alle moderne browsers wel wat kleine onderdelen die niet werken. Zo wordt bijvoorbeeld in alle browser behalve Google Chrome het installed event niet uitgevoerd als de applicatie is geinstalleerd.

![browsersupport Web App manifest](docs/img/browsersupport-webappmanifest.png)

## web app manifest in dit project
Met behulp van de Angular-CLI kunnnen we van onze applicatie een Progressive web App maken. Om dit te doen moeten we het commando `ng add @angular/pwa` draaien in onze applicatie.

De Angular-CLI doet dan het volgende:
- voegt een manifest.webmanifest toe aan het project.
- voegt icons toe aan het project
- voegt de Web App manifest toe aan de index.html van het project
- voegt de ServiceWorkerModule toe aan de imports in de AppModules.

Nu is het alleen nog maar een kwestie om die eigenschappen aan te passen. Ook kunnen de bovengenoemde tags aan de applicatie worden toegevoegd.