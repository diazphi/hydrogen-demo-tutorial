import {Suspense} from 'react';
import {
  gql,
  Seo,
  ShopifyAnalyticsConstants,
  useServerAnalytics,
  useLocalization,
  useShopQuery,
} from '@shopify/hydrogen';

import {PRODUCT_CARD_FRAGMENT} from '~/lib/fragments';
import {PageHeader, ProductGrid, Section, Text, CollectionFilter} from '~/components';
import {NotFound, Layout} from '~/components/index.server';

const pageBy = 48;
var sortKey = 'MANUAL';
var sortReverse = false;
var filterMinPrice = 200;
var filterMaxPrice = 4000;
var filterPrice = false;
export default function Collection({params, request}) {
  const {handle} = params;
  const url = new URL(request.url);
  sortKey = url.searchParams.get('sortkey');
  sortReverse = url.searchParams.get('reverse') === 'true' ? true : false;
  var filterAvailability = url.searchParams.get('availability') === 'true' ? true : url.searchParams.get('availability') === 'false' ? false : 'both';
  filterPrice = url.searchParams.get('price') === 'true' ? true : false;
  if(filterPrice) {
    filterMinPrice = parseFloat(url.searchParams.get('min'));
    filterMaxPrice = parseFloat(url.searchParams.get('max'));
  } 
  const {
    language: {isoCode: language},
    country: {isoCode: country},
  } = useLocalization();

  const {
    data: {collection},
  } = filterPrice == true ?  
  useShopQuery({
    query: COLLECTION_FILTER_PRICE_QUERY,
    variables: {
      handle,
      language,
      country,
      pageBy,
      sortKey,
      sortReverse,
      filterMinPrice,
      filterMaxPrice
    },
    preload: true,
  })
  : filterAvailability == true ?  
  useShopQuery({
    query: COLLECTION_FILTER_AVAILABILITY_QUERY,
    variables: {
      handle,
      language,
      country,
      pageBy,
      sortKey,
      sortReverse,
      filterAvailability
    },
    preload: true,
  })
  : filterAvailability == false ?  
  useShopQuery({
    query: COLLECTION_FILTER_AVAILABILITY_QUERY,
    variables: {
      handle,
      language,
      country,
      pageBy,
      sortKey,
      sortReverse,
      filterAvailability
    },
    preload: true,
  })
  : filterAvailability === 'both' ?  
  useShopQuery({
    query: COLLECTION_QUERY,
    variables: {
      handle,
      language,
      country,
      pageBy,
      sortKey,
      sortReverse
    },
    preload: true,
  })
 :
  useShopQuery({
    query: COLLECTION_QUERY,
    variables: {
      handle,
      language,
      country,
      pageBy,
      sortKey,
      sortReverse
    },
    preload: true,
  })
  ;

  if (!collection) {
    return <NotFound type="collection" />;
  }

  useServerAnalytics({
    shopify: {
      canonicalPath: `/collections/${handle}`,
      pageType: ShopifyAnalyticsConstants.pageType.collection,
      resourceId: collection.id,
      collectionHandle: handle,
    },
  });

  return (
    <Layout>
      <Suspense>
        <Seo type="collection" data={collection} />
      </Suspense>
      <PageHeader heading={collection.title}>
        {collection?.description && (
          <div className="flex items-baseline justify-between w-full">
            <div>
              <Text format width="narrow" as="p" className="inline-block">
                {collection.description}
              </Text>
            </div>
          </div>
        )}
      </PageHeader>
      <CollectionFilter minPrice={filterMinPrice} maxPrice={filterMaxPrice} />
      <Section>
        <ProductGrid
          key={collection.id}
          collection={collection}
          url={`/collections/${handle}?country=${country}`}
        />
      </Section>
    </Layout>
  );
}

// API endpoint that returns paginated products for this collection
// @see templates/demo-store/src/components/product/ProductGrid.client.tsx
export async function api(request, {params, queryShop}) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: {Allow: 'POST'},
    });
  }
  const url = new URL(request.url);

  const cursor = url.searchParams.get('cursor');
  const country = url.searchParams.get('country');
  const {handle} = params;

  return await queryShop({
    query: PAGINATE_COLLECTION_QUERY,
    variables: {
      handle,
      cursor,
      pageBy,
      country,
    },
  });
}

const COLLECTION_QUERY = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
    $sortKey:  ProductCollectionSortKeys
    $sortReverse: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(first: $pageBy, after: $cursor, sortKey: $sortKey, reverse: $sortReverse) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const COLLECTION_FILTER_AVAILABILITY_QUERY = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
    $sortKey:  ProductCollectionSortKeys
    $sortReverse: Boolean
    $filterAvailability: Boolean
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(first: $pageBy, filters: { available: $filterAvailability}, after: $cursor, sortKey: $sortKey, reverse: $sortReverse) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const COLLECTION_FILTER_PRICE_QUERY = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionDetails(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
    $sortKey:  ProductCollectionSortKeys
    $sortReverse: Boolean
    $filterMinPrice: Float
    $filterMaxPrice: Float
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      seo {
        description
        title
      }
      image {
        id
        url
        width
        height
        altText
      }
      products(first: $pageBy, filters: { price: { min: $filterMinPrice, max: $filterMaxPrice } }, after: $cursor, sortKey: $sortKey, reverse: $sortReverse) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

const PAGINATE_COLLECTION_QUERY = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionPage(
    $handle: String!
    $pageBy: Int!
    $cursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $pageBy, after: $cursor) {
        nodes {
          ...ProductCard
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;
