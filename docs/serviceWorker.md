#Service worker
Voor het maken van een Progressieve Web App is een service worker een vereiste. De service worker is het middelpunt van de applicatie. De service worker doet op zichzelf niet veel. Dit is een Javascript-bestand kan luisteren naar verschillende events. Aan de hand van deze events kunnen verschillende worden uitgevoerd.

Een service worker is een gewoon Javascript-bestand met een paar aanpassingen. Zo draait deze in een andere thread. Hierdoor heeft het geen toegang tot bepaalde javascript API’s zoals de DOM. Ook draait is een Service worker niet in een tabblad, maar in de browser. Hierdoor kan deze actief blijven zelfs wanneer de applicatie niet open isn. Dit betekent ook dat er maar instantie van de service worker actief kan zijn.

Om een service te kunnen registreren moet de website draaien vanaf een betrouwbare host. Dit betekent dat de applicatie moet worden geserveerd over https en niet over http. Localhost is een uitzondering. Daarop mag ook een service worker worden geregistreerd. 

Verder is een service worker volledig asynchroon. Daarom kunnen onderdelen die synchroon zoals localstorage niet gebruikt worden in de service worker.

##Levencyclus van een Service Worker
Een service worker kent een aantal toestanden waarin deze komt in zijn levensduur. Om een service worker op te starten moet deze worden geregistreerd. Het is een best practice om te eerst te controleren of de browsers service workers ondersteund. Als dat het geval is dan kan op onderstaande manier de service worker worden geregistreerd. In dit geval heet de service worker `sw.js` en staat direct naast de index.html

```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
```
De service worker zal zichzelf registreren en zal in de `registered` toestand terechtkomen. Vervolgens zal hij zichzelf updaten. Als het registreren is gebeurd, zal de browser een nieuwe versie voor het maken het van de applicatie. Als de nieuwe versie eenmaal is geïnstalleerd zal de browser kijken of de service worker geactiveerd kan worden. Indien er een oude service worker actief is, kan dit niet en zal het systeem wachten totdat de browser opnieuw wordt opgestart. Als de service worker een tijdje niets heeft gedaan, gaat deze in de IDLE-state. Zodra de service worker weer iets moet doen (er komt bijvoorbeeld een push bericht binnen) dan zal de browser de service worker opstarten.

De toestanden van de service worker worden overzichtelijk weergegeven in onderstaand diagram:
![toestandsdiagram Service Worker](docs/img/state-serviceworker.png)

Bij het ingaan van deze toestanden vuurt de service worker een aantal events uit. Op deze events kun je aanhaken in de service. Hieronder een overzicht van de events en wat je kan doen tijdens dit event.

- **install** 
Het install event wordt uitgevoerd, zodra de service worker is geïnstalleerd. Over het algemeen wordt op dit moment alle statische bestanden opgehaald van de server en opgeslagen in de cache van de browser. 

  Dit gebeurt ook in onderstaand voorbeeld. We slaan hierin ook de urls op. Als de browser een verzoek maakt naar de URL `https://www.mysite.com/` dan weet de service worker wat hij moet teruggeven. 
  ```javascript
  // service-worker.js
  const CACHE_NAME = "todopwa-cache";
  const CACHED_FILES = [
    "/",
    "/index.html",
    "/js/builder.js",
    "/js/idb.js",
    "/js/helper.js",
    "/js/network.js",
    "/js/main.js",
    "/img/plus.svg",
    "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js",
    "https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",
    "/pages/offline.html",
  ];
  
  self.addEventListener("install", function (event) {
      event.waitUntil(
        caches.open(CACHE_NAME)
          .then(function (cache) {
            return cache.addAll(CACHED_FILES);
          })
      );
  });
  ```
- **activate** 
Als een nieuwe versie van de Service worker is geactiveerd wordt het `active` event afgevuurd. Dit event kan worden gebruikt om aan te geven dat een nieuwe versie van de service worker wordt gebruikt. Ook kan vanaf nu worden geluisterd naar andere events die niet worden afgevuurd door de levenscyclus, maar door de browser zelf. Bijvoorbeeld het fetch en het push event.

