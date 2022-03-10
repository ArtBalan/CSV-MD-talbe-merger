const {errorDisplay, validate} = require("./error");

/**
 * Load a file and return it as a string
 * 
 * @param {string} path of the file to load 
 * @returns file content as a string
*/
function loadFile(path){
  let fs = require('fs');
  return fs.readFileSync(path, 'utf-8', function (err, data) {
    if(err) {
      errorDisplay(102)
      return null;
    } 
    console.log(data.toString());
    return data.toString();
  });
}
  
/**
 * Write the data into the wanted file
 * 
 * @param {string} data to write
 * @param {string} path of the file to write in
*/
function WriteFile(data,path){
  data = data.join("\n");
  var fs = require('fs');
  fs.writeFileSync(path, data, function (err) {
    if (err) throw err;
  });
}

/**
 * 
 * Retrun the data list with the file wanted objectified added to it
 * 
 * @param {object} data Main list
 * @param {string} path File to import 
 * @param {string} name of the list to create 
 * @param {string} type Type of the file 
 * @returns Main list
*/
function importFile(data, path, name, type ){
  let tempData = [];
  let error = false;
  if(!path) {
    errorDisplay(101);
    error =  true;
  }
  if(error || !name){
    errorDisplay(201);
    error =  true;
  }
  if(name in data){
    error = (validate("This name is already taken, do you want to overwrite it ?"))? error : true;
  }
  if(!error) {
    type = (!type)? path.split('.')[1] : type;
    switch(type){
      case "csv":
        tempData = csvToObject(loadFile(path));
        break;
      case "md":
        tempData = tableToObject(loadFile(path));
        break;
      default :
        errorDisplay(203); 
        error = true;
    }
  }
  if(!error){
    if(tempData.length == 0){
      (validate("Your import is empty, add it to the list anyway ?"))? data[name] = tempData : null;
    } else {
      data[name] = tempData;
    }
  }
  return data;
}

/**
 * 
 * Write a list into a file
 * 
 * @param {object[]} list to write
 * @param {string} path of the file to write in
 */
function exportFile(list, path){
  let error = false;
  if(!path) {
    errorDisplay(101);
    error =  true;
  }
  if(!error){
    let type = path.split('.')[1];
    switch(type){
      case "md":
        WriteFile(objectToTable(list),path);
        break;
      case "csv": 
        WriteFile(objectToCsv(list),path);
        break;
      default : 
        errorDisplay(203);
    }
  }
}

/**
 * 
 * Transform a sting into an object list
 * 
 * @param {string} str String in the csv format
 * @returns an object list
 */
function csvToObject(str){
  let separator = ",";
  str = str.replaceAll("\r","")
  let lines = str.split('\n');
  let keys = [];
  lines[0].split(separator).forEach(e => keys.push((e.replace("\r","")).trim()));  
  return objectify(lines.slice(1), keys, separator,false);
}

/**
 * 
 * Transform a sting into an object list
 * 
 * @param {string} str String in the md table format
 * @returns an object list
 */
function tableToObject(str){
  let separator = "|";
  let lines = str.split('\n');
  let keys = [];
  lines[0].split(separator).forEach(e => keys.push((e.replace("\r","")).trim()));  
  keys = keys.filter(e => e.replace(/\s/g, ''));
  return objectify(lines.slice(2), keys, separator,true);
}

/**
 * "Objectify" a data list based on keys given
 * 
 * @param {object} data to objectify
 * @param {object} keys list of keys
 * @param {string} separator str used to split the data
 * @returns objectified data
 */
function objectify(data, keys,separator,md){
  let success = 0;
  let failed = 0;
  let dataObjectified = [];
  data.forEach(e => {
    let temp = e.split(separator);
    if(md) temp = temp.filter(e => e.replace(/\s/g, ''));
    if(temp.length == keys.length){
      success += 1;
      let tempObject = {};
      for(let i=0; i<temp.length; i++){
       tempObject[keys[i]] = ((temp[i].replace("\n","")).replace("\r","")).trim();
      }
      dataObjectified.push(tempObject);
    } else {
      failed += 1;
    }
  });
  console.log(success + " Entry imported.");
  console.log(failed + " Entry failed.");
  return dataObjectified;
}

/**
 * 
 * Transform a list into a md table formated sting list
 * 
 * @param {object[]} objects 
 * @returns a list of string in the md table format
 */
