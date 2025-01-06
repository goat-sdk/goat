export const fetchPost = `
  query Publication($request: PublicationRequest!) {
    publication(request: $request) {
      ... on Post {
        by {
          ownedBy {
            address
          }
        }
      }
    }
  }
`;
