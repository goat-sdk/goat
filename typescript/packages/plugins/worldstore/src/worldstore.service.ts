import { Tool } from "@goat-sdk/core";
import { SearchParameters } from "./parameters";

export class WorldstoreService {
    @Tool({
        description: "Searches for products on all stores within the WorldStore",
    })
    async searchForProduct(parameters: SearchParameters) {
        console.log("Searching for product by query:", parameters.query);
        const res = await fetch(
            `https://www.crossmint.com/api/worldstore/products/search?query=${parameters.query}&limit=${parameters.limit}`,
        );
        const json = await res.json();
        console.log("Search results:", json);
        return json;
    }
}
