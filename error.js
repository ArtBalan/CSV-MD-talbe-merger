const prompt = require('prompt-sync') ();

function errorDisplay(code){
  switch(code){
    case 1:
      console.log("Error " + code + " : Command not recognised");
      break;
    // FILE RELATED ERRORS
    case 101:
      console.log("Error " + code + " : No path secified ");
      break;
    case 102:
      console.log("Error " + code + " : Unknown paht");
      break;
    // IMPORT/EXPORT RELATED ERRORS
    case 201:
      console.log("Error " + code + " : No name specified ");
      break;
    case 202:
      console.log("Error " + code + " : Name already taken");
      break;
    case 203:
      console.log("Error " + code + " : File format not recognized");
      break;
    case 301: 
      console.log("Error " + code + " : List not found")
      break;                                                                            
    default :
      console.log("Error " + code + " : Unkown error code");
  }
}

function validate(str){
  return (prompt(str + " y or n ? : ") == 'y')? true : false;
}

module.exports = {errorDisplay, validate};