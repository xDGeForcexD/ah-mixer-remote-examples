/////////////////////////////////////////////////////////////
//                                                         //
// Simple Example how to request if the a Channel is muted //
// You can run this script by:                             //
//                                                         //
//  node simpleRequestValue.js                             //
//                                                         //
//  node simpleRequestValue.js channel                     //
//      channel: number from 1 - 48                        //
//                                                         //
//  node simpleRequestValue.js ip channel                  //
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
let channel: number = 18; // Channen Number Ip18

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

// set callback if connection changed
mixer.setCallbackConnection((status: boolean) => {
    // check if connection is online
    if(status) {
        // get module levelToMix
        let mute = mixer.getModule("mute");

        // check if module exists
        if(mute !== undefined) {
            mute = <Drivers.SQ.Mute> mute;

            // request mute status of channel
            mute.requestValue(channel);
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