- **fetch** 
Het fetch event wordt afgevuurd zodra de gebruiker een bestand probeert op te halen van de server. Over het algemeen gaat het over assets uit de browser. Bijvoorbeeld javascript bestanden, CSS-bestanden of afbeeldingen. Je kan naar deze events luisteren en ervoor kiezen om een gecachte versie van deze bestanden op te slaan. Dit is bijvoorbeeld erg geschikt bij het schrijven van een blog. Op die manier worden de afbeeldingen die bij die post horen alleen opgeslagen als de gebruiker dat artikel bezoekt. Ook kan gekozen worden om de bestanden op te halen uit de cache in plaats van het verzoek te maken.

  ```javascript
  //service-worker.js
  self.addEventListener("fetch", function (event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request)
          .then(function (res) {
            return caches.open(CACHE_NAME)
              .then(function (cache) {
                cache.put(event.request.url, res.clone());
                return res;
              });
          }).catch(err => {
              if (event.request.headers.get('accept').includes('text/html'))
                return caches.match('/offline.html')
            })
      })
    )
  });
  ```

- **push**
Het push event wordt afgevuurd zodra de browser een pushbericht ontvangt. In het push event zit een data aan de hand van die data kan dan een notificatie worden getoond om de gebruiker op de hoogte te houden van over iets.
  ```javascript
  //service-worker.js
  self.addEventListener('push', function(event) {
    const data = event.data.json();
  
    const options = {
      body: data.title,
      badge: data.img,
      icon: data.icon,
      vibrate: [200, 50, 100],
      silent: false,
      data: {
        url: data.url || '/'
      },
      tag: data.tag
    };
  
    event.waitUntil(
      self.registration.showNotification(data.body, options)
    );
  });
  ```

- **notificationclick**
Het `notificationclick` event wordt afgevuurd als de gebruiker op een notificatie klikt. Mocht de notificatie acties hebben dan kun je kijken of een van deze acties is gedrukt en daarop een actie laten uitvoeren. Een actie is meestal het openen van een andere pagina dan de pagina die wordt geopend bij een gewone klik zonder actie, maar deze kan ook een taak uitvoeren in de serviceworker.
  
  In het voorbeeld hieronder wordt geluisterd naar het `notificationclick` als de gebruiker op de confirm actie drukt wordt een pagina geopend met de meegegeven url uit het pushbericht. Als de applicatie als geopend is en zichtbaar is op het scherm wordt op deze pagina genavigeerd de url.
  ```javascript
  // service worker.js
  self.addEventListener('notificationclick', function(event) {
    const notification = event.notification;
    const action = event.action;

    if (action === 'confirm') {
      notification.close();
    } else {
      event.waitUntil(
        clients.matchAll()
          .then(function(clients) {
            const client = clients.find(function(client) {
              return client.visibilityState === 'visible';
            });
  
            if (client !== undefined) {
              client.navigate(notification.data.url);
              client.focus();
            } else {
              clients.openWindow(notification.data.url);
            }
            notification.close();
          })
      );
    }
  });
  ```

- **notificationclose**
Het `notificationcanel` event is het event wat wordt uitgevoerd als de gebruiker een notificatie annuleert. Dit kan zijn door een swipe op een android telefoon of door op kruisje te drukken op een IOS-telefoon.
  ```javascript
  // service-worker.js
  self.addEventListener('notificationclose', function(event) {
    console.log('Notification was closed', event);
  });
  ```

## offlinesupport
Met een service worker is het mogelijk om offlinesupport in te stellen voor een website. Zo kan door het combineren van het `fetch` event en van het `install` event de statische bestanden worden teruggegeven die de gebruiker nodig heeft voor het gebruiken van de applicatie. 

Er zijn vier verschillende strategien die gebruikt kunnen worden voor het maken van de applicatie. Dit zijn: Network only, cache only, netowork first cache fallback en cache first network fallback.

- **network only**
Er worden geen bestanden opgeslagen in de cache van de browser. Alle bestanden worden opgehaald van de server. Mocht de gebruiker geen verbinding hebben met het internet dan zullen deze onderdelen niet worden opgehaald. Dit is hetzelfde gedrag als wanneer je geen service worker gebruikt. Je zou eventueel wel een pagina kunnen cachen om te tonen als het opslaan niet lukt, zodat foutmelding wat vriendelijker is.

  ![network only](docs/img/network-only.png)
  
- **cache only**
Met cache only worden de beestanden na het ophalen van de server opgeslagen in de cache. Daarna haal de service worker alle bestanden op uit de cache. Mocht een bestand niet te vinden zijn in de cache dan zal deze niet te laden zijn.

  ![cache only](docs/img/cache-only.png)
  
