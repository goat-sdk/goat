import { GraphQLClient, gql } from "graphql-request";
import "dotenv/config";

let ryeHeaders = {};
try {
    ryeHeaders = JSON.parse(process.env.RYE_API_KEY || "{}");
    console.log("Successfully parsed Rye API key JSON");
} catch (e) {
    console.error("Failed to parse Rye API key as JSON, falling back to string format:", e);
    ryeHeaders = {
        Authorization: `Bearer ${process.env.RYE_API_KEY}`,
    };
}

const client = new GraphQLClient("https://graphql.api.rye.com/v1/query", {
    headers: ryeHeaders,
});

export interface Variant {
    id: string;
    title: string;
    price: {
        value: number;
        currency: string;
    };
    isAvailable: boolean;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    vendor: string;
    isAvailable: boolean;
    tags: string[];
    price: {
        value: number;
        currency: string;
        displayValue?: string;
    };
    images: {
        url: string;
    }[];
    url: string;
    variantId?: string; // Add variant ID for Shopify checkout
    variants?: Variant[]; // Add variants array for Shopify products
}

interface SearchProductsResponse {
    productsByDomainV2: Product[];
}

// Updated query based on Rye API documentation
const SEARCH_PRODUCTS_QUERY = gql`
  query DemoShopifyProductByDomain($input: productsByDomainInput!, $pagination: OffsetPaginationInput!) {
    productsByDomainV2(input: $input, pagination: $pagination) {
      id
      title
      description
      vendor
      url
      isAvailable
      tags
      price {
        ... on Price {
          value
          currency
          displayValue
        }
      }
      images {
        url
      }
      marketplace
      variants {
        id
        title
      }
    }
  }
`;

export async function searchGymsharkProducts(query: string, limit = 3): Promise<Product[]> {
    try {
        const variables = {
            input: {
                domain: "gymshark.com",
            },
            pagination: {
                offset: 0,
                limit,
            },
        };

        const data = await client.request<SearchProductsResponse>(SEARCH_PRODUCTS_QUERY, variables);

        // Apply post-processing to filter results based on the search query
        const queryTerms = query.toLowerCase().split(/\s+/);
        const importantTerms = queryTerms.filter(
            (term) => !["the", "a", "an", "and", "or", "for", "from", "with", "in", "on", "at"].includes(term),
        );

        // Filter products based on search terms
        const filteredProducts = data.productsByDomainV2.filter((product) => {
            const productText = `${product.title} ${product.description}`.toLowerCase();
            return importantTerms.some((term) => productText.includes(term));
        });

        // Sort products by relevance (how many search terms they match)
        const sortedProducts = filteredProducts.sort((a, b) => {
            const aText = `${a.title} ${a.description}`.toLowerCase();
            const bText = `${b.title} ${b.description}`.toLowerCase();

            const aMatches = importantTerms.filter((term) => aText.includes(term)).length;
            const bMatches = importantTerms.filter((term) => bText.includes(term)).length;

            return bMatches - aMatches;
        });

        // Products already have price field from the API

        // Process the products to extract variant IDs for Shopify products
        const processedProducts = sortedProducts.map((product) => {
            // If there are variants, use the first available variant ID
            // This is a simplification - in a real app, you'd want to let the user select the variant
            if (product.variants && product.variants.length > 0) {
                const firstAvailableVariant =
                    product.variants.find((v: Variant) => v.isAvailable) || product.variants[0];
                return {
                    ...product,
                    variantId: firstAvailableVariant.id,
                };
            }
            return product;
        });

        // Now filter the processed products

        // Determine if we're specifically looking for men's or women's items
        const isMensSearch = queryTerms.some((term) => term.includes("men"));
        const isWomensSearch = queryTerms.some((term) => term.includes("women"));

        // Determine if we're specifically looking for shorts
        const isShortSearch = queryTerms.some((term) => term.includes("short"));

        // Filter products further based on specific criteria
        const finalFilteredProducts = processedProducts.filter((product) => {
            const title = product.title?.toLowerCase() || "";
            const description = product.description?.toLowerCase() || "";
            const tags = product.tags?.map((tag) => tag.toLowerCase()) || [];

            // If specifically looking for men's items, exclude women's items
            if (isMensSearch && (title.includes("women") || title.includes("ladies") || title.includes("female"))) {
                return false;
            }

            // If specifically looking for women's items, exclude men's items
            if (isWomensSearch && title.includes("men") && !title.includes("women")) {
                return false;
            }

            // If specifically looking for shorts, prioritize items with 'short' in the title
            if (isShortSearch && !title.includes("short") && !description.includes("short")) {
                // Still include the item if it has many other matching terms
                let extraMatches = 0;
                for (const term of importantTerms) {
                    if (
                        term !== "short" &&
                        term !== "shorts" &&
                        (title.includes(term) || description.includes(term) || tags.some((tag) => tag.includes(term)))
                    ) {
                        extraMatches++;
                    }
                }
                // Only include if it has at least 2 other matching terms
                return extraMatches >= 2;
            }

            // For other searches, include if any important term matches
            return importantTerms.some(
                (term) => title.includes(term) || description.includes(term) || tags.some((tag) => tag.includes(term)),
            );
        });

        // Return the filtered products, limited to the specified count
        return finalFilteredProducts.slice(0, limit);
    } catch (error) {
        console.error("Error searching Gymshark products:", error);
        throw new Error(`Failed to search products: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export function formatProductsForDisplay(products: Product[]): string {
    if (products.length === 0) {
        return "No products found.";
    }

    return products
        .map(
            (product) => `
**${product.title}**
${product.description ? `${product.description.substring(0, 150)}...` : "No description available."}

**Price:** ${product.price.currency} ${product.price.value.toFixed(2)}
**Available:** ${product.isAvailable ? "Yes" : "No"}
**URL:** ${product.url}
**ID:** ${product.id}
${product.variantId ? `**Variant ID:** ${product.variantId}` : ""}
${product.tags && product.tags.length > 0 ? `**Tags:** ${product.tags.join(", ")}` : ""}
`,
        )
        .join("\n---\n");
}
