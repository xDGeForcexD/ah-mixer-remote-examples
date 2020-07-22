/////////////////////////////////////////////////////////////
//                                                         //
// Simple Example how to set a Channel Value on the LR Mix //
// You can run this script by:                             //
//                                                         //
//  node simpleSetChannelValue.js                          //
//                                                         //
//  node simpleSetChannelValue.js channel value            //
//      channel: number from 1 - 48                        //
//      value:   inf - 10                                  //
//                                                         //
//  node simpleSetChannelValue.js ip channel value         //
//      ip: ip of the mixer e.g. 192.168.0.100             //
//      channel: number from 1 - 48                        //
//      value:   inf - 10                                  //
//                                                         //
/////////////////////////////////////////////////////////////

// import lib
import AHMixerRemote from "ah-mixer-remote";
import {Types, Drivers} from "ah-mixer-remote";
import { isNumber } from "util";

// define constants
let ip: string = "192.168.0.100";
let channel: number = 12; // Channen Number Ip12
let value: Types.ValueLevel = new Types.ValueLevel(10); // +10db

// parse args if there is one
if(process.argv.length === 2 || process.argv.length === 3) {
    let offset = 0;
    if(process.argv.length === 3) {
        ip = process.argv[0];
        offset++;
    }
    if(isNumber(process.argv[0+offset])) {
        channel = parseInt(process.argv[0+offset]);
    }
    if(isNumber(process.argv[1+offset])) {
        value = new Types.ValueLevel(parseInt(process.argv[1+offset]));
    }
}

// init mixer
let mixer = new AHMixerRemote("sq", ip);

// connect to mixer
mixer.connect();

// set callback if connection changed
mixer.setCallbackConnection((status: boolean) => {
    // check if connection is online
    if(status) {
        // get module levelToMix
        let levelToMix = mixer.getModule("levelToMix");

        // check if module exists
        if(levelToMix !== undefined) {
            levelToMix = <Drivers.SQ.LevelToMix> levelToMix;

            // send Value to LR mix
            levelToMix.setValue(channel, value);
        }
        
        // disconnect from mixer
        setTimeout(function() {
            mixer.disconnect();
        }, 1000);
    } else {
        let error = mixer.getError();
        if(error !== null) {
            console.log("connection error: "+error)
        } else {
            console.log("connection to server ended");
        }
    }
});