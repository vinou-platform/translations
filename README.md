# Vinou - Translations library

> ***The Vinou platform itself depends on this library and therefore it is continuously integrated and right under development. Regarding this the translation files contains work on every period of our platform work.***

The following README documents the current status quo of translation definition rules. Regarding the huge amount of language keys and other webprojects that are depending on older coding guidelines the translation files looks sometimes really confusing.

### Table of contents

- [1. Contribution](#1-contribution)
- [2. Coding Guidelines](#2-coding-guidelines)
- [3. Standard object keys](#3-standard-object-keys)
- [4. Object example](#4-object-example)
- [5. Twig extension](#5-twig-extension)
- [Provider](#provider)

## 1. Contribution

If you want to contribute, feel free to join and create pull request. We want to be sure that most of depending web projects could easily be updated, therefore it could take some time that your work is added. Feel free to contact us via PN, mail to kontakt@vinou.de or phone call to +49 61316245390.

## 2. Coding Guidelines

1. If A key is used for an array of keys it is always plural, for example countries or wineRegions
2. If A key identifies an Object or only a String it is always singular, for example wine, product, bundle
3. All identifiers have to be lowerCamelCase. Hyphens, underscores or other separators are not allowed. In special cases ids may be used when translation represents static database objects like grapeTypes.
4. If an object is used in more than two other objects, it may be defined under the general object
5. If an object containes multiple static options the values should be defined in the parent object as array, for example: the product object has a field type with 3 static options, the options should be defined as "types" in object "product".
6. All keys should be in alpha numerical order, except properties of base objects (see below).

```json
"product": {
  "fields": {
    "type": "Type of product"
  },
  "types": {
    "optionOne": "Option 1",
    "optionTwo": "Option 2",
    "optionThree": "Option 3"
  }
}
``` 

## 3. Standard object keys

Each object may define certain standard keys shown below in preferred definition order.

|key                  |description                 |
|:--------------------|:---------------------------|
|name|Singular and plural names of an entity|
|actions|Special actions available for this object. Actions may be defined as single string or object of the following form:|
|actions.[ACTION].main|First line of action button in application|
|actions.[ACTION].sub|Second line of action button in application|
|fields|Field indentifiers normally a string directly used as label|
|fields.[FIELD].label|Label for form field if more than a label is defined for a field|
|fields.[FIELD].placeholder|Placeholder for form field|
|fields.[FIELD].hint|Special hint for a form field|
|fieldSets|Form areas to devide fields into seperate sections|
|views|Special defined views like pages, tabs, ...|
|filters|Filter properties used in view, tab oder fieldSet|
|dialogs|Dialog texts regarding this object|
|toasts|Toasts regarding this object. Toast keys shall be defined in past tense for standard toasts or present tense followed by "Error" for error toasts|
|hints|Hints for this object in views, tabs, fieldsets|
|[xyzTypes]|Object related types or categories|

## 4. Object example

```json
"bundle": {
  "name": {
    "singular": "Weinpaket",
    "plural": "Weinpakete"
  },
  "actions": {
    "addItem": "+ Artikel hinzufügen",
    "create": {
      "main": "Neues Weinpaket",
      "sub": "anlegen"
    }
  },
  "fields": {
    "active": "aktiv",
    "articleNumber": {
      "label": "Art.-Nr.",
      "placeholder": "SKU 000 - 0000000"
    },
    "category": "Kategorie",
    "description": "Beschreibung",
    "sorting": "Manueller Sortierindex (z.B. für den Shop)"
  },
  "fieldSets": {
    "facts": "Daten & Fakten",
    "general": "Allgemeines",
    "items": "Artikel"
  },
  "views": {
    "create": {
      "title": "Neues Weinpaket erstellen"
    },
    "files": {
      "title": "Dateien",
      "empty": "Es liegen keine {label} zu diesem Weinpaket vor."
    }
  },
  "filters": {
    "category": {
      "label": "Kategorie auswählen",
      "none": "Pakete ohne Kategorie anzeigen"
    },
    "search": {
      "placeholder": "z.B. Name, Beschreibung"
    },
  },
  "dialogs": {
    "delete": "Möchtest Du dieses Weinpaket wirklich löschen?"
  },
  "toasts": {
    "changed": "Weinpaket geändert!",
    "changeError": "Weinpaket konnte nicht geändert werden!",
    "created": "Weinpaket angelegt!",
    "createError": "Weinpaket konnte nicht angelegt werden!",
    "deleted": "Weinpaket gelöscht!",
    "deleteError": "Weinpaket konnte nicht gelöscht werden!",
    "imageDeleted": "Bild zum Weinpaket gelöscht",
    "imageUploaded": "Bild zum Weinpaket hochgeladen!"
  },
  "hints": {
    "imageSize": "<b>Empfehlung für optimale Darstellung</b><br>Abmessungen: 1500x1500px<br/>Datei-Format: .png (freigestellt)"
  },
  "packageTypes": {
    "mixed": "Gemischt",
    "surprise": "Überaschungspaket",
    "wineOnly": "Nur Wein",
  }
}
```

## 5. Twig Extension

This library also contains a Twig extension. To implement this extension you can use this code.
```php
  $languageKey = 'de';
  $twig = new \Twig\Environment();
  $twig->addExtension(new \Vinou\Translations\TwigExtension($languageKey));
```

Afterwards you can use the translate filter in your template like this:
```twig
  <p id="wine">
    <a class="action-button">
      <span class="main">{{ 'wine.actions.create.main' | translate }}</span>
      <span class="sub">{{ 'wine.actions.create.sub' | translate }}</span>
    </a>
  </p>
```

## Provider

This Library is developed by the Vinou GmbH.

![](http://static.vinou.io/brand/logo/red.svg)

Vinou GmbH<br> 
Mombacher Straße 68<br>
55122 Mainz<br>
E-Mail: [kontakt@vinou.de](mailto:kontakt@vinou.de)<br>
Phone: [+49 6131 6245390](tel:+4961316245390)
