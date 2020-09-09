# Vinou - Translations library

> ***The Vinou platform itself depends on this library and therefore it is continuously integrated and right under development. Regarding this the translation files contains work on every period of our platform work.***

The following README documents the current status quo of translation definition rules. Regarding the huge amount of language keys and other webprojects that are depending on older coding guidelines the translation files looks sometimes really confusing.

## 1. Contribution

If you want to contribute, feel free to join and create pull request. We want to be sure that most of depending web projects could easily be updated, therefore it could take some time that your work is added. Feel free to contact us via PN, mail to kontakt@vinou.de or phone call to +49 61316245390.

## 2. Coding Guidelines

1. If A key is used for an array of keys it is always plural, for example countries or wineregions
2. If A key identifies an Object or only a String it is always singular, fo example wine, product, bundle
3. Identifiers should be camel case
4. Hyphens are not allowed
5. If an object is used in more than two other objects you can use the general object
6. If an object containes multiple static options the values should be defined in the parent object as array, for example: the product object has a field type with 3 static options, the options should be defined as object types in product.
```json
"product": {
  "fields": {
    "type": "Type of product"
  },
  "types": {
    "option1": "Option 1",
    "option2": "Option 2",
    "option3": "Option 3"
  }
}
``` 

## 3. Standard object keys

|key                  |description                 |
|:--------------------|:---------------------------|
|views|Special defined page views|
|tabs|Tabs in a view|
|fieldSets|Form area in tab ore view|
|fields|Field indentifiers normally a string directly used as label|
|label|Label for formfield if more than a label is defined for a field|
|placeholder|Placeholder for formfield|
|filters|Filter properties used in view, tab oder fieldSet|
|actions|Special actions available for this object, an action key could directly used as String|
|actions.[ACTION].modaltitle|Headline of modal that executes this action|
|actions.[ACTION].main|First line of action button in application|
|actions.[ACTION].sub|Second line of action button in application|
|toasts|Toasts regarding this object|
|dialogs|Dialog texts regarding this object|
|hints|Hints for this object in views, tabs, fieldsets|

## 4. Object example

```json
"bundle": {
  "actions": {
    "create": {
      "modaltitle": "Weinpaket anlegen",
      "main": "Neues Weinpaket",
      "sub": "anlegen"
    },
    "search": {
      "placeholder": "z.B. Name, Beschreibung"
    },
    "export": {
      "qrCodeVector": "QR-Code als Vektor-Datei herunterladen",
      "barcodeVector": "EAN-Code als Vektor-Datei herunterladen"
    },
    "addItem": "+ Artikel hinzufügen"
  },
  "views": {
    "files": {
      "title": "Dateien",
      "empty": "Es liegen keine {label} zu diesem Weinpaket vor."
    }
  },
  "filters": {
    "category": {
      "label": "Kategorie auswählen",
      "none": "Pakete ohne Kategorie anzeigen"
    }
  },
  "tabs": {
    "files": "Dateien"
  },
  "fieldSets": {
    "general": "Allgemeines",
    "facts": "Daten & Fakten",
    "prices": "Preise",
    "barcode": "EAN-Code",
    "shopSettings": "Website & Shop-Einstellungen",
    "qrcode": "QR-Code",
    "items": "Artikel"
  },
  "fields": {
    "active": "aktiv",
    "articlenumber": "Art.-Nr.",
    "category": "Kategorie",
    "baseprice": "Preis pro Liter",
    "description": "Beschreibung",
    "metaDescription": "Meta-Description",
    "metaTitle": "Title-Tag",
    "name": "Name",
    "packageQuantity": "Verpackungsäquivalent (in 0,75l Flaschen)",
    "pathSegment": "Pfadsegment",
    "qrcodeLink": "Zieladresse für QR-Code",
    "quantity": "Anzahl",
    "searchArticle": "Artikel suchen",
    "singleItemPrice": "Stück",
    "size": "Füllmenge",
    "sorting": "Manueller Sortierindex (z.B. für den Shop)",
    "tag": "Tags",
    "topseller": "Topseller",
    "itemSum": {
      "label": "Warenwert",
      "net": "Netto",
      "gross": "Brutto"
    }
  },
  "toasts": {
    "created": "Weinpaket angelegt!",
    "changed": "Weinpaket geändert!",
    "deleted": "Weinpaket gelöscht!",
    "imageUploaded": "Bild zum Weinpaket hochgeladen!",
    "imageDeleted": "Bild zum Weinpaket gelöscht",
    "copied": "Weinpaket dupliziert"
  },
  "dialogs": {
    "delete": "Möchtest Du dieses Weinpaket wirklich löschen?",
    "deleteItem": "Möchtest Du diesen Artikel wirklich entfernen?"
  },
  "hints": {
    "imagesize": "<b>Empfehlung für optimale Darstellung</b><br>Abmessungen: 1500x1500px<br/>Datei-Format: .png (freigestellt)",
    "packageQuantity": "Platz im Versandkarton in Standard-Weinflaschen"
  },
  "files": {
    "title": "Dateien und Dokumente zu diesem Weinpaket"
  }
}
```

## Provider

This Library is developed by the Vinou GmbH.

![](http://static.vinou.io/brand/logo/red.svg)

Vinou GmbH<br> 
Mombacher Straße 68<br>
55122 Mainz<br>
E-Mail: [kontakt@vinou.de](mailto:kontakt@vinou.de)<br>
Phone: [+49 6131 6245390](tel:+4961316245390)
