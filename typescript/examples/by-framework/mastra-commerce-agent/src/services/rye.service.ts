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

interface Product {
    id: string;
    title: string;
    description: string;
    vendor: string;
    isAvailable: boolean;
    tags: string[];
    price: {
        value: number;
        currency: string;
    };
    images: {
        url: string;
    }[];
    url: string;
}

interface SearchProductsResponse {
    productsByDomainV2: {
        products: Product[];
    };
}

const SEARCH_PRODUCTS_QUERY = gql`
  query SearchProducts($input: productsByDomainInput!, $pagination: OffsetPaginationInput!) {
    productsByDomainV2(input: $input, pagination: $pagination) {
      products {
        id
        title
        description
        vendor
        url
        isAvailable
        tags
        price {
          value
          currency
        }
        images {
          url
        }
      }
    }
  }
`;

export async function searchGymsharkProducts(query: string, limit = 5): Promise<Product[]> {
    try {
        const variables = {
            input: {
                domain: "gymshark.com",
                query,
            },
            pagination: {
                offset: 0,
                limit,
            },
        };

        const data = await client.request<SearchProductsResponse>(SEARCH_PRODUCTS_QUERY, variables);
        return data.productsByDomainV2.products;
    } catch (error) {
        console.error("Error searching Gymshark products:", error);
        throw new Error(`Failed to search products: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export function formatProductsForDisplay(products: Product[]): string {
    if (products.length === 0) {
        return "No products found matching your query.";
    }

    return products
        .map((product, index) => {
            const price = `${product.price.currency} ${product.price.value}`;
            const imageUrl = product.images && product.images.length > 0 ? product.images[0].url : "No image available";
            const availability = product.isAvailable ? "In Stock" : "Out of Stock";
            const tags = product.tags && product.tags.length > 0 ? product.tags.join(", ") : "No tags";

            return `
${index + 1}. ${product.title} by ${product.vendor}
   Price: ${price} (${availability})
   Description: ${product.description ? `${product.description.substring(0, 100)}...` : "No description available"}
   Tags: ${tags}
   URL: ${product.url}
`;
        })
        .join("\n");
}
