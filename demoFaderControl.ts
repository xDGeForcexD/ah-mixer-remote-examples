/////////////////////////////////////////////////////////////
//                                                         //
// Demo of fader control by remote with an sinus curve     //
// With this you can test your connection to the mixer     //
// It controls the channels 1 - 17                         //
// You can run this script by:                             //
//                                                         //
//  node demoFaderControl.js                               //
//                                                         //
//  node demoFaderControl.js ip                            //
//      ip: ip of the mixer e.g. 192.168.0.100             //
//                                                         //
/////////////////////////////////////////////////////////////

// import lib
import AHMixerRemote from "ah-mixer-remote";
import {Types, Drivers} from "ah-mixer-remote";
import { isNumber } from "util";
import { ValueLevel } from "ah-mixer-remote/build/lib/types/types";
import { exit } from "process";

// define constants
let ip: string = "192.168.0.100";

// parse args if there is one
if(process.argv.length === 1) {
    ip = process.argv[0];
}

// sinus wave
let wave : number[] = [];
for(let i=0; i<17; i++) {
    wave.push(Math.ceil(20*Math.sin((2*Math.PI/17)*i)-20));
}

// init mixer
let mixer = new AHMixerRemote("sq", ip);


// mixer connect
mixer.connect();

// set callback if connection changed
mixer.setCallbackConnection((status: boolean) => {
    // check if connection is online
    let interval;
    if(status) {
        console.log("connected to the mixer");
        let step = 0;
        interval = setInterval(function() {
            if(step === 17) {
                step = 0;
            }
            let module = mixer.getModule("levelToMix");
            if(module !== undefined) {
                wave.forEach((waveStep: number, index: number) => {
                    let channel = index+step;
                    if(channel > 16) {
                        channel = channel - 17;
                    }
                    module!.setValue(index+step, new Types.ValueLevel(waveStep));
                });
            }
            step++;
        }, 1000);
    } else {
        console.log("connection ended to the mixer");
        clearInterval(interval);
    }
});