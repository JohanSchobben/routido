#indexed db
Voor het opslaan van dynamische content indexedDb worden gemaakt. IndexedDb is een NoSQL database in de browser. IndexedDb wordt door alle moderne browsers ondersteund. Omdat deze functionaliteit vrij oud is werkt deze vooral met [callbacks](https://developer.mozilla.org/en-US/docs/Glossary/Callback_function).

In indexedDb wordt een Database aangemaakt. Een database bevat objectsotres, waarin de dat wordt opgeslagen. Er kunenn meerdere databases worden aangemaakt in een applicatie, maar over het algemeen wordt er maar gebruikt.

In een database heb je verschillende objectstores. Een objectstore bestaat uit key-value paren, waarbij de value vanalles mag zijn Blobs, objecten, string, numbers en booleans. Een objectstore heeft hiervoor geen resctricties. Echter wordt wel aangeraden om per objectstore dezelfde structuur op te slaan en voor verschillende datasctructuren in verschillende objectstores te gebruiken. Dus een objectstore bijvoorbeeld bezorgingen en een ander voor afbeeldingen van afleverinstructies.

Om data in een objectstore makkelijk te kunnen vinden wordt gebruik gemaakt van indexen. Een index opgeslagen in zijn eigen objectstore. Deze index bevat een eigenschap van het object, wat gebruikt kan worden om specifieke items op te zoeken in een de object store.

In IndexedDb werk je met transacties. Als meerdere aanpassingen moet uitvoeren doe je  dit in een transacties. Mocht dan een van de acties fout gaan en niet opgeslagen worden, dan wordt de rest ook niet opgeslagen. Hierdoor ben je er zeker van dat alle data in orde blijft.

Om met indexedDb te werken moet eerst een verbinding worden gemaakt met de database. Deze database open je door een naam en versienummer op te geven. Als er geen database is met deze naam en versienummer, dan zal deze worden aangemaakt. Tijdens het aanmaken van de database zal dan het upgradeneeded event worden afgevuurd. 

Met het upgradeneeded event kan een functie worden uitgevoerd, die de objectstores aanmaakt. Ook wordt aangegeven wat de key voor je data. Dit kan auto increment zijn die je door de database laat genereren, maar kan ook een eigenschap van het Javascript object zijn.
```javascript
let db;
const request = window.indexedDB.open("todo-db", 1);
request.onupgradeneeded = function(event){
  const connection = event.target.result;
  const todoObjectStore = connection.createObjectStore("todo-store", {keyPath: "id"});
  todoObjectStore.createIndex("todoindex", "id", {unique: true});
};

request.onsuccess = function (event) {
  db = request.result;
  resolve(db);
};
```
Als de verbinding met de database is gemaakt, wordt het success event afgevuurd.  Hierop kan ook een callback worden bepaald, Aan deze callback wordt een event object meegegeven. Hierin zit het database object wat weer kan worden gebruikt voor het maken van aanpassingen aan de database. 

Hieronder een voorbeeld voor het openen van een database en het ophalen van de data:

```javascript
const request = window.indexedDB.open("todo-db", 1);
request.onupgradeneeded = function(event){
 const connection = event.target.result;
 const todoObjectStore = connection.createObjectStore("todo-store", {keyPath: "id"});
 todoObjectStore.createIndex("todoindex", "id", {unique: true});
};

request.onsuccess = function (event) {
 // er is een verbinding met de database
 const db = event.target.result;
 db.transaction(objectStore)
   .objectStore(objectStore)
   .getAll()
   .onsuccess = function(todos){
    // todos zijn de todolijsten als javascript object.
   }
};
```
Om todolijsten op te slaan kan de add methode worden gebruikt.

```javascript
const request = db.transaction(objectStore, "readwrite")
      .objectStore(objectStore)
      .add(data);

    request.onsuccess = function(event){
      // de todolijst is succesvol opgeslagen
    };

    request.onerror = function(event) {
      // er is iets fout gegsaan waardoor het object niet kan worden opgeslagen.
    }
```

Dit werkt hetzelfde voor het verwijderen en updaten van data.

voor verwijderen:
```javascript
const request = db.transaction(objectStore, "readwrite")
  .objectStore(objectStore)
  .delete(id);

request.onsuccess = function(event){
  // er ging iets mis tijdens het aanpassen van de data
};

request.onerror = function(event) {
  // er ging iets mis met het verwijderen van het object
};
```

Voor het updaten van data
```javascript


const request = db.transaction(objectStore, "readwrite")
  .objectStore(objectStore)
  .put(data);

request.onsuccess = function (event) {
  // het object is aangepast
};

request.onerror = function (event) {
  // er ging iets mis tijden het aanpassen
};
```



## Browsersupport

Indexed db is de oudste API die gebruikt wordt in RoutiDo. Indexeddb wordt in elke browser ondersteund, zelfs in Internet Explorer.
![browser support indexed db](docs/img/browsersupport-indexeddb.png) 

##indexed DB in RoutiDo
Binnen RoutiDo wordt gebruikt gemaakt van een Library genaamd [idb](https://github.com/jakearchibald/idb). Deze is geschreven door Jake Archibald een softwareontwikkelaar die werkt voor Google. Idb, maakt het mogelijk om Promises te gebruiken in plaats van callbacks. Op deze manier is de code leesbaarder en can beter geïntergreerd worden met RXjS. Om deze te communicren met IDB wordt een service gebruikt.

```javascript
import {Inject, Injectable} from '@angular/core';
import {openDB} from 'idb';
import {TodoList} from './model/TodoList.model';

@Injectable({
    providedIn: 'root'
})
export class IndexedDbService {
    db: Promise<any>;
    constructor(@Inject('DB_NAME') DB_NAME: string, @Inject('DB_VERSION') DB_VERSION: number) {
        this.db = openDB(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion, newVersion, transaction) {
                const objectStore  = db.createObjectStore('todos', {
                    keyPath: 'id'
                });
                objectStore.createIndex('todoindex', 'id', {unique: true});
            }
        });
    }

    async store(todoList: TodoList) {
        const db = await this.db;
        const action = db.transaction('todos', 'readwrite')
            .objectStore('todos')
            .add(todoList.toObject());
        return await action.done;
    }

    async readData(): Promise<TodoList[]> {
        const db = await this.db;
        const action = db.transaction('todos', 'readonly')
            .objectStore('todos');
        const objects = await action.getAll();

        return objects.map(obj => {
            const todoList = new TodoList();
            todoList.id = obj.id;
            todoList.name = obj.name;
            todoList.tasks = obj.tasks;
            return todoList;
        });
    }

    async putData(todoList: TodoList) {
        const db = await this.db;
        const action = await db.transaction('todos', 'readwrite')
            .objectStore('todos')
            .put(todoList.toObject());
        return await action.done;
    }

    async deleteData(id: string) {
        const db = await this.db;
        const action = await db.transaction('todos', 'readwrite')
            .objectStore('todos')
            .delete(id);
    }
}
```