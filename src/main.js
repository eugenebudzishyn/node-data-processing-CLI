import readline from "readline"
import fs from "fs/promises"
import stream from "stream"
import pa from "path"
import crypto from "crypto"

async function main(){
    const rl = readline.createInterface(process.stdin, process.stdout);

    console.log("Welcome to Data Processing CLI!");

    let currentDir = await fs.realpath(".");

    async function askQuestion(currentDir){

        console.log(`You are currently in ${currentDir}`);
        
        rl.question("> ", async (ans) => {
            ans = ans.trim();
            if (ans == ".exit"){
                rl.close();
                console.log("Thank you for using Data Processing CLI!");

            } else if (ans == "up"){
                let arrayOfFiles = pa.parse(currentDir);

                currentDir = arrayOfFiles.dir;

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
                    console.log("Operation Failed");
                } 

                askQuestion(currentDir);

            } else if (ans.split(" ")[0] == "csv-to-json"){
                ans = ans.slice(11).trim().split(" ");
                let trimedArray = [];
                for (let component of ans){
                    if (component.trim() != ""){
                        trimedArray.push(component);
                    }
                }
                ans = trimedArray;
                if (ans[0] == "--input"){
                    try {

                        let data = (await fs.readFile(ans[1])).toString();
                        let output = [];

                        data = data.split("\n");

                        data = data.map(str => str.split(","));
                        
                        for (let i = 0; i < data.length; i++){
                            for (let j = 0; j < data[i].length; j++){
                                if (data[i][j][data[i][j].length - 1] == "\r"){
                                    
                                    data[i][j] = data[i][j].slice(0, data[i][j].length - 1);
                                }
                            }
                        }
                        // console.log(data);
                        for (let i = 1; i < data.length; i++){
                            output.push({});
                            for (let j = 0; j < data[i].length; j++){
                                output[i-1][data[0][j]] = data[i][j];
                            }
                        }
                        if (ans.length < 4){
                            await fs.writeFile(`${ans[1].slice(0, ans[1].length - 4)}.json`, JSON.stringify(output));
                        } else if (ans[2] == "--output"){
                            await fs.writeFile(ans[3], JSON.stringify(output));
                        }
                        
                    } catch {
                        
                    }
                    askQuestion(currentDir);
                }
                
            } else if (ans.split(" ")[0] == "json-to-csv"){
                try {
                    ans = ans.slice(11).trim().split(" ");

                    let trimedArray = [];
                    
                    for (let component of ans){

                        if (component.trim() != ""){

                            trimedArray.push(component);
                        }
                    }
                    ans = trimedArray;

                    let input = "";
                    let output = "";

                    if (ans.length == 4){
                        if (ans[0] == "--input"){
                            input = ans[1];
                        } else {
                            throw new Error();
                        }
                        if (ans[2] == "--output"){
                            output = ans[3];
                        } else {
                            throw new Error();
                        }
                        
                    } else {
                        throw new Error()
                    }
                    console.log(input, output);

                    await fs.access(input);

                    const results = await fs.readFile(input);
                    const contents = JSON.parse(results);

                    let newCSVFile = "";

                    for (let entry in contents[0]){
                        newCSVFile += entry + ",";
                    }

                    newCSVFile = newCSVFile.slice(0, newCSVFile.length - 1) + "\n";

                    for (let obj of contents){
                        for (let entry in obj){
                            newCSVFile += obj[entry] + ",";
                        }
                        newCSVFile = newCSVFile.slice(0, newCSVFile.length - 1) + "\n";
                    }

                    newCSVFile = newCSVFile.slice(0, newCSVFile.length - 1);

                    await fs.writeFile(output, newCSVFile);
                    
                } catch {
                    console.log("Operation Failed");
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
