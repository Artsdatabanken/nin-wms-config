## Custom tool to create a MapServer configuration file for

* [Sample test url](https://wms.artsdatabanken.no/?map=/maps/mapfiles/la.map&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX=58,0,72,35&CRS=EPSG:4326&WIDTH=900&HEIGHT=734&LAYERS=LA-K-F&FORMAT=jpeg)

## Example input file

```json
{
  "meta": {
    "tittel": "Landskap",
    "produsertUtc": "2019-01-08T19:00:12.122Z",
    "utgiver": "Artsdatabanken",
    "url": "https://maps.artsdatabanken.no/LA/typer.json",
    "elementer": 349
  },
  "LA-I-A": {
    "tittel": {
      "nb": "Innlandsås- og fjellandskap",
      "en": "Hills and mountains"
    },
    "foreldre": ["LA-I"],
    "kartformat": { "vector": { "zoom": [0, 8], "format": "pbf" } },
    "bbox": [[58, 4.748], [71.178, 31.047]],
    "farge": "hsl(63, 26%, 77%)"
  },
  "LA-I-A-1": {
    "tittel": {
      "nb": "Dalformet ås- og fjellandskap under skoggrensen",
      "en": "Concave-shaped hills"
    },
    "foreldre": ["LA-I-A"],
    "kartformat": { "vector": { "zoom": [0, 8], "format": "pbf" } },
    "bbox": [[58.087, 4.971], [70.91, 30.954]],
    "farge": "hsl(77, 31%, 73%)"
  }
}
```
