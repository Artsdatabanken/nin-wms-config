const fs = require("fs");
const tinycolor = require("tinycolor2");

const defs = readColors();
const file = mapFile(defs);
console.log(file);

function mapFile(defs) {
  const layers = mapFileLayers(defs);
  const includeMapTag = false;
  if (!includeMapTag) return layers;

  return `
MAP
  IMAGETYPE      PNG
  SIZE           800 600
  SHAPEPATH      "./data/LA/"
  IMAGECOLOR     255 0 255
  PROJECTION
    "init=epsg:4326"
  END

  WEB
    METADATA
      WMS_ENABLE_REQUEST "*"
    END
  END
${layers}
END
`;
}

function mapFileLayers(defs) {
  return Object.keys(defs)
    .map(layer => {
      return mapFileLayer(defs, layer);
    })
    .join("\n");
}

function mapFileLayer(defs, layer1) {
  if (!layer1.startsWith("NN-LA-TI-")) return;
  const layer = hackKodeFordiUtdaterteKartdata(layer1);
  const node = defs[layer1];
  const tittel = node.navn;
  const parts = layer.split("-");
  //  if (layer1 === "NN-LA-TI-I") debugger;
  if (parts.length > 1) parts.pop();
  const prefix = parts.join("-");
  return `
  LAYER NAME "${layer}"
    CONNECTIONTYPE OGR
    CONNECTION "/data/${node.url}/polygon.spatialite.4326.sqlite"
    DATA "${layer.toLowerCase().replace(/-/g, "_")}"
    CLASSITEM "code"
    TYPE         POLYGON
    TEMPLATE "../templates/la.html"
    METADATA
      "title" "${tittel}"
      "gml_include_items" "all"
    END
    PROJECTION
      "init=epsg:4326"
    END
    CLASSITEM "code"
${writeClasses(defs, layer1).join("\n")}
  END`;
}

function writeClasses(defs, kode) {
  const layer = defs[kode].barn;
  layer.sort((a, b) => a.sortkey - b.sortkey);
  return layer.map(def => {
    if (!(def.kode in defs)) return mapFileClass(def);
  });
}

function mapFileClass(def) {
  const { kode, r, g, b } = def;
  let hackKode = hackKodeFordiUtdaterteKartdata(kode);
  return `
    CLASS NAME "${hackKode}"
      EXPRESSION ('[code]'='${hackKode}')
      STYLE
        OUTLINECOLOR ${r} ${g} ${b}
        #WIDTH 2
        COLOR ${r} ${g} ${b}
      END
    END`;
}

function hackKodeFordiUtdaterteKartdata(kode) {
  return kode.replace("-TI", "").replace("NN-", "");
}

function readColors() {
  const data = fs.readFileSync("data/metadata_med_undertyper.json");
  const typer = JSON.parse(data).data;
  const layers = {};
  const foreldrenoder = {};
  Object.keys(typer).forEach(kode => {
    const foreldre = typer[kode].foreldre || [];
    foreldre.forEach(forelder => {
      foreldrenoder[forelder] = true;
    });
  });

  typer.forEach(type => {
    const kode = type.kode;
    if (kode.startsWith("meta")) return;
    if (kode.startsWith("NN-LA-KLG")) return;
    if (kode in foreldrenoder) return;
    const forelder = type.overordnet[0] || {};
    const parts = kode.split("-");
    const def = {
      kode: kode,
      sortkey: parts.pop(),
      layer: parts.join("-"),
      url: forelder.url,
      ...tinycolor(type.farge).toRgb()
    };
    if (!(def.layer in layers))
      layers[def.layer] = { navn: forelder.tittel.nb, barn: [], url: def.url };
    layers[def.layer].barn.push(def);
  });
  return layers;
}
