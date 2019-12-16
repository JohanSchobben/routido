## Push notificaties
Een push notificatie van een Progressive Web App ziet er hetzelfde uit als een notificatie van native apps. Pushnotificaties in de browser bestaan uit twee verschillende API’s. De Notification API en de Push API. 

De Notification API is verantwoordelijk voor het tonen van notificaties. De notificaties worden door het besturingssysteem getoond en niet door browser. De notificatie wordt altijd via de service worker getoond. Op die manier wordt de melding altijd getoond als, zelfs als de gebruiker direct zijn browser afsfsluit. 

Om een notificatie te tonen moet de gebruiker eerst toestemming geven. Daarna kunnen notificaties worden aangemaakt en worden getoond aan de gebruiker van de PWA.
```javascript
// some-file.js (not sevice-worker.js)
Notification.requestPermission().then(function(permission){
    if (permission === "granted"){
	      navigator.serviceWorker.ready
          .then(function (swreg) {
            swreg.showNotification("Dit is een melding", {/* Dit object wordt hieronder uitgelegd */})
          });
    }
});

```
Als tweede parameter wordt een object meegegeven. Dit object heeft de volgende eigenschappen:

- **body:** Dit is een extra stuk tekst wat onder de notificatie wordt weergegeven.
- **icon:** Dit is een URL naar een afbeelding die aan die als icoon in de notificatie gebruikt kan worden.
- **badge:** Dit is ook een URL naar een afbeelding. Deze wordt getoond als er niet genoeg ruimte is: Bijvoorbeeld in de statusbalk van een Android telefoon.
- **dir:** de leesrichting van de notificatie.
- **lang:** De taal waarin de notificatie wordt weergegeven.
- **image:** Dit is een URL naar een afbeelding die aan de zijkant van melding wordt geplaatst.
- **requireInteraction:** Als deze boolean waar is, zal de melding openblijven, totdat hierop is gedrukt of deze geannuleerd wordt.
- **silent:** Als silent waar is, dan wordt de notificatie wel getoond op het scherm, dan zal het scherm niet aanspringen, het notificatiegeluid niet worden afgespeeld en het scherm uitblijven.
- **tag:** Deze kun je gebruiken om het notificaties te groeperen. Als de notificatie van dezelfde host afkomt en dezelfde tag heeft zal deze door het systeem worden gegroepeerd.
- **vibrate:** een lijst van nummers waarmee je kan aangeven hoe de telefoon moet vibreren. `[100,200,300]` betekent 100 miliseconde aan , vervolgens 200 miliseconde uit en daarna weer 300 miliseconde aan
- **actions:** Een lijst van acties die kunnen worden uitgevoerd op de notificatie. Deze komen meestal onder de melding als knoppen te staan. Een actie bestaat uit de volgende punten.
  - **action:** dit is het type actie, wat wordt meegegeven aan het notificationclick event.
  - **title:** de tekst op de knop.
  - **icon** het icoon wat dat voor de browser wordt getoond

Zo kun je de volgende eigenschappen meegeven:
```javascript
Notification.requestPermission().then(function(permission){
    if (permission === "granted"){
	      navigator.serviceWorker.ready
          .then(function (swreg) {
            swreg.showNotification("Todolijst afgerond", {
              body: "Je hebt todolijst stagevoorstel afgerond",
              badge: '/img/favicon/favicon96.png',
              icon: '/icons/chrome.svg',
              vibrate: [200, 50, 100],
              silent: false,
              data: {
                url: '/'
              },
              tag: 'id:1'
            });
          });
    }
});
```
![Push notification example](docs/img/push-layout.png)

## Het luisteren naar push events.

In de service worker kan worden geluisterd naar het push event. Mocht de browser dan een push notificatie ontvangen, dan kan hierop worden gereageerd. Zo zou eerst de nieuwe toestand kunnen worden opgeslagen in een objectstore van indexedDB. Als dan vervolgens een notiificatie toont om aan te geven dat de status van het pakketje is aangepast, kan deze gelijk worden getoond aan de eindgebruiker, zonder hem eerst op te halen van de server. 

Het luisteren naar push events in de browser kan op verschillende manieren worden geïmplementeerd. Zo wordt op desktops alleen naar push events geluisterd als de browser open is (de applcatie hoeft niet open te zijn). In android wordt echter ook naar push events geluisterd als de browser is afgesloten.

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

## browsersupport
Push notificatie zijn een krachtig hulpmiddel om de gebruiker op de hoogte te houden van de status van zijn bericht. Echter zijn pushnotificaties nog vrij nieuw en worden nog niet in elke browser ondersteund. Zo kan je Op IOS geen gebruik maken van Push Notificaties. Je kan daardoor als eindgebruiker geen notificaties via de browser ontvangen.

![browser support push](docs/img/browsersupport-push.png)


![browser support notification](docs/img/browsersupport-notification.png)

## Push notificaties in  RoutiDo
*in RoutiDo zijn pushnotificaties uitgeschakeld, dit komt door problemen met de backend. De focus van dit project ligt ook bij het maken van een PWA en niet bij het maken van een backend.*

*echter zou in een productie omgeving een gebruiker meerdere apparaten hebben. Deze apparaten hebben geven aan de server een aantal eigenschappen mee zoals het endpoint van de telefoon en een authorizatie object.*

In RoutiDo maken we gebruik van een service. Deze service communiceert met `SwPush`, de service van Angular om naar pushmeldingen te luisteren en erop te reageren. Er wordt via een eigen service mee gecommuniceerd. Op die manier blijft deze logica gescheiden van de views. Dit gebeurd ook in de notificationService hieronder. We hebben een methode om naar de notificatie te luisteren om te registreren op push events.

```typescript
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
        msg.
        snackbar.open(JSON.stringify(msg));
        setTimeout(() => {
          snackbar.dismiss();
        }, 5000);
      });
  }



  get isEnabled(): boolean {
    return this.swPush.isEnabled;
  }

  public async requestPermission() {
    if (this.swPush.isEnabled) {
      const subscription = await this.swPush.requestSubscription({
        serverPublicKey: this.vapidKey
      });

      this.http.post('https://todo-afstuderen.firebaseio.com/subscriptions.json', subscription)
        .subscribe();
    }
  }
}

```