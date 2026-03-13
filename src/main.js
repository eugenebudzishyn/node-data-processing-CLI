import readline from "readline"
import fs from "fs/promises"
import stream from "stream"

function main(){
    const rl = readline.createInterface(process.stdin, process.stdout);

    function askQuestion(){
        rl.question("> ", (ans) => {
            if (ans == ".exit"){
                rl.close();
                console.log("Thank you for using Data Processing CLI!");
            } else {
                askQuestion();
            }
            
        })
    }
    askQuestion();
}

main();