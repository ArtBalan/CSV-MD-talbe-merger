const { table } = require('console');
const prompt = require('prompt-sync') ();
const {errorDisplay, validate} = require("./error");
/**************************/
/* FILE RELATED FUNCTIONS */
/**************************/
/**
 * Load a file and return it as a string
 * 
 * @param {string} path of the file to load 
 * @returns file as a string
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
 * @param {string} data 
 * @param {string} path 
 */
function WriteFile(data,path){
  data = data.join("\n");
  var fs = require('fs');
  fs.writeFileSync(path, data, function (err) {
    if (err) throw err;
  });
}
  
/*************************/
/* CLI RELATED FUNCTIONS */
/*************************/
/**
 * 
 * @param {object} data Data Object
 * @param {string} path File to import 
 * @param {string} name of the object to create 
 * @param {string} type Type of the file 
 * @returns 
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
function exportFile(data, path){
  let error = false;
  if(!path) {
    errorDisplay(101);
    error =  true;
  }
  if(!error){
    let type = path.split('.')[1];
    switch(type){
      case "md":
        WriteFile(objectToTable(data),path);
        break;
      case "csv": 
        WriteFile(objectToCsv(data),path);
        break;
      default : 
        errorDisplay(203);
    }
  }
}

function csvToObject(str){
  let separator = ",";
  str = str.replaceAll("\r","")
  let lines = [];
  lines = str.split('\n');
  let keys = [];
  lines[0].split(separator).forEach(e => keys.push((e.replace("\r","")).trim()));  
  return objectify(lines.slice(1), keys, separator);
}

function tableToObject(str){
  let separator = "|";
  let lines = [];
  lines = str.split('\n');
  let keys = [];
  lines[0].split(separator).forEach(e => keys.push((e.replace("\r","")).trim()));  
  keys = keys.filter(e => e.replace(/\s/g, ''));
  return objectify(lines.slice(2), keys, separator);
}

/**
 * "Objectify" a data list based on keys given
 * 
 * @param {object} data data to objectify
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

function merge(data, name1, name2, key, out){
  let error = false;
  if(out in data){
    error = (validate("This name is already taken, do you want to overwrite it ?"))? error : true;
  }
  if(!(name1 in data) || !(name2 in data)){
    console.log("list not found");
    error = true;
  }
  if(!error){
    l1 = data[name1];
    l2 = data[name2];
    let keys = Object.keys(l1[0]);
    
    l1.forEach(e => { 
      l2.forEach(f =>{ 
        if(e[key] == f[key]){
          keys.forEach(key => {
          (e[key] == "0")? e[key] = ((f[key])? f[key] : "0") : "0";
          });
        }
      })
    });
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

function helpMe(){
  console.log("$ exit - Leave the CLI");
  console.log("$ display - display the data lists");
  console.log(" -- param");
  console.log("   name - display the data lists");
  console.log("   only key - show a specific key from a specific data list");
  console.log("$ import file as name - import a file as a data list" );
  console.log(" -- param");
  console.log("   override ext - override the file extention (ex: import .txt file as csv");
  console.log("$ export name as file - export a data list into a file");
  console.log("$ delete name - delete a data list");
  console.log("$ create name - create a data list");
  console.log("$ merge source base_on key with source2 on dest - merge 2 data lists")
}


function main (){
  let exit = false;
  let data = {};
  let tempDataKey = "";
  let tempData = {};
  
  while(!exit){
    let userInput = prompt("toolCLI$ ");
    userInput = userInput.split(' ');

    if(userInput.length%2==0){
      let inputParsed = [];
      for(let i=0; i<userInput.length; i+=2){
        inputParsed[userInput[i]] = userInput[i+1];
      }

      switch(userInput[0]){
        case "display":
          if("only" in inputParsed) {
            data[inputParsed["display"]].forEach(e => console.log(e["id"] + " : " + e[inputParsed["only"]]));
          }
          else console.log(data[inputParsed["display"]]);
          break;
        case "import" :
          data = importFile(data,("import" in inputParsed)? inputParsed["import"] : false, ("as" in inputParsed)? inputParsed["as"] : false, ("type" in inputParsed)? inputParsed["type"] : false )
          break;

        case "export" :
          tempDataKey = "";
          tempData = {};
          tempDataKey = ("export" in inputParsed)? inputParsed["export"] : false;
          tempData = (tempDataKey)? data[tempDataKey] : false;
          (tempData)? exportFile(tempData, ("as" in inputParsed)? inputParsed["as"] : false) : errorDisplay(301);
          break;

        case "merge" :
          tempDataKey = ("based_on" in inputParsed)? inputParsed["based_on"] : false;
          tempData = ("on" in inputParsed)? inputParsed["on"] : false;
          data = merge(data,("merge" in inputParsed)? inputParsed["merge"]:false,("with" in inputParsed)?inputParsed["with"]:false,tempDataKey,tempData);
          break;

        case "delete" :
          tempDataKey = inputParsed["delete"] ;
          if(validate("Are you sur you want to delete " + tempDataKey + " ? ")) {
            delete data[tempDataKey];
          }
          break;
        
        case "create":
          tempDataKey = inputParsed["create"];
          if(data[tempDataKey]){
            if(validate("This name is already taken, do you want to overwrite it ?")) data[tempDataKey] = {};
          }
          else data[tempDataKey] = {};
          break;
        
        case "purge":
          break;

        default:
          errorDisplay(1);
          break;
      }
    } else {

      switch(userInput[0]){
        case "exit": 
          exit = validate("Are you sur you want to quite ? (all change not exported will be lost) : ")
          break;
        case "display":
          for(const key in data ) console.log(key);
          break;
        case "clear":
          console.log('\033c');
          break;
        case "helpMe":
          helpMe();
          break;
        default:
          errorDisplay(1);
          break;
      }
    }
  }
}

main();