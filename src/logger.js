// Packages
const chalk = require('chalk')

class Logger {

    constructor(){
        this.error = false
        this.parsed_pillar = 0
        this.parsed_question = 0
    }

    logParsedData(){
        this.log(`Parsed ${this.parsed_pillar} pillars and ${this.parsed_question} questions`)
    }

    logCreatedControls(){
    }

    logDeletedControls(){
    }

    done(){
        if(this.error){
            this.log(`Done / Error`, 1)
            process.exit(1)
        }
        this.log(chalk.green(`Done / Sucess`))
        process.exit(1)
    }

    log(message, severity=0){
        switch (severity) {
            case 1:
                console.log(chalk.red((`[ERROR] : ${message}`)))
                if(!this.error){ this.error = true }
                break
            default:
                console.log(`[INFO] : ${message}`)
                break
        }
    }
    
}

module.exports = new Logger();