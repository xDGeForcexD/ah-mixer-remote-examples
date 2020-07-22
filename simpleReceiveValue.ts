/////////////////////////////////////////////////////////////
//                                                         //
// Simple Example how to receive a level value             //
// You can run this script by:                             //
//                                                         //
//  node simpleReceiveValue.js                             //
//                                                         //
//  node simpleReceiveValue.js channel                     //
//      channel: number from 1 - 48                        //
//                                                         //
//  node simpleReceiveValue.js ip channel                  //
//      ip: ip of the mixer e.g. 192.168.0.100             //
//      channel: number from 1 - 48                        //
//                                                         //
/////////////////////////////////////////////////////////////

// import lib
import AHMixerRemote from "ah-mixer-remote";
import {Types, Drivers} from "ah-mixer-remote";
import { isNumber } from "util";

// define constants
let ip: string = "192.168.0.100";
let channel: number = 4; // Channen Number Ip18

// parse args if there is one
if(process.argv.length === 1 || process.argv.length === 2) {
    let offset = 0;
    if(process.argv.length === 2) {
        ip = process.argv[0];
        offset++;
    }
    if(isNumber(process.argv[0+offset])) {
        channel = parseInt(process.argv[0+offset]);
    }
}

// init mixer
let mixer = new AHMixerRemote("sq", ip);

// connect to mixer
mixer.connect();

// set callback on receive
mixer.setCallbackReceive("levelToMix", (channel: number, value: Types.IValue) => {
    console.log("Ip"+channel+"on LR mix is on "+value);

    // disconnect from mixer
    setTimeout(function() {
        mixer.disconnect();
    }, 1000);
});

// set callback if connection changed
mixer.setCallbackConnection((status: boolean) => {
    // check if connection is online
    if(status) {
        // get module levelToMix
        let levelToMix = mixer.getModule("levelToMix");

        // check if module exists
        if(levelToMix !== undefined) {
            levelToMix = <Drivers.SQ.LevelToMix> levelToMix;

            // request level of channel
            levelToMix.requestValue(channel);
        }
    } else {
        let error = mixer.getError();
        if(error !== null) {
            console.log("connection error: "+error)
        } else {
            console.log("connection to server ended");
        }
    }
});
