import readline from "readline"
import fs from "fs/promises"
import stream from "stream"
import pa from "path"

async function main(){
    const rl = readline.createInterface(process.stdin, process.stdout);
    console.log("Welcome to Data Processing CLI!");
    let currentDir = await fs.realpath(".");
    async function askQuestion(currentDir){
        console.log(`You are currently in ${currentDir}`);
        rl.question("> ", async (ans) => {

            if (ans == ".exit"){
                rl.close();
                console.log("Thank you for using Data Processing CLI!");

            } else if (ans == "up"){
                let arrayOfFiles = currentDir.split(pa.sep);
                console.log(arrayOfFiles);
                currentDir = pa.join(...arrayOfFiles, "..");
                askQuestion(currentDir);
            } else if (ans == "ls"){
                const fileList = await fs.readdir(currentDir);
                for (let file of fileList){
                    console.log(file);
                }
                askQuestion(currentDir);
            } else if (ans.split(" ")[0] == "cd"){
                ans = ans.slice(2).trim();

                try {
                    await fs.access(pa.join(currentDir, ans));
                    await fs.readdir(currentDir);
                    currentDir = pa.join(currentDir, ans);
                } catch {
                    console.log("Operation Failed")
                } 
                askQuestion(currentDir);

            } else {
                console.log("Unknown Command");
                askQuestion(currentDir);
            }
            
        })
    }
    askQuestion(currentDir);
}

main();