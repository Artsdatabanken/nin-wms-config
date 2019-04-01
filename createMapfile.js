const fs = require("fs");
const tinycolor = require("tinycolor2");

const defs = readColors();
const file = mapFile(defs);
console.log(file);

function mapFile(defs) {
  return `
MAP
  IMAGETYPE      PNG
  SIZE           800 600
  SHAPEPATH      "./data/LA/"
  IMAGECOLOR     255 0 255
  PROJECTION
    "init=epsg:32633"
  END

  WEB
    METADATA
      WMS_ENABLE_REQUEST "*"
    END
  END

${mapFileLayers(defs)}

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
  if (layer1 === "NN-LA-TI-I") debugger;
  const node = defs[layer1];
  const tittel = node.navn;
  const parts = layer.split("-");
  if (parts.length > 1) parts.pop();
  const prefix = parts.join("-");
  return `
  LAYER NAME "${layer}"
    CONNECTIONTYPE OGR
    CONNECTION "/data/${node.url}/polygon.spatialite.4326.sqlite"
    DATA "${prefix.toLowerCase()}"
    CLASSITEM "code"
    TYPE         POLYGON
    METADATA
      "title" "${tittel}"
    END
    PROJECTION
      "init=epsg:32633"
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
    const parts = kode.split("-");
    const def = {
      kode: kode,
      sortkey: parts.pop(),
      layer: parts.join("-"),
      url: type.overordnet.length > 0 && type.overordnet[0].url,
      ...tinycolor(type.farge).toRgb()
    };
    if (!(def.layer in layers))
      layers[def.layer] = { navn: type.tittel.nb, barn: [], url: def.url };
    layers[def.layer].barn.push(def);
  });
  return layers;
}
