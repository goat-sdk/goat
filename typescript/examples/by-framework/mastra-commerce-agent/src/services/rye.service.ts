import { GraphQLClient, gql } from "graphql-request";
import "dotenv/config";

let ryeHeaders = {};
try {
    ryeHeaders = JSON.parse(process.env.RYE_API_KEY || "{}");
} catch (e) {
    ryeHeaders = {
        authorization: `Bearer ${process.env.RYE_API_KEY}`,
    };
}

const client = new GraphQLClient("https://api.rye.com/graphql", {
    headers: ryeHeaders,
});

interface Product {
    id: string;
    title: string;
    description: string;
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
  query SearchProducts($domain: String!, $query: String!, $first: Int!) {
    productsByDomainV2(domain: $domain, query: $query, first: $first) {
      products {
        id
        title
        description
        price {
          value
          currency
        }
        images {
          url
        }
        url
      }
    }
  }
`;

export async function searchGymsharkProducts(query: string, limit = 5): Promise<Product[]> {
    try {
        const variables = {
            domain: "gymshark.com",
            query,
            first: limit,
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

            return `
${index + 1}. ${product.title}
   Price: ${price}
   Description: ${product.description ? `${product.description.substring(0, 100)}...` : "No description available"}
   URL: ${product.url}
`;
        })
        .join("\n");
}
