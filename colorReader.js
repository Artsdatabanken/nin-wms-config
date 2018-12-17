// Read Synchrously
var codeDict = {}
var classDict = {}
var parentDict = {}
var sortDict = {}

function sortNumber(a,b) {
        return a - b;
    }

function findParent(code){
   let codeSplit=code.split('-')
   let codeParent=''
   for (var i = 0; i < codeSplit.length -1 ; i++){
     codeParent+=codeSplit[i] + '-'
   }
   codeParent = codeParent.replace(/-+$/, "")
   codeDict[code] = codeParent
   let codeNumber = codeSplit[codeSplit.length -1]
   if (!isNaN(codeNumber)) {
     if(codeParent in sortDict){}
     else{
       sortDict[codeParent] = []
     }
     sortDict[codeParent].push(parseInt(codeNumber))
   }
   return codeParent;
}

function makeAllLayers(){
  let layers = ''
  Object.keys(parentDict).forEach(parent => {
	  let layer = makeLayer(parent)
	  layers+=layer
  })
  return layers
}

function makeClass(code, color){
   return `
    CLASS
       EXPRESSION /^${code}.*$/
       NAME "${code}"
       STYLE
	 OUTLINECOLOR "${color}"
	 WIDTH 2
         COLOR "${color}"
       END
    END
`
}

function makeLayer(parent){
   let classes = ''
   if(parent in sortDict){
     sortDict[parent].sort(sortNumber)
     sortDict[parent].forEach(code => {
       classes+=classDict[parent + '-' + code]
    })
   }
   else{
     parentDict[parent].sort().forEach(code => {
       classes+=classDict[code]
    })
   }

   return `
  LAYER
    INCLUDE '../headers/la'

    NAME "${parent}"
    PROCESSING "NATIVE_FILTER=code like '${parent}-%'"
    ${classes}
  END
`
}

function structureParents(){
  Object.keys(codeDict).forEach(code => { 
    let parent = codeDict[code]
    if (parent in parentDict){
    }
    else {
      parentDict[parent] = []
    }
    parentDict[parent].push(code)
  }
  )
}

let fs = require("fs");

let colorJsonString = fs.readFileSync("colors/farger.json");

let colors = JSON.parse(colorJsonString);

Object.keys(colors).forEach(code => {
    if (code !== 'meta' && code.startsWith('LA') && !code.startsWith('LA-KLG')){ 
      let color = colors[code]
      codeDict[code]=findParent(code)
      classDict[code]=makeClass(code, color)
    }
  })

structureParents()

console.log(makeAllLayers());

