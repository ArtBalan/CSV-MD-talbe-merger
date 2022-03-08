const prompt = require('prompt-sync') ();
const {errorDisplay, validate} = require("./error");

const { importFile, exportFile, merge } = require('./functions');

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