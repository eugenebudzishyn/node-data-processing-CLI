import readline from "readline"
import fs from "fs/promises"
import stream from "stream"
import pa from "path"
import crypto from "crypto"
import fsf from "fs"

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
                ans = ans.slice(11).split(" ");
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
                    ans = ans.slice(11).split(" ");

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
            } else if (ans.slice(0, 5) == "count"){
                ans = ans.slice(5).split(" ");
                let trimedArray = [];
                for (let component of ans){
                    if (component.trim() != ""){
                        trimedArray.push(component);
                    }
                }
                ans = trimedArray;
                try {
                    let inputFile = "";
                    if (ans[0] == "--input"){
                        inputFile = ans[1];
                    } else {
                        throw new Error();
                    }
                    console.log("got to here");
                    // let File = await fs.readFile(inputFile);
                    const parameters = await fs.stat(inputFile);
                    
                    const File = (await fs.readFile(inputFile)).toString().split("\n");

                    const size = parameters.size;

                    const amountOfLines = File.length;

                    let wordCounter = 0;

                    for (let line of File){
                        wordCounter += line.split(" ").length;
                    }

                    console.log(`Lines: ${amountOfLines}\nWords: ${wordCounter}\nCharacters: ${size}`);
                } catch {
                    console.log("Operation Failed");
                }
                askQuestion(currentDir);
            } else if (ans.slice(0,12) == "hash-compare"){
                console.log("Got to here");
                ans = ans.slice(12).split(" ");
                let trimedArray = [];
                for (let component of ans){
                    if (component.trim() != ""){
                        trimedArray.push(component);
                    }
                }

                ans = trimedArray;

                let input = "";

                let inputHash = "";

                let algorithm = "sha256";
                try{
                    for (let i = 0; i < ans.length; i+=2){
                        if (ans[i] == "--input"){
                            input = ans[i+1];
                        } else if (ans[i] == "--hash"){
                            inputHash = ans[i+1];
                        } else if (ans[i] == "--algorithm"){
                            algorithm = ans[i+1];
                        }
                    }

                    const stringFile = (await fs.readFile(input)).toString();

                    const hash = crypto.createHash(algorithm).update(stringFile).digest("hex");

                    console.log(`${hash == (await fs.readFile(inputHash)).toString() ? "OK" : "MISMATCH"}`);

                } catch {
                    console.log("Operation Failed");
                }

                askQuestion(currentDir);
            }else if (ans.slice(0, 4) == "hash"){
                ans = ans.slice(4).split(" ");
                let trimedArray = [];
                for (let component of ans){
                    if (component.trim() != ""){
                        trimedArray.push(component);
                    }
                }

                ans = trimedArray;
                
                let save = false;

                let algorithm = "sha256";

                let input = "";

                try {
                    for (let i = 0; i < ans.length; i+=2){
                        if (ans[i] == "--input"){
                            input = ans[i+1];
                        } else if (ans[i] == "--save"){
                            save = true;
                        } else if (ans[i] == "--algorithm"){
                            algorithm = ans[i+1];
                        }
                    }
                    if (input == ""){
                        throw new Error();
                    }

                    const stringFile = (await fs.readFile(input)).toString();

                    const hash = crypto.createHash(algorithm).update(stringFile).digest("hex");

                    if (save){
                        await fs.writeFile("hash.txt", hash);
                    } else {
                        console.log(hash);
                    }
                } catch {
                    console.log("Operation Failed");
                }
                
                askQuestion(currentDir);
            } else if (ans.slice(0,7) == "encrypt"){
                ans = ans.slice(7).split(" ");
                let trimedArray = [];
                for (let component of ans){
                    if (component.trim() != ""){
                        trimedArray.push(component);
                    }
                }
                ans = trimedArray;

                let input = "";

                let output = "";

                let password = "";
                try{
                    for (let i = 0; i < ans.length; i+=2){
                        if (ans[i] == "--input"){
                            input = ans[i+1];
                        } else if (ans[i] == "--output"){
                            output = ans[i+1];
                        } else if (ans[i] == "password"){
                            password = ans[i+1];
                        }
                    }
                    const salt = crypto.randomBytes(16);
                    const iv = crypto.randomBytes(12);
                    const authTag = crypto.randomBytes(16);

                    const key = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha512');

                    const cipheredText = crypto.createCipheriv("aes-256-gcm", key, iv);

                    const inputStream = fsf.createReadStream(input);
                    const outputStream = fsf.createWriteStream(output);

                    outputStream.write(salt);

                    outputStream.write(iv);

                    inputStream.pipe(cipheredText).pipe(outputStream);
                    
                    outputStream.on("error", (error)=> {
                        console.log(error);
                    })
                    
                    outputStream.write(authTag);
                } catch {
                    console.log("Operation Failed");
                }
                askQuestion(currentDir);  
            } else if (ans.slice(0,7) == "decrypt"){
                // ans = ans.slice(7).split(" ");
                // let trimedArray = [];
                // for (let component of ans){
                //     if (component.trim() != ""){
                //         trimedArray.push(component);
                //     }
                // }
                // ans = trimedArray;

                // let input = "";

                // let output = "";

                // let password = "";

                // try{
                //     for (let i = 0; i < ans.length; i+=2){
                //         if (ans[i] == "--input"){
                //             input = ans[i+1];
                //         } else if (ans[i] == "--output"){
                //             output = ans[i+1];
                //         } else if (ans[i] == "password"){
                //             password = ans[i+1];
                //         }
                //     }

                //     const algorithm = 'aes-256-gcm';
                //     const ivLength = 12;
                //     const saltLength = 64;
                //     const tagLength = 16;
                //     const iterations = 10000;

                //     const encryptedFileBuffer = fsf.readFileSync(input);

                //     const salt = encryptedFileBuffer.subarray(0, saltLength - 1);
                //     const iv = encryptedFileBuffer.subarray(saltLength, saltLength + ivLength - 1);
                //     // const ciphertext = encryptedFileBuffer.subarray(saltLength + ivLength, encryptedFileBuffer.length - tagLength - 1);
                //     const authTag = encryptedFileBuffer.subarray(encryptedFileBuffer.length - tagLength);
                    
                //     const key = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha512");

                //     const decipher = crypto.createDecipheriv(algorithm, key, iv);

                //     decipher.setAuthTag(authTag);

                //     // console.log(salt.toString(), iv.toString(), authTag.toString(), key.toString());

                //     const inputStream = fsf.createReadStream(input, {start: saltLength + ivLength, end: encryptedFileBuffer.length - tagLength - 1});
                //     const outputStream = fsf.createWriteStream(output);

                //     inputStream.pipe(decipher).pipe(outputStream);

                //     outputStream.on('finish', () => {
                //         console.log('File decrypted successfully.');
                //     });

                //     outputStream.on('error', (err) => {
                //         // This often means an incorrect password/key or a corrupted file (tag mismatch)
                //         console.error('Decryption failed, likely due to an invalid password or corrupted data:', err.message);
                //     });
                // } catch (e) {
                //     console.log(e, "Operation Failed");
                // } 
                console.log("Function not implemented yet");
                askQuestion(currentDir)
            } else {
                console.log("Unknown Command");

                askQuestion(currentDir);
            }
            
        })
    }
    askQuestion(currentDir);
}

main();
