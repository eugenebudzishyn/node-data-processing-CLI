import readline from "readline"
import fs from "fs/promises"
import stream from "stream"

async function main(){
    const rl = readline.createInterface(process.stdin, process.stdout);
    console.log("Welcome to Data Processing CLI!");
    let currentDir = await fs.realpath(".")
    async function askQuestion(currentDir){
        const fileList = await fs.readdir(currentDir);
        
        console.log(`You are currently in ${currentDir}`);

        rl.question("> ", (ans) => {

            if (ans == ".exit"){

                rl.close();
                console.log("Thank you for using Data Processing CLI!");
            } else if (ans == "up"){
                let splited = currentDir.split("\\");
                splited = splited.slice(0, splited.length - 1);

                currentDir = ""

                for (let path of splited){
                    currentDir += path + "\\";
                }

                askQuestion(currentDir.slice(0, currentDir.length - 1));
            } else if (ans == "ls"){
                for (let file of fileList){
                    console.log(file);
                }
                askQuestion(currentDir);
            } else {

                askQuestion(currentDir);
            }
            
        })
    }
    askQuestion(currentDir);
}

main();