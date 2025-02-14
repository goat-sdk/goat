import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

import getTools from '../../../getTools';
import config from '../../../config';

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        maxSteps: 10, // maximum number of tool invocations per request
        messages,
        model: openai('gpt-4o-mini'),
        tools: await getTools({
            client: false, // ensure server-side is specified, as this removes the tools' execute logic in order to instruct teh Vercel AI SDK to defer the tool invocation to the client
            wagmiConfig: config,
        }),
    });

    return result.toDataStreamResponse();
}
