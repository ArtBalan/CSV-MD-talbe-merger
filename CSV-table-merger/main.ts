import promptSync from "prompt-sync";
const { errorDisplay, validate } = require("./error");
import { UserInputKeyValue } from "./interface";

function helpMe(): void {
  console.log("$ exit - Leave the CLI");
  console.log("$ display - Display the data lists");
  console.log("  ↳ name - Display the data lists");
  console.log("  ↳ only key - Show a specific key from a specific data list");
  console.log("$ import file as name - Import a file as a data list");
  console.log(
    "  ↳ type ext - Override the file extention (ex: import .txt file as csv"
  );
  console.log("$ export name as file - Export a data list into a file");
  console.log("$ delete name - Delete a data list");
  console.log("$ create name - Create a data list");
  console.log(
    "$ merge source base_on key with source2 on dest - Merge 2 data lists"
  );
  console.log("$ preview name - Display the keys of the first list element");
  console.log(
    "$ edit name on key to fct - Edit the entry of a list based on the key given"
  );
  console.log(
    "$ purge name based_on key - remove the entry that have the same key"
  );
}

function main() {
  const prompt = promptSync();
  let exit: Boolean = false;

  while (!exit) {
    let userInput: string | null = prompt("toolCLI$ ");
    if (userInput) {
      let userInputSplited: string[] = userInput.split(" ");
      if (userInputSplited.length % 2 == 0) {
        let userInputParsed: UserInputKeyValue[] = [];

        for (let i = 0; i < userInputSplited.length; i += 2) {
          userInputParsed.push({
            key: userInputSplited[i],
            value: userInputSplited[i + 1],
          });
        }

        switch(userInputSplited[0]){
          case "display":
            break;
          case "import" :
            ("import" in userInputParsed.key)? 
            break;
          case "export" :
            break;
          case "merge" :
            break;
          case "delete" :
            break;
          case "create":
            break;
          case "edit":
            break;
          case "preview":
            break;
          case "purge":
            break;
          default:
            errorDisplay(1);
            break;
        }


      } else {
        switch (userInputSplited[0]) {
          case "exit":
            exit = true;
            break;
          case "clear":
            // console.log('\033c');
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
}

main();
