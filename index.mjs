import { ECSClient, UpdateServiceCommand } from '@aws-sdk/client-ecs'

const ecsClient = new ECSClient({ region: 'ap-south-1' })

export const handler = async (event) => {
  try {
    console.log('event', event)
    if (!event?.cluster) {
      throw Error('ECS cluster name is not provided.')
    }

    if (!event?.services || event?.services?.length == 0) {
      throw Error(`ECS ${event.services} services is not provided.`)
    }

    const desiredCount = event?.desiredCount || 0

    for (let i = 0; i < event.services.length; i++) {
      const service = event.services[i]
      const payload = { cluster: event.cluster, service, desiredCount }
      await ecsClient.send(new UpdateServiceCommand(payload))
    }

    const serviceState = desiredCount > 0 ? 'started' : 'stopped'
    const body = `${event.cluster} cluster::${event.services} services has been ${serviceState}`
    console.log(body)
    return { statusCode: 200, body }
  } catch (error) {
    console.error('Error:', error, event)
    return { statusCode: 500, body: 'Error processing request' }
  }
}
