import "dotenv/config";
import fastifyFormBody from "@fastify/formbody";
import Fastify from "fastify";
import { mastra } from "../mastra/index.js";

const fastify = Fastify({ logger: true });
fastify.register(fastifyFormBody);

const PORT = process.env.PORT || 3000;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

fastify.get("/", async (_, reply) => {
    reply.send({ status: "ok" });
});

const sessions: Record<string, { messages: string[] }> = {};

fastify.post("/sms", async (request, reply) => {
    const body = request.body as { From?: string; Body?: string };

    if (!body.From || !body.Body) {
        return reply.status(400).send({ error: "Invalid request" });
    }

    const from = body.From;
    const message = body.Body;

    console.log(`Received message from ${from}: ${message}`);

    if (!sessions[from]) {
        sessions[from] = { messages: [] };
    }

    try {
        const agent = mastra.getAgent("shopifyAgent");

        const result = await agent.generate(message);
        const response = result.text;

        sessions[from].messages.push(message);
        sessions[from].messages.push(response);

        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>${response}</Message>
      </Response>`;

        reply.type("text/xml").send(twiml);
    } catch (error) {
        console.error("Error processing message:", error);

        const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Message>Sorry, I encountered an error processing your request. Please try again later.</Message>
      </Response>`;

        reply.type("text/xml").send(twiml);
    }
});

export function startTwilioServer() {
    fastify.listen({ port: Number.parseInt(PORT.toString()), host: "0.0.0.0" }, (err) => {
        if (err) {
            console.error("Error starting server:", err);
            process.exit(1);
        }
        console.log(`Twilio SMS server listening on port ${PORT}`);
    });

    return fastify;
}

if (require.main === module) {
    startTwilioServer();
}
