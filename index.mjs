import { ECSClient, UpdateServiceCommand } from '@aws-sdk/client-ecs';
import { EC2Client, StartInstancesCommand, StopInstancesCommand } from '@aws-sdk/client-ec2';

const ecsClient = new ECSClient({ region: process.env.AWS_REGION || 'ap-south-1' });
const ec2Client = new EC2Client({ region: process.env.AWS_REGION || 'ap-south-1' });

export const handler = async (event) => {
  try {
    console.log('event', event);

    // Handling ECS services
    if (event?.cluster) {
      if (!event?.services || event?.services?.length === 0) {
        throw Error(`ECS ${event.services} services are not provided.`);
      }

      const desiredCount = event?.desiredCount || 0;

      for (let i = 0; i < event.services.length; i++) {
        const service = event.services[i];
        const payload = { cluster: event.cluster, service, desiredCount };
        await ecsClient.send(new UpdateServiceCommand(payload));
      }

      const serviceState = desiredCount > 0 ? 'started' : 'stopped';
      const body = `${event.cluster} cluster::${event.services} services have been ${serviceState}`;
      console.log(body);
    } else if (event?.ec2InstanceIds && event?.ec2InstanceIds.length > 0) {
      // Handling EC2 instances
      const ec2InstanceIds = event.ec2InstanceIds;
      const ec2Action = event.ec2Action || 'stop'; // default to stop if not provided

      if (ec2Action === 'start') {
        const startParams = { InstanceIds: ec2InstanceIds };
        await ec2Client.send(new StartInstancesCommand(startParams));
        console.log(`EC2 instances ${ec2InstanceIds} have been started.`);
      } else if (ec2Action === 'stop') {
        const stopParams = { InstanceIds: ec2InstanceIds };
        await ec2Client.send(new StopInstancesCommand(stopParams));
        console.log(`EC2 instances ${ec2InstanceIds} have been stopped.`);
      } else {
        throw Error(`Invalid EC2 action: ${ec2Action}. Allowed actions are 'start' and 'stop'.`);
      }
    }

    return { statusCode: 200, body: 'Request processed successfully' };
  } catch (error) {
    console.error('Error:', error, event);
    return { statusCode: 500, body: 'Error processing request' };
  }
};
