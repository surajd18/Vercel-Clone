const {exec} = require('child_process');
const path = require('path');
const fs = require('fs');
const {S3Client,PutObjectCommand} = require('@aws-sdk/client-s3');
const mime = require('mime-types');

const s3Client = new S3Client({
    region:'ap-south-1',
    credentials:{
        accessKeyId:'AKIAY3KQ2QPSGJFR5IPU',
        secretAccessKey:'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',
    }
})

const PROJECT_ID = process.env.PROJECT_ID;

async function init(){
    console.log("Executing script.js");

    const outDirPath = path.join(__dirname,'output')

    const p = exec(`cd ${outDirPath} && npm install && npm run build`)

    p.stdout.on('data',function(data){
        console.log(data.toString())
    })

    p.stdout.on('Error',function(Error){
        console.log('Error : ',Error.toString())
    })

    p.stdout.on('close',async function(){
        console.log('Build Complete')
        const distFolderPath = path.join(__dirname, 'output', 'dist')
        const distFolderContent = fs.readdirSync(distFolderPath, { recursive: true })

        for(const file of distFolderContent)
        {
            const filePath = path.join(distFolderPath,file)
            if (fs.lstatSync(filePath).isDirectory()) continue;

            const command = new PutObjectCommand({
                Bucket:'',
                Key:`__output/${PROJECT_ID}/${file}`,
                Body:fs.createReadStream(filePath),
                ContentType:mime.lookup(filePath)
            })

            await s3Client.send(command);
        }

        console.log("Done....!")
    })
}
init();