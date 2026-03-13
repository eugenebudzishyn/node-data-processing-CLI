import readline from "readline"
import fs from "fs/promises"
import stream from "stream"

async function main(){
    const rl = readline.createInterface(process.stdin, process.stdout);
    console.log("Welcome to Data Processing CLI!");
    let currentDir = await fs.realpath(".")
    async function askQuestion(currentDir){
        console.log(`You are currently in ${currentDir}`);
        rl.question("> ", (ans) => {
            if (ans == ".exit"){
                rl.close();
                console.log("Thank you for using Data Processing CLI!");
            } else if (ans == "up"){
                
            } else if (ans == "ls"){

            } else {
                askQuestion(currentDir);
            }
            
        })
    }
    askQuestion(currentDir);
}

main();