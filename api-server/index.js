const express = require('express')
const {generateSlug} = require('random-word-slugs')
const {ECSClient,RunTaskCommand} = require('@aws-sdk/client-ecs')

const app = express();
const PORT = 9000;

const config = {
    CLUSTER:'',
    TASK:'',
}

const ecsClient = new ECSClient({
    region:'ap-south-1',
    credentials:{
        accessKeyId:process.env.ACCESS_KEY_ID,
        secretAccessKey:ACCESS_KEY_ID,
    }
})

app.post('/project',async(req,res)=> {
    const {gitURL} = req.body;
    const projectSlug = generateSlug();

    //Spin the container
    const command = new RunTaskCommand({
        cluster:config.CLUSTER,
        taskDefinition:config.TASK,
        launchType:'FARGET',
        count:1,
        networkConfiguration:{
            awsvpcConfiguration:{
                assignPublicIp:'ENABLED',
                subnets:[''],
                securityGroups:['']
            }
        },
        overrides:{
            containerOverrides:[
                {
                    name:'builder-image' ,     //Name of the Image which you create in AWS
                    environment:[
                        {
                            name:'GIT_REPOSITORY_URL',value:gitURL
                        },{
                            name:'PROJECT_ID',value:projectSlug
                        }
                    ]
                }
            ]
        }
    })
    await ecsClient.send(command);

    return res.json({status:'queued',data:{projectSlug,url:`http://${projectSlug}.locahost:8000`}})
})

app.listen(PORT, () => {
    console.log(`API Server Running on ${PORT}`);
})