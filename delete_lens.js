// Packages
const fs = require("fs")
const crypto = require('crypto');
const wellArchitected = require("@aws-sdk/client-wellarchitected")

// Dependencies
const logger = require('./src/logger')

// Objects
const args = require('minimist')(process.argv.slice(2));

async function main(region, filepath, lens_arn=undefined){

    let lens_alias = lens_arn
    let custom_lens_data = undefined
    let wellArchitectedClient = new wellArchitected.WellArchitectedClient({
        region: region
    })

    if (filepath != undefined) {
        custom_lens_data = JSON.parse(fs.readFileSync(filepath))
        lens_alias = custom_lens_data.LensArn
    }

    logger.log(`--- Deleting Custom lens : ${lens_alias} ---`)
    let delete_response = await wellArchitectedClient.send(new wellArchitected.DeleteLensCommand({
        LensAlias: lens_alias,
        LensStatus: "ALL",
        ClientRequestToken: crypto.randomUUID().toString()
    }))

    if(filepath!=undefined){
        logger.log(`--- Deleting Custom lens local file : ${custom_lens_data.Name} ---`)
        fs.unlinkSync(filepath)
        logger.log(`Deleted : ./${filepath}`)
        fs.unlinkSync(`./out/${custom_lens_data.Name}-custom-lens.json`)
        logger.log(`Deleted : ./out/${custom_lens_data.Name}-custom-lens.json`)
    }

    logger.done()
}

if (args.a == undefined && args.f == undefined) {
    error_message = "Command line usage is ```node delete_lens -r <region> (-f <file> || -a <arn>)```"
    throw new Error(error_message)
}

if (args.r == undefined) {
    error_message = "Command line usage is ```node delete_lens -r <region> (-f <file> || -a <arn>)```"
    throw new Error(error_message)
}

main(args.r, args.f, args.a)