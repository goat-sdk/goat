import { ToolBase } from "@goat-sdk/core";
import { describe, expect, it } from "vitest";
import { qhooks } from "./qhooks.plugin";
const address = (n: number) => `0x${n.toString(16).padStart(40, "0")}`;
const args = {
    chain: "4663",
    token: address(1),
    trader: address(2),
    side: "buy",
    amountIn: "9007199254740993001",
};
function fixture() {
    const calls: Record<string, unknown>[] = [];
    const result = {
        amountIn: args.amountIn,
        minOut: "9007199254740993000",
        transactions: [{ to: address(3), data: "0xf5ec7c4b", value: args.amountIn }],
        partial: true,
        costUsd: null,
    };
    let status = 200;
    const plugin = qhooks({
        referrer: address(4),
        fetchImpl: async (_url, init) => {
            const body = JSON.parse(init?.body as string);
            calls.push(body);
            if (status !== 200) return new Response("", { status, headers: { "retry-after": "7" } });
            return Response.json({
                jsonrpc: "2.0",
                id: body.id,
                result: {
                    structuredContent: result,
                    content: [{ type: "text", text: JSON.stringify(result) }],
                },
            });
        },
    });
    const tool = plugin.getTools().find((t) => t.name === "qhooks_prepare_trade");
    if (!tool) throw new Error("Fixture trade tool missing");
    return {
        plugin,
        calls,
        result,
        setStatus: (s: number) => {
            status = s;
        },
        tool,
    };
}
describe("QHooksPlugin", () => {
    it("provides 25 native tools without touching a wallet", () => {
        const f = fixture();
        const wallet = new Proxy(
            {},
            {
                get() {
                    throw Error("no wallet access");
                },
            },
        );
        const tools = f.plugin.getTools(wallet as never);
        expect(tools).toHaveLength(25);
        expect(tools.every((t) => t instanceof ToolBase)).toBe(true);
        expect(
            tools.some((t) =>
                /agreement_jar|send_feedback|prepare_tpsl|prepare_limit_order|orders_status/.test(t.name),
            ),
        ).toBe(false);
        expect(f.calls).toHaveLength(0);
    });
    it("returns exact plans and preserves explicit referral", async () => {
        const f = fixture();
        expect(await f.tool.execute(args)).toEqual(f.result);
        expect((f.calls[0].params as { arguments: Record<string, unknown> }).arguments.referrer).toBe(address(4));
        await f.tool.execute({ ...args, referrer: address(5) });
        expect((f.calls[1].params as { arguments: Record<string, unknown> }).arguments.referrer).toBe(address(5));
    });
    it("refuses malformed referral before transport", async () => {
        const f = fixture();
        await expect(f.tool.execute({ ...args, referrer: address(0) })).rejects.toMatchObject({
            code: "invalid_referrer",
        });
        expect(f.calls).toHaveLength(0);
    });
    it("preserves 429 without retries or a second provider", async () => {
        const f = fixture();
        f.setStatus(429);
        await expect(f.tool.execute(args)).rejects.toMatchObject({
            code: "rate_limited",
            retryAfterSeconds: 7,
        });
        expect(f.calls).toHaveLength(1);
    });
});
