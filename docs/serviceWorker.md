#Service worker
Voor het maken van een Progressieve Web App heb je een service worker nodig. De service worker is het middelpunt van je applicatie. Hierin kan je keuze maken die effect hebben op je applicatie. De service worker doet op zichzelf niet veel. Dit is een Javascript wat wanneer het eenmaal geregistreerd kan luisteren naar verschillende events. Aan de hand van deze events kun je verschillende acties laten uitvoeren door de gebruiker.

Een service worker is een gewoon Javascript bestand met een paar aanpassingen. Zo draait deze in een andere thread. Hierdoor heeft het geen toegang tot sommige javascript API’s zoals de DOM. Ook draait is een Service worker de browser en niet in een tabblad. Hierdoor kan deze actief blijven zelfs wanneer het tabblad van de browser wordt afgesloten. Dit betekent ook dat er maar instantie van de service worker kan zijn als de browser actief is.

Om een service te kunnen registreren moet je website draaien vanaf een betrouwbare host. Dit betekent dat de applicatie moet worden geserveerd over https en niet over http. Localhost is een uitzondering. Daarop mag ook een service worker worden geregistreerd, om de applicatie te kunnen ontwikkelen. 

Verder is een service worker volledig asynchroon. Daarom kunnen onderdelen die synchroon zoals localstorage niet gebruikt worden in de applicatie.

##Levencyclus van een Service Worker
Een service worker kent een aantal toestanden waarin deze komt in zijn levensduur. Om een service worker op te starten moet je deze registreren. Omdat je niet wilt dat je code breekt in browsers die service workers niet ondersteunen, controleer je eerst of de browser service worker ondersteund.

```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register("/sw.js");
}
```
De service worker zal zichzelf registreren en zal  in de registered toestand terechtkomen. Vervolgens zal hij zichzelf updaten. Als het registreren is gebeurd, zal de browser een nieuwe versie voor het maken het van de applicatie. Eenmaal geïnstalleerd zal de browser kijken of de service worker geactiveerd kan worden. Indien er een oude service worker actief is, kan dit niet en zal het systeem wachten totdat de browser opnieuw wordt opgestart. Als de service worker een tijdje niets heeft gedaan, gaat deze in de IDLE-state. Als de service worker weer iets moet doen zal de browser deze opstarten.

De toestanden van de service worker worden beter uitgelegd in onderstaand diagram:
![toestandsdiagram Service Worker](docs/img/state-serviceworker.png)

Bij het ingaan van deze toestanden vuurt de service worker een aantal events uit. Op deze manier kun je aanhaken op de browser. Hieronder een overzicht van de events en wat je kan doen tijdens dit event.

- **install** 
Het install event wordt uitgevoerd, zodra de service worker is geïnstalleerd. Als dit event wordt afgevuurd kun je ervoor kiezen om de bestanden van de server op te halen en op te slaan in de cache van de browser. Op die manier zijn de bestanden altijd beschikbaar ook als de gebruiker niet werkt aan de browser. 
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
Als een nieuwe versie van de Service worker is geactiveerd wordt het active event afgevuurd. Zo kan je bijvoorbeeld een melding tonen dat de gebruiker gebruik maakt van de nieuwste versie van de service worker. Ook kan je vanaf nu luisteren naar andere events die niet worden afgevuurd door de levenscyclus, maar door de browser zelf. Bijvoorbeeld het fetch en het push event.

