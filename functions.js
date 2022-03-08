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
  return objectify(lines.slice(1), keys, separator);
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
  return objectify(lines.slice(2), keys, separator);
}

/**
 * "Objectify" a data list based on keys given
 * 
 * @param {object} data to objectify
 * @param {object} keys list of keys
 * @param {string} separator str used to split the data
 * @returns objectified data
 */
function objectify(data, keys,separator){
  let dataObjectified = [];
  data.forEach(e => {
    let temp = e.split(separator);
    temp = temp.filter(e => e.replace(/\s/g, ''));
    if(temp.length == keys.length){
      let tempObject = {};
      for(let i=0; i<temp.length; i++){
       tempObject[keys[i]] = ((temp[i].replace("\n","")).replace("\r","")).trim();
      }
      dataObjectified.push(tempObject);
    }
  });
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
    //tempstr += (key.length< entry[key].length -2)?entry[key] + " "*(key.length-entry[key].length) : entry[key];
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
    //tempstr += (key.length< entry[key].length -2)?entry[key] + " "*(key.length-entry[key].length) : entry[key];
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
  let error = false;
  if(out in data){
    error = (validate("This name is already taken, do you want to overwrite it ?"))? error : true;
  }
  if(!(name1 in data) || !(name2 in data)){
    errorDisplay(301);
    error = true;
  }
  if(!error){
    l1 = data[name1];
    l2 = data[name2];
    let keys = Object.keys(l1[0]);
    
    l1.forEach(e => { l2.forEach(f =>{ if(e[key] == f[key]){ keys.forEach(key => { (e[key] == "0")? e[key] = ((f[key])? f[key] : "0") : "0";});}})});
    
    l2.forEach(e => {
      let isIn = false;
      l1.forEach(f => {
        if(e["id"] == f["id"]){
          isIn = true;
        }
      });
      if(!isIn) l1.push(e);
    });
    data[out] = l1;
  }
  return data;
}

module.exports = {importFile,exportFile,merge};
