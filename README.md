# aws-ecs-up-down-lambda

We are adding two [aws-event bridge schedulers](https://ap-south-1.console.aws.amazon.com/scheduler/home?region=ap-south-1#schedules). First scheduler to off the service at desireCount=0 at night 11PM. And second scheduler run to wake up the cluster at morning at 9AM.

#### Event Bridge sample payload for ECS service

```json
{
  "cluster": "divamtech-staging",
  "services": ["divamtech-staging-server-service", "divamtech-staging-worker-service"],
  "desiredCount": 1
}
```
#### Event Bridge sample payload for EC2 service
```
{ "ec2InstanceIds": ["i-0362c8fc8eb38bc36"], "ec2Action": "start" }
```

## Voila!
