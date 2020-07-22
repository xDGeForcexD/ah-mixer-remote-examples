/////////////////////////////////////////////////////////////
//                                                         //
// Demo of all modules with an cli interface               //
// You can run this script by:                             //
//                                                         //
//  node demoAvailableModules.js                           //
//                                                         //
//  node demoAvailableModules.js ip                        //
//      ip: ip of the mixer e.g. 192.168.0.100             //
//                                                         //
/////////////////////////////////////////////////////////////

// import lib
import AHMixerRemote from "ah-mixer-remote";
import {Types, Drivers} from "ah-mixer-remote";
import { isNumber } from "util";
import * as Readline from "readline";

// define constants
let ip: string = "192.168.0.100";

// parse args if there is one
if(process.argv.length === 1) {
    ip = process.argv[0];
}

// init readline
const rl = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// init mixer
let mixer = new AHMixerRemote("sq", ip);

// set receive callbacks for each module
mixer.getModules().forEach((module, key) => {
    mixer.setCallbackReceive(key, (channel: number, value: Types.IValue) => {
        console.log(key+": Ip"+channel+" value is "+value);
    });
});

// set callback if connection changed
mixer.setCallbackConnection((status: boolean) => {
    // check if connection is online
    if(status) {
        console.log("connected to server");
    } else {
        let error = mixer.getError();
        if(error !== null) {
            console.log("connection error: "+error)
        } else {
            console.log("connection to server ended");
        }
    }
});

console.log("########################################");
console.log("#                                      #");
console.log("# Hello, write your command like this: #");
console.log("#                                      #");
console.log("#         type.channel.value           #");
console.log("#                                      #");
console.log("# type: 0 = mute                       #");
console.log("#       1 = mix                        #");
console.log("#       2 = softkey                    #");
console.log("#       3 = request                    #");
console.log("#       9 = connect / disconnect       #");
console.log("#                                      #");
console.log("# to exit the program write 'exit'     #");
console.log("########################################");

rl.setPrompt('command> ');
rl.prompt();
rl.on('line', function(line) {
    if (line === "exit") {
        mixer.disconnect();
        rl.close();
        return;
    }
    let cmd = line.split(".");
    let error = false;
    if(cmd.length >= 2) {
        let inputType    = parseInt(cmd[0]);
        let inputChannel = parseInt(cmd[1]);
        let inputValue   = parseInt(cmd[2]);
        
        switch(inputType) {
            // mute type
            case 0:
                let mute = mixer.getModule("mute");
                if(mute !== undefined) {
                    if(cmd.length === 3) {
                        let value = new Types.ValueState(inputValue === 0 ? false : true);
                        mute.setValue(inputChannel, value);
                    } else {
                        error = true;
                    }
                } else {
                    console.log("module not found");
                }
                break;
            // mix type
            case 1:
                let levelToMix = mixer.getModule("levelToMix");
                if(levelToMix !== undefined) {
                    if(cmd.length === 3) {
                        levelToMix.setValue(inputChannel, new Types.ValueLevel(inputValue));
                    } else {
                        error = true;
                    }
                } else {
                    console.log("module not found");
                }
                break;
            // softkey type
            case 2:
                let softkey = mixer.getModule("softkey");
                if(softkey !== undefined) {
                    softkey.setValue(inputChannel, new Types.ValueState(true));
                } else {
                    console.log("module not found");
                }
                break;
            // request type
            case 3:
                let modules = mixer.getModules();
                if(cmd.length === 3) {
                    switch(inputValue) {
                        // mute type
                        case 0:
                            if(modules.has("mute")) {
                                let module = modules.get("mute");
                                module!.requestValue(inputChannel);
                            } else {
                                console.log("module not found");
                            }
                            break;
                        // mix type
                        case 1:
                            if(modules.has("levelToMix")) {
                                let module = modules.get("levelToMix");
                                module!.requestValue(inputChannel);
                            } else {
                                console.log("module not found");
                            }
                            break;
                        default:
                            console.log("module not found");
                            break;
                    }
                } else {
                    error = true;
                }
                break;
            // connect / disconnect to mixer
            case 9:
                if(inputChannel > 0) {
                    mixer.connect();
                } else {
                    mixer.disconnect();
                }
                break;
            default:
                error = true;
        }
    } else {
        error = true;
    }
    if(error) {
        console.log("command error");
    }
    rl.prompt();
});