- **fetch** 
Het fetch event wordt afgevuurd zodra de gebruiker de gebruiker een bestand probeert op te halen van de server. Over het algemeen gaat het over assets uit de browser. Bijvoorbeeld javascript bestanden, CSS-bestanden of afbeeldingen. Je kan naar deze events luisteren en ervoor kiezen om een gecachte versie van de afbeelding terug te geven.

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
          })
        })
    )
  });
  ```

- **push**
Het push event wordt afgevuurd zodra de browser een push bericht ontvangt. Je kan dan van dit bericht een notificatie maken om de gebruiker op de hoogte te houden van over iets.
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
Het notificationclick event wordt afgevuurd als de gebruiker op de notificatie klikt. Mocht de notificatie acties hebben dan kun je kijken of een van deze is geklikt en hierop acties uitvoeren. Dit bijvoorbeeld zij het openen van de applicatie op een specifieke pagina, maar het kan ook een actie zijn die wordt uitgevoerd door de service worker.

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
          .then(function(cl) {
            const client = cl.find(function(c) {
              return c.visibilityState === 'visible';
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
Het notificationcanel event is het event wat wordt uitgevoerd als de gebruiker een notificatie annuleert. Dit kan zijn door een swipe op een android telefoon en door op kruisje te drukken op een IOS-telefoon.
  ```javascript
  // service-worker.js
  self.addEventListener('notificationclose', function(event) {
    console.log('Notification was closed', event);
  });
  ```

## offlinesupport
Met een service worker is het mogelijk om offlinesupport in te stellen voor je wbsite. Zo kan door het combineren van het fetch event en van het install event de statische bestanden teruggeven die de gebruiker nodig heeft voor het gebruiken van de applicatie. 

Er zijn vier verschillende strategien die gebruikt kunnen worden voor het maken van de applicatie. Dit zijn: Network only, cache only, netowork first cache fallback en cache first network fallback.

- **network only**
Er worden geen bestanden opgeslagen in de cache van de browser. Alle bestanden worden opgehaald van de server. Mocht de gebruiker geen verbinding hebben met het internet dan zullen deze onderdelen niet worden opgehaald. Dit is hetzelfde gedrag als wanneer je geen service worker gebruikt.

  ![network only](docs/img/network-only.png)
  
- **cache only**
Met cache only sla je na het eerste bezoek de bestanden op in de cache. Daarna haal je alle bestanden op uit de cache. Mocht een bestand niet te vinden zijn in de cache dan zal deze niet te laden zijn.

  ![cache only](docs/img/cache-only.png)
  
- **network first, cache fallback**
Met deze strategie is kun je eerst bestanden ophalen van het internet. Mocht dat niet lukken dan kun je deze ophalen van uit de cache. Het voordeel is dat je op deze manier altijd de nieuwste versie hebt. Ook bestaat de mogelijkheid dat je een fallback kan tonen om de applicatie werkend te krijgen. Toch is deze strategie niet heel populair. Mocht namelijk een gebruiker offline zijn en proberen de bestanden dan zal hij/zij eerst een verzoek make en dat laten falen. Dit falen gebeurt bijvoorbeeld nadat de gebruiker zijn TIMEOUT-tijd van het verzoek is overschreden. Als dit bijvoorbeeld 60 seconde is, zal de gebruiker eerst 60 seconde niets zien voordat de versie uit de cache wordt opgehaald.

  ![network first](docs/img/network-first.png)
  
- **cache first, netowork fallback**
Dit is de meest gebruikte cache strategie om offlinesupport aan te bieden. Hiermee heeft de gebruiker altijd snel resultaat, omdat de bestanden uit de cache worden opgehaald. Het nadeel is dat de gebruiker bijna altijd de op-één-na-laatste versie van deze bestanden gebruikt. Dit komt omdat de gebruiker de bestanden uit de cache krijgt en daarna worden de bestanden opgehaald uit de browser.

  ![cache-first](docs/img/cache-first.png)

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
        snackbar.open(JSON.stringify(msg));
        setTimeout(() => {
          snackbar.dismiss();
        }, 5000);
      });
  }
}
```
Verder biedt Angular een bestand aan genaamd `ngsw-config.json`. Hierin kan worden geconfigureerd hoe het systeem moet cachen en wat daarvoor moet gebeuren. Zo kan je ervoor kiezen om alle statische bestanden te cachen als de gebruiker de service worker installeerd. of je kan ervoor kiezen om deze op te slaan als deze nodig zijn. Ook kan je aangeven welke bestanden uit dit project gecached moeten worden.

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
