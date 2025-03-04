export async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText}: ${errorText}`);
    }
    return response.json();
}

export function toBytes16(uuid: string): string {
    return `0x${uuid.replace(/-/g, "")}`;
}