- **network first, cache fallback**
Met deze strategie is kan eerst de bestanden worden opgehaald van het server. Mocht dat niet lukken dan wordt het bestand uit de cache gebruikt. Het voordeel is dat de gebruiker op deze manier altijd de nieuwste versie van de applicatie heeft. Ook kan een backup worden getoondd, mocht het bestand niet te vinden zijn. Toch is deze strategie niet heel populair. Mocht namelijk een gebruiker offline zijn en proberen de bestanden dan zal hij/zij eerst een verzoek make en dat laten falen. Dit falen gebeurt bijvoorbeeld nadat de gebruiker zijn TIMEOUT-tijd van het verzoek is overschreden. Als dit bijvoorbeeld 60 seconde is, zal de gebruiker eerst 60 seconde niets zien voordat de versie uit de cache wordt opgehaald.

  ![network first](docs/img/network-first.png)
  
- **cache first, netowork fallback**
Dit is de meest gebruikte cache strategie om offlinesupport aan te bieden. Hiermee heeft de gebruiker altijd snel resultaat, omdat de bestanden uit de cache worden opgehaald. Het nadeel is dat de gebruiker bijna altijd de op-één-na-laatste versie van deze bestanden gebruikt. Dit komt omdat de gebruiker de bestanden uit de cache krijgt en daarna worden de bestanden opgehaald uit de browser.

  ![cache-first](docs/img/cache-first.png)
  
### offline page
Het is ook mogelijk om een pagina te tonen als de gebruiker oflline is. Dit kan door in het fetch event een gecachte Html pagina terug te geven als het ophalen van de pagina niet lukt.
  ```javascript
  //service-worker.js
  self.addEventListener("fetch", function (event) {
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request)
          .then(function (res) {
            return caches.open(CACHE_NAME)
              .then(function (cache) {
                cache.put(event.request.url, res.clone());
                return res;
              });
          }).catch(err => {
              if (event.request.headers.get('accept').includes('text/html'))
                return caches.match('/offline.html')
            })
      })
    )
  });
  ```

## browsersupport
Service workers is een vrij nieuwe techniek, maar wordt al wel in alle moderne browers ondersteund. Je kan dus in alle moderne browsers aangeven dat je bestanden wilt opslaan in de cache en deze wilt tereggeven als de de browser om deze bestanden vraagt.

![browser support service worker](docs/img/browsersupport-serviceworker.png) 

## service worker in RoutiDo
We hadden in de branch `setup-web-app-manifest` al gekeken welke onderdelen het commando `ng add @angular/pwa` uitgevoerd. Dit commando registreerd voor on een service worker. Deze service worker wordt automatisch door Angular gemaakt wanneer de applicatie wordt gebouwd.

`@angular/pwa` komt met een service waarmee we notificatie kunnen afhandelen. Zo kunnen we bijvoorbeeld een snackbar tonen voor 5 seconde als de gebruiker een melding krijgt. Standaard maakt angular een notificatie aan die wordt getoond in het systeem. Deze kunnen we in deze service annuleren aangezien de gebruiker de applicatie geopend heeft.

```typescript
// notification.service.ts
import {Inject, Injectable} from '@angular/core';
import {SwPush} from '@angular/service-worker';
import {HttpClient} from '@angular/common/http';
import {MatSnackBar} from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private swPush: SwPush, @Inject('VAPID_KEY') private vapidKey: string, private http: HttpClient, snackbar: MatSnackBar) {
    this.swPush.messages
      .subscribe((msg) => {
        snackbar.open(JSON.stringify(msg), {
            duration: 5000
        });
      });
  }
}
```
Verder biedt Angular een bestand aan genaamd `ngsw-config.json`. Hierin kan worden geconfigureerd hoe het systeem moet cachen en wat daarvoor moet gebeuren. Zo kan  er gekozen om alle statische bestanden te cachen als de gebruiker de service worker installeerd. of je kan ervoor kiezen om deze op te slaan als deze nodig zijn. Ook kan je aangeven welke bestanden uit dit project gecached moeten worden.

```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    }, {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(eot|svg|cur|jpg|png|webp|gif|otf|ttf|woff|woff2|ani)"
        ]
      }
    }
  ]
}
```