function objectToTable(objects){
  let table = [];
  let keys = Object.keys(objects[0]);
  // keys line
  let tempstr = "| ";
  keys.forEach(key =>{ tempstr += ( key + " | "); });
  table.push(tempstr);
  // separation line
  tempstr = "| ";
  keys.forEach(key => {tempstr +=  ("-".repeat(key.length)+ " | ");});
  table.push(tempstr);
  // datas
  objects.forEach(entry => {
  tempstr = "| ";
    keys.forEach(key => {
    tempstr += (entry[key] != "")? entry[key] : 0;
    tempstr += " | ";
    });
    table.push(tempstr)
  });
  return table;  
}

/**
 * 
 * Transform a list into a csv formated sting list
 * 
 * @param {object[]} objects 
 * @returns a list of string in the csv format
*/
function objectToCsv(objects){
  let table = [];
  let keys = Object.keys(objects[0]);
  // keys line
  let tempstr = "";
  keys.forEach(key =>{ tempstr += key + " , "; });
  table.push(tempstr.slice(0,-2));
  // datas
  objects.forEach(entry => {
  tempstr = "";
    keys.forEach(key => {
    tempstr += (entry[key] != "")? entry[key] : 0;
    tempstr += " , ";
    });
    table.push(tempstr.slice(0,-2));
  });
  return table;  
}

/**
 * 
 * Merge two list into a third one based on a key
 * 
 * @param {object[]} data Main List
 * @param {string} name1 Name of the object list to merge into
 * @param {string} name2 Name of the object list to add into the main one
 * @param {string} key Name of the key to base the merge on
 * @param {string} out Name of the object list resulting of the merge
 * @returns Main List
 */
function merge(data, name1, name2, key, out){
  console.log(out);
  let error = false;
  let added = 0;
  let merged = 0;
  if(out in data){
    error = (validate("This name is already taken, do you want to overwrite it ?"))? error : true;
  }
  if(!(name1 in data) || !(name2 in data)){
    errorDisplay(301);
    error = true;
  }
  if(!error){
    let l3 = [];
    data[name1].forEach(e=>l3.push(e));
    l2 = data[name2];
    let keys = Object.keys(l3[0]);
    // Deal with that
    l3.forEach(e => { 
      l2.forEach(f => {
         if(e[key] == f[key]){ 
           keys.forEach(key =>
             { (e[key] == "0")? e[key] = ((f[key])? f[key] : "0") : "0";});
            }
      });
    });
    // Might do the same as above
    l2.forEach(e => {
      let isIn = false;
      l3.forEach(f => {
        if(e["id"] == f["id"]){
          isIn = true;
        }
      });
      if(!isIn){ 
        l3.push(e);
        added += 1;
      }
    });
    data[out] = l3;
  }
  console.log(added + " Entry added to " + out);
  return data;
}

/**
 * 
 * Allow the user to tranform a list field
 * 
 * @param {object[]} data Main list
 * @param {string} name List name 
 * @param {string} key on whitch to apply the function 
 * @param {string} fct function to apply 
 */
function edit(data, name, key, fct){
  error = false;
  let spliter = (str) => { return (str.split(/(?=[A-Z_ ])/).filter(e=>e!=" ")).filter(e=>e!="_").map(e=>e.replaceAll(" ",""))}
  switch(fct){
    case "lowerCase" :
      fct = (str) => {return str.toLowerCase()};
      break;
    case "upperCase" :
      fct = (str) => {return str.toUpperCase()};
      break;
    case "spaceCase" : 
      fct = (str) => { return ((spliter(str).map(e=>e.charAt(0).toLowerCase()+e.slice(1)).join(" ")))}
      break;
    case "firstLetter":
      fct = (str) => { return ((spliter(str).map(e=>e.charAt(0).toUpperCase()+e.slice(1))).join(" "))}
    case "snakeCase" :
      fct = (str) => { return ((spliter(str).map(e=>e.charAt(0).toUpperCase()+e.slice(1))).join("_"))}
      break;
    case "camelCase" :
      fct = (str) => { return ((spliter(str).map(e=>e.charAt(0).toUpperCase()+e.slice(1))).join(""))}
      break;
    default :
      fct = false;
      break;
  }

  if(fct){
    data[name].forEach(e => e[key] = fct(e[key]));
    return data;
  } else {
    errorDisplay(401);
  }
}

function purge(data, name, key){
  let error = false;
  let keyNotFound = 0;
  let purged = 0;
  let valueList = [];

  if(!(name in data)){
    errorDisplay(201);
    error = true;
  }
  if(!error){
    for (let i = 0; i < data[name].length; i++) {
      if(data[name][i][key]){
        if(!valueList.includes(data[name][i][key])){
          valueList.push(data[name][i][key]);
        } else {
          delete data[name][i];
          console.log("removed");
        }
      }
    }
    data[name].filter(e=>e)
  }
  console.log(valueList);
  return data;
}


module.exports = {importFile,exportFile,merge,edit,purge};