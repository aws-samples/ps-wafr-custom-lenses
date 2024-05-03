// Packages
const fs = require("fs")
const wellArchitected = require("@aws-sdk/client-wellarchitected")

// Dependencies
const logger = require('./src/logger')

// Objects
const args = require('minimist')(process.argv.slice(2))

// Const
const root_directory = "./data/"

function writeOutput(lens, filename){
    try {
        if(!fs.existsSync("./out/")){
            fs.mkdirSync('./out/')
        }
        fs.writeFileSync("./out/"+filename, JSON.stringify(lens))
    } catch (error){
        logger.log(error, 1)
    }
    logger.log(`Creating file : ./out/${filename}`)
}

function parseData(lens_directory) {
    let lens = JSON.parse(fs.readFileSync(lens_directory + "header.json"))
    let directory_content = fs.readdirSync(lens_directory)

    directory_content.forEach((element) => {

        let key = element.split("_")[1]

        if (fs.statSync(lens_directory + element).isDirectory()) {
            let pillar_header = JSON.parse(fs.readFileSync(lens_directory + element + "/" + key + ".json"))
            let pillar_content_path = lens_directory + element + "/" + key + "-questions"
            let pillar_content = fs.readdirSync(pillar_content_path)

            pillar_content.forEach((question_file) => {
                let question = JSON.parse(fs.readFileSync(pillar_content_path + "/" + question_file))
                pillar_header.questions.push(question)
                logger.parsed_question+=1
            })
            lens.pillars.push(pillar_header)
            logger.parsed_pillar+=1
        }

    })
    return lens
}

async function main(region, framework) {
    const wellArchitectedClient = new wellArchitected.WellArchitectedClient({
        region: region
    })
    const lens_directory = root_directory + framework + "/"

    logger.log("--- Parsing data folder ---")
    let lens = parseData(lens_directory)
    logger.logParsedData()

    logger.log("--- Creating Lens ---")
    let create_lens_request = await wellArchitectedClient.send(new wellArchitected.ImportLensCommand({
        JSONString: JSON.stringify(lens)
    }))

    logger.log("--- Writting Output ---")
    let filename = framework+"-custom-lens.json"
    writeOutput(lens, filename)

    let data = {"Name":framework,"LensArn":create_lens_request.LensArn}
    filename = framework+"-lens-data.json"
    writeOutput(data, filename)

    logger.log("--- Publishing Lens ---")
    let publish_lens_request = await wellArchitectedClient.send(new wellArchitected.CreateLensVersionCommand({
        LensAlias: create_lens_request.LensArn,
        LensVersion:"1",
        IsMajorVersion:true
    }))

    logger.done()
}

if (args.r == undefined) {
    error_message = "Command line usage is ```Command line usage is ```node create_lens -r region -f framework``` "
    throw new Error(error_message)
}

if (args.f == undefined) {
    error_message = "Command line usage is ```node create_lens -r region -f framework``` "
    throw new Error(error_message)
}

main(args.r, args.f)