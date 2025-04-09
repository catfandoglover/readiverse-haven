# **Introduction**

```
                        ╔═ turbopuffer ════════════════════════════╗
╔════════════╗          ║                                          ║░
║            ║░         ║  ┏━━━━━━━━━━━━━━━┓     ┏━━━━━━━━━━━━━━┓  ║░
║   client   ║░───API──▶║  ┃    Memory/    ┃────▶┃    Object    ┃  ║░
║            ║░         ║  ┃   SSD Cache   ┃     ┃ Storage (S3) ┃  ║░
╚════════════╝░         ║  ┗━━━━━━━━━━━━━━━┛     ┗━━━━━━━━━━━━━━┛  ║░
 ░░░░░░░░░░░░░░         ║                                          ║░
                        ╚══════════════════════════════════════════╝░
                         ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

```

turbopuffer is a fast search engine that combines vector and full-text search using object storage, making all your data easily searchable.

Using only object storage for state and NVMe SSD with memory cache for compute, turbopuffer scales horizontally to handle billions of documents.

The system caches only actively searched data while keeping the rest in low-cost object storage, offering competitive pricing. Cold queries process 1 million vectors in 500ms (p90), while warm queries take just 20ms (p50). This architecture means it's as fast as in-memory search engines when cached, but far cheaper to run.

Storing data in cache and object storage costs less than traditional replicated disk systems, even for frequently accessed data.

turbopuffer is focused on first-stage retrieval to efficiently narrow millions of documents down to tens or hundreds. While it may have fewer features than traditional search engines, this streamlined approach enables higher quality, more maintainable search applications that you can customize in your preferred programming language. See [Hybrid Search](https://turbopuffer.com/docs/hybrid-search) to get started.

To get started with turbopuffer, see the [quickstart guide](https://turbopuffer.com/docs/quickstart).

For more technical details, see [Architecture](https://turbopuffer.com/docs/architecture), [Guarantees](https://turbopuffer.com/docs/guarantees), and [Tradeoffs](https://turbopuffer.com/docs/tradeoffs).

# **Architecture**

The API routes to a cluster of Rust binaries that access your database on object storage (see [regions](https://turbopuffer.com/docs/regions) for more on routing).

After the first query, the namespace's documents are cached on NVMe SSD. Subsequent queries are routed to the same query node for cache locality, but any query node can serve queries from any namespace. The first query to a namespace reads object storage directly and is slow (p50=402ms for 1M documents), but subsequent, cached queries to that node are faster (p50=16ms for 1M documents). Many use-cases can send a pre-flight query to warm the cache so the user only ever experiences warm latency.

turbopuffer is a multi-tenant service, which means each `./tpuf` binary handles requests for multiple tenants. This keeps costs low. Enterprise customers can be isolated on request.

Client

turbopuffer

./tpuf

Cache (SSD/RAM)

Object storage

Each namespace has its own prefix on object storage. turbopuffer uses a write-ahead log (WAL) to ensure consistency. Every write adds a new file to the WAL directory inside the namespace's prefix. If a write returns successfully, data is guaranteed to be durably written to object storage. This means high write throughput (~10,000+ vectors/sec), at the cost of high write latency (p50=285 ms for 500KB).

Writes occur in windows of 100ms, i.e. if you issue concurrent writes to the same namespace within 100ms, they will be batched into one WAL entry. Each namespace can currently write 1 WAL entry per second. If a new batch is started within one second of the previous one, it will take up to 1 second to commit.

~200ms

User write

WAL /{org_id}/{namespace}/wal

001

002

003

004

/{org_id}/{namespace}/index

centroids.bin

Namespace Config

clusters-1.bin

clusters-2.bin

After data is committed to the log, it is asynchronously indexed to enable efficient retrieval (■). Any data that has not yet been indexed is still available to search (◈), with a slower exhaustive search of recent data in the log.

turbopuffer provides strong consistency by default, i.e. if you perform a write, a subsequent query will immediately see the write. In the future we will allow eventual consistency for lower warm latency, let us know if you need this ASAP.

Both the approximate nearest neighbour (ANN) index we use for vectors, as well as the inverted [BM25](https://en.wikipedia.org/wiki/Okapi_BM25) index we use for full-text search have been optimized for object storage to provide good cold latency (~500ms on 1M documents). Additionally, we build exact indexes for [metadata filtering](https://turbopuffer.com/docs/query#filter-parameters).

API

Client

turbopuffer region

LB

./tpuf query

./tpuf query

./tpuf query

./tpuf indexer

./tpuf indexer

Object Storage

Indexing Queue

/{org_id}/{namespace}

/wal

/index

Namespace Config

Vector indexes are based on [SPFresh](https://dl.acm.org/doi/10.1145/3600006.3613166). SPFresh is a centroid-based approximate nearest neighbour index. It has a fast index for locating the nearest centroids to the query vector. A centroid-based index works well for object storage as it minimizes roundtrips and write-amplification, compared to graph-based indexes like HNSW or DiskANN.

On a cold query, the centroid index is downloaded from object storage. Once the closest centroids are located, we simply fetch each cluster's offset in one, massive roundtrip to object storage.

/{org_id}/{namespace}/index

centroids.bin

Namespace Config

clusters-1.bin

clusters-2.bin

In reality, there are more roundtrips required for turbopuffer to support consistent writes and work on large indexes. From first principles, each roundtrip to object storage takes ~100ms. The 3-4 required roundtrips for a cold query often take as little as ~400ms.

When the namespace is cached in NVME/memory rather than fetched directly from object storage, the query time drops dramatically to ~16ms p50. The roundtrip to object storage for consistency, which we can relax on request for eventually consistent sub 10ms queries.

Metadata1

Filter index

Centroid index

Unindexed WAL

Clusters

Roundtrip 1

Roundtrip 22

Roundtrip 3

1. *Metadata is downloaded for the turbopuffer storage engine. The storage engine is optimized for minimizing roundtrips.*
2. *The second roundtrip starts navigating the first level of the indexes. In many cases, only one additional roundtrip is required. But the query planner makes decisions about how to efficiently navigate the indexes. It needs to settle tradeoffs between additional roundtrips and fetching more data in an existing roundtrip.*

1. 1. *Metadata is downloaded for the turbopuffer storage engine. The storage engine is optimized for minimizing roundtrips.*
2. 2. *The second roundtrip starts navigating the first level of the indexes. In many cases, only one additional roundtrip is required. But the query planner makes decisions about how to efficiently navigate the indexes. It needs to settle tradeoffs between additional roundtrips and fetching more data in an existing roundtrip.*

# **Guarantees**

This document serves as a brief reference of turbopuffer's guarantees:

- **Durable Writes.** Writes are committed to object storage upon successful return by turbopuffer's API.
- **Consistent Reads.** Queries return the latest data by default but can be [configured](https://turbopuffer.com/docs/query) for performance at the cost of read consistency. Most updates are visible immediately since queries usually hit the writing node. [Over 99.99% of queries return consistent data](https://turbopuffer.com/docs/query#param-consistency), however in rare cases (e.g. during scaling), reads may be briefly stale (typically limited to ~100ms, with a strict upper bound of 1 hour). The cache refreshes on every query, ensuring the latest writes appear next request.
- **Atomic Batches.** All writes in an upsert are applied simultaneously.
- **Any node can serve queries for any namespace.** HA does not come as a cost/reliability trade-off. Our HA is the number of query nodes we run.
- **Object storage is the only stateful dependency.** This means there is no separate consensus plane that needs to be maintained and scaled independently, simplifying the system's operations and thus reliability. All concurrency control is delegated to object storage.
- **Compute-Compute Separation.** Query nodes handle queries and writes to object storage and the write-through cache. All expensive computation happens on separate, auto-scaled indexing nodes.
- **Smart Caching.** After a cold query, data is cached on NVMe SSD and frequently accessed namespaces are stored in memory. turbopuffer does not need to load the entire namespace into cache, and then query it. The storage engine is designed to perform small, ranged reads directly to object storage for fast cold queries.
- **Autoscaling.** Query and indexing nodes are automatically scale with demand.

Regarding ACID properties: turbopuffer provides Atomicity, Consistency, and Durability. Isolation is not applicable as transactions are not supported.

For CAP theorem: turbopuffer prioritizes consistency over availability when object storage is unreachable. You can adjust this to favor availability through [query configuration](https://turbopuffer.com/docs/query).

For more details, see [Tradeoffs](https://turbopuffer.com/docs/tradeoffs), [Limits](https://turbopuffer.com/docs/limits), and [Architecture](https://turbopuffer.com/docs/architecture).

# **Tradeoffs**

Every technology has tradeoffs. This document outlines turbopuffer's key design choices to help inform your evaluation:

- **High latency, high throughput writes.** turbopuffer prioritizes simplicity, durability, and scalability by using object storage as a write-ahead log, keeping nodes stateless. While this means writes take up to 200ms to commit, the system supports thousands of writes per second per namespace. Despite this latency, our consistent read model makes documents visible to queries faster than eventually consistent search engines. This architecture choice enables our cost-effective scaling and is particularly well-suited for search workloads.
- **Focused on first-stage retrieval.** turbopuffer focuses on efficient first-stage retrieval, providing a simple API to filter millions of documents down to a manageable set. You can then refine and rerank results using familiar programming languages like Python or TypeScript, making your search logic easier to develop and maintain. Learn more about this approach in our [Hybrid Search](https://turbopuffer.com/docs/hybrid-search) guide. We've found that it's difficult to maintain search applications in mountains of idiosyncratic query language.
- **Optimized for accuracy.** turbopuffer delivers high recall out of the box, maintaining this quality even with complex filters. We prioritize consistent, accurate results over configurable performance optimizations.
- **Consistent reads have ~20ms latency floor.** turbopuffer's reads are consistent by default, checking object storage for the latest updates even for cached namespaces. This 20ms baseline latency matches our object storage's `GET IF-NOT-MATCH` p50 and should improve as object storage technology advances. For workloads requiring sub-10ms latency, you can [enable eventual consistency](https://turbopuffer.com/docs/query).
- **Occasional cold queries.** Since all data is not in memory or on disk all the time, turbopuffer will ocassionally need to do cold queries directly on top of object storage and rehydrate the cache. This means that e.g. P999 queries may be in the 100s of miliseconds range (see cold/hot [performance](https://turbopuffer.com/) on the landing page).
- **Scales to millions of namespaces.** turbopuffer scales to trillions of documents across hundreds of millions of namespaces. While you can create unlimited namespaces, individual namespaces have ever-expanding [size guidelines](https://turbopuffer.com/docs/limits). Namespacing your data means benefiting natural data partitioning (e.g. tenancy) for performance and cost.
- **Focused on paid customers.** For the current phase or our company we have chosen a commercial-only model to maintain high-quality support and rapid development. While we don't offer a free tier or open source version, you can run turbopuffer in your own cloud--[contact us](mailto:info@turbopuffer.com) for details.

For more details, see [Guarantees](https://turbopuffer.com/docs/guarantees), [Limits](https://turbopuffer.com/docs/limits), and [Architecture](https://turbopuffer.com/docs/architecture) pages.

# **Limits**

There isn't a limit or performance metric we can't improve by an order of magnitude when prioritized! If you expect to brush up against a limit or you are limited by present performance, [contact us](mailto:info@turbopuffer.com). Often can be fixed in days.

| **turbopuffer excels at** | **turbopuffer may not currently be the best fit for** |
| --- | --- |
| Large scale (1B+ documents/vectors) with lots of namespaces (tens of millions) | Large namespaces (250M+) with lots of queries |
| Naturally sharded data (e.g. B2B where each tenant's data is isolated in its own namespace) | Low scale, free tier |
| Cost-effectiveness | 🔜 Aggregation (e.g. group by, sums, explore clusters, ...) |
| Fast cold starts | Single-digit millisecond latency (tpuf is currently low double digits) |
| Reliability | Extensive 1st-stage ranking (we encourage generating a candidate set with hybrid search and refining/re-ranking further in your own 2nd stage) |
| Hybrid search (BM25 + vector search) | Built-in re-ranking (we encourage you to do it in your own application) |
| Support from DB Engineers | Built-in embedding (ditto) |
| Deploy into your VPC (BYOC) | Open Source |
| Heavy writes (Appends, Updates and Deletes) |  |

| **Metric** | **Max seen in production** | **Production limits (current)** | **Production limits (soon)** |
| --- | --- | --- | --- |
| Max documents (global) | 150B+ | Unlimited |  |
| Max documents (per namespace) | 200M | 100M | 1B+ |
| Number of namespaces | 40M+ | Unlimited |  |
| Max dimensions |  | 10,752 |  |
| Max inactive time in cache | ~3 days | Contact us for custom |  |
| Write rate (global) | 1M doc/s | Unlimited |  |
| Write rate (per namespace) | 10,000 doc/s | 10,000 doc/s |  |
| Max upsert batch request size | 256 MB | 256 MB |  |
| Max write batch rate (per namespace) | 1 batch/s | 1 batch/s | 4 batches/s |
| Max rows affected by [delete by filter](https://turbopuffer.com/docs/upsert#delete-by-filter) | 25M | ~10M |  |
| Max ingested, unindexed data | 2 GB | 2 GB |  |
| Queries (global) | 6K+ queries/s | Unlimited |  |
| Max queries/second (per namespace) | 100+ queries/s | 100+ queries/s | 10,000 QPS |
| Max concurrent queries per namespace | 16 | 16 |  |
| Vector search recall@10 | 90-100% | 90-100% | Configurable |
| Max attribute value | 8 MiB | 8 MiB |  |
| Max id size |  | 64 bytes |  |
| Max attribute name length | 128 | 128 |  |
| Max attribute names per namespace | 256 | 256 |  |
| Max namespace name length | 128 | 128 |  |
| Max full-text query length | 1,024 | 1,024 |  |
| Max topk | 10,000 | 1,200 |  |

# **Regions**

turbopuffer supports multiple regions, choose the one closest to your backend. The default is `gcp/us-central-1`.

| **Cloud** | **Region** | **Location** | **URL** |
| --- | --- | --- | --- |
| aws | ap-southeast-2 | Sydney | aws-ap-southeast-2.turbopuffer.com |
| aws | eu-central-1 | Frankfurt | aws-eu-central-1.turbopuffer.com |
| aws | us-east-1 | N. Virginia | aws-us-east-1.turbopuffer.com |
| aws | us-west-2 | Oregon | aws-us-west-2.turbopuffer.com |
| gcp | us-central1 | Iowa | gcp-us-central1.turbopuffer.com |
| gcp | us-west1 | Oregon | gcp-us-west1.turbopuffer.com |
| gcp | us-east4 | N. Virginia | gcp-us-east4.turbopuffer.com |
| gcp | europe-west3 | Frankfurt | gcp-europe-west3.turbopuffer.com |

We support Azure for "Deploy in your VPC", but no public regions yet. [Email us](mailto:info@turbopuffer.com) if you need a public Azure region.

In addition to these public clusters, we run dedicated clusters in various other regions for single-tenancy customers and in any region inside your VPC in AWS, GCP and Azure (BYOC). We can spin up dedicated or BYOC clusters in hours upon request, [email us](mailto:info@turbopuffer.com). We will continue to expand public regions with demand.

pythonts

Copy

`import turbopuffer as tpuf
# Choose region from turbopuffer.com/docs/regions, api.turbopuffer.com is default
# note: turbopuffer-python v0.1.16 or later is required
tpuf.api_base_url = "https://gcp-us-east4.turbopuffer.com"`

To move data between regions, use the [export](https://turbopuffer.com/docs/export) and [upsert](https://turbopuffer.com/docs/upsert) APIs with a client for each region.

## **Cross-Cloud Latency**

Since response times for vector search are typically above 10ms, the contribution of cross-cloud latency is generally acceptable. Traffic within a cloud provider's region is lower latency (< 1ms) than cross-cloud traffic (1-10ms), even if the providers are geographically close. For larger customers, cross-cloud interconnects can be set up to reduce network latency.

## **Cross-Cloud Egress Fees**

A common misconception is that as long as your vendor is in the same Cloud as you (e.g. AWS ↔️ AWS), you will be charged lower networking fees. This is generally not the case, as most providers' API endpoints point to public IPs that route through the public internet, unless you've set up a private connect (see below; you'll know if you have). Any traffic leaving your VPC incurs $0.05-0.09/GB Internet egress fees ([AWS](https://aws.amazon.com/ec2/pricing/on-demand/) / [GCP](https://cloud.google.com/vpc/network-pricing#all-networking-pricing)/ [Azure](https://azure.microsoft.com/en-us/pricing/details/bandwidth/)).

Egress networking fees are charged to you on your bill by your provider. For larger customers, we will work with you to set up AWS Private Link, GCP Private Service Connect, Azure Private Link or an interconnect to reduce networking fees to $0.01/GB. Unless you're transferring tens of billions of vectors per month, this is unlikely to have a large effect on your bill (1B vectors = 6TB would be $600 of egress, not a significant issue).

# **Quickstart Guide**

Get a quick feel for the API with some examples.

- [Python Client](https://github.com/turbopuffer/turbopuffer-python)
- [TypeScript Client](https://github.com/turbopuffer/turbopuffer-typescript)
- [Community Rust client](https://crates.io/crates/turbopuffer-client)
- [Sample Python notebook](https://colab.research.google.com/drive/17i4sfFTeJQkINCxjBaOGOZeENZr4ZaTE)
- [Community tool to migrate vectors between providers](https://github.com/AI-Northstar-Tech/vector-io)

curlpythontypescript

Copy

`// $ npm install turbopuffer
import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  // API tokens are created in the dashboard https://turbopuffer.com/dashboard
  apiKey: process.env.TURBOPUFFER_API_KEY,
  // Pick the right region https://turbopuffer.com/docs/regions
  baseUrl: "https://gcp-us-central1.turbopuffer.com",
});

const ns = tpuf.namespace(`namespace-a-ts-${Date.now()}`);

// Upsert documents with vectors and attributes
await ns.upsert({
  vectors: [
    {
      id: 1,
      vector: await openaiOrRandVector("walrus narwhal"),
      attributes: {
        name: "foo",
        public: 1,
        text: "walrus narwhal",
      },
    },
    {
      id: 2,
      vector: await openaiOrRandVector("elephant walrus rhino"),
      attributes: {
        name: "foo",
        public: 0,
        text: "elephant walrus rhino",
      },
    },
  ],
  distance_metric: "cosine_distance",
  schema: {
    text: {
      // Configure FTS/BM25, other attributes have inferred types (name: str, public: int)
      type: "string",
      // More schema & FTS options https://turbopuffer.com/docs/schema
      full_text_search: true,
    },
  },
});

// Query nearest neighbors with filter
let results = await ns.query({
  vector: await openaiOrRandVector("walrus narwhal"),
  top_k: 10,
  distance_metric: "cosine_distance",
  filters: [
    "And",
    [
      ["name", "Eq", "foo"],
      ["public", "Eq", 1],
    ],
  ],
  include_attributes: ["name"],
  include_vectors: false,
});
console.log(results);
// [{ id: 1, attributes: { name: 'foo' }, dist: 0.009067952632904053 }]

// Full-text search on an attribute
// If you want to combine FTS and vector search, see https://turbopuffer.com/docs/hybrid-search
results = await ns.query({
  top_k: 10,
  distance_metric: "cosine_distance",
  filters: ["name", "Eq", "foo"],
  rank_by: ["text", "BM25", "quick walrus"],
});
console.log(results);
// [{ id: 1, attributes: { name: 'foo' }, dist: 0.19 }]
// [{ id: 2, attributes: { name: 'foo' }, dist: 0.168 }]

// Vectors can be updated by passing new data for an existing ID
await ns.upsert({
  vectors: [
    {
      id: 1,
      vector: await openaiOrRandVector("foo"),
      attributes: {
        name: "foo",
        public: 1,
      },
    },
    {
      id: 2,
      vector: await openaiOrRandVector("foo"),
      attributes: {
        name: "foo",
        public: 1,
      },
    },
    {
      id: 3,
      vector: await openaiOrRandVector("foo"),
      attributes: {
        name: "foo",
        public: 1,
      },
    },
  ],
  distance_metric: "cosine_distance",
});

// Vectors are deleted by ID. Under the hood,
// this upserts with the `vector` set to `null`
await ns.delete({ ids: [1, 3] });

// Create an embedding with OpenAI, could be {Cohere, Voyage, Mixed Bread, ...}
// Requires OPENAI_API_KEY to be set (https://platform.openai.com/settings/organization/api-keys)
async function openaiOrRandVector(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY not set, using random vectors");
    return [Math.random(), Math.random()];
  }
  try {
    const { OpenAI } = await import("openai");
    return (
      await new OpenAI().embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      })
    ).data[0].embedding;
  } catch {
    console.log(
      "OpenAI package not installed, using random vectors (`npm install openai`)",
    );
    return [Math.random(), Math.random()];
  }
}`

# **Vector Search Guide**

turbopuffer supports vector search with [filtering](https://turbopuffer.com/docs/query#filtering). Vectors are incrementally indexed in an SPFresh vector index for performant search. Writes appear in search results immediately.

The vector index is automatically tuned for 90-100% recall ("accuracy"). We automatically [monitor recall](https://turbopuffer.com/blog/continuous-recall) for production queries. You can use the [recall endpoint](https://turbopuffer.com/docs/recall) to test yourself.

curlpythontypescript

Copy

`// $ npm install turbopuffer
import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  // API tokens are created in the dashboard https://turbopuffer.com/dashboard
  apiKey: process.env.TURBOPUFFER_API_KEY,
  // Pick the right region https://turbopuffer.com/docs/regions
  baseUrl: "https://gcp-us-central1.turbopuffer.com",
});

const ns = tpuf.namespace(`vector-ts-1-${Date.now()}`);
await ns.upsert({
  vectors: [
    {
      id: 1,
      vector: await openaiOrRandVector("A cat sleeping on a windowsill"),
      attributes: {
        text: "A cat sleeping on a windowsill",
        category: "animal",
      },
    },
    {
      id: 2,
      vector: await openaiOrRandVector("A playful kitten chasing a toy"),
      attributes: {
        text: "A playful kitten chasing a toy",
        category: "animal",
      },
    },
    {
      id: 3,
      vector: await openaiOrRandVector("An airplane flying through clouds"),
      attributes: {
        text: "An airplane flying through clouds",
        category: "vehicle",
      },
    },
  ],
  distance_metric: "cosine_distance",
});

// Basic vector search
let results = await ns.query({
  vector: await openaiOrRandVector("cat-like animal"),
  top_k: 2,
  distance_metric: "cosine_distance",
  include_attributes: ["text"],
});
// Returns cat and kitten documents, sorted by vector similarity
console.log(results);

const ns2 = tpuf.namespace(`vector-ts-2-${Date.now()}`);
// Advanced Example
await ns2.upsert({
  vectors: [
    {
      id: 1,
      vector: await openaiOrRandVector("A shiny red sports car"),
      attributes: {
        description: "A shiny red sports car",
        color: "red",
        type: "car",
        price: 50000,
      },
    },
    {
      id: 2,
      vector: await openaiOrRandVector("A sleek blue sedan"),
      attributes: {
        description: "A sleek blue sedan",
        color: "blue",
        type: "car",
        price: 35000,
      },
    },
    {
      id: 3,
      vector: await openaiOrRandVector("A large red delivery truck"),
      attributes: {
        description: "A large red delivery truck",
        color: "red",
        type: "truck",
        price: 80000,
      },
    },
    {
      id: 4,
      vector: await openaiOrRandVector("A blue pickup truck"),
      attributes: {
        description: "A blue pickup truck",
        color: "blue",
        type: "truck",
        price: 45000,
      },
    },
  ],
  distance_metric: "cosine_distance",
});

// Advanced vector search with filters
results = await ns2.query({
  vector: await openaiOrRandVector("car"), // Embedding similar to "car"
  top_k: 10,
  distance_metric: "cosine_distance",
  // Complex filter combining multiple conditions
  filters: [
    "And",
    [
      ["color", "Eq", "blue"],
      ["price", "Lt", 40000],
      ["type", "Eq", "car"],
    ],
  ],
  include_attributes: ["description", "price"],
});
// Returns only blue cars under $40k, sorted by similarity to the query vector
console.log(results);

// Vector search with multiple vectors
results = await ns2.query({
  // Search for vehicles similar to either a car or truck
  vectors: [await openaiOrRandVector("car"), await openaiOrRandVector("truck")],
  top_k: 3,
  distance_metric: "cosine_distance",
  vector_query_mode: "or", // Match any of the query vectors
  include_attributes: ["description"],
});
console.log(results);

async function openaiOrRandVector(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY not set, using random vectors");
    return [Math.random(), Math.random()];
  }
  try {
    const { OpenAI } = await import("openai");
    return (
      await new OpenAI().embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      })
    ).data[0].embedding;
  } catch {
    console.log(
      "OpenAI package not installed, using random vectors (`npm install openai`)",
    );
    return [Math.random(), Math.random()];
  }
}`

# **Full-Text Search Guide**

Currently, the vector attribute is required for full-text search. We'll remove this requirement soon. If you only need FTS, set the vector to a short, random vector.

turbopuffer supports BM25 full-text search for [string and []string types](https://turbopuffer.com/docs/schema). This guide shows how to configure and use full-text search with different options.

turbopuffer's full-text search engine has been written from the ground up for the turbopuffer storage engine for low latency searches directly on object storage.

For hybrid search combining both vector and BM25 results, see [Hybrid Search](https://turbopuffer.com/docs/hybrid-search).

For all available full-text search options, see the [Schema documentation](https://turbopuffer.com/docs/schema#languages-for-full-text-search).

curlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  // API tokens are created in the dashboard https://turbopuffer.com/dashboard
  apiKey: process.env.TURBOPUFFER_API_KEY,
  // Pick the right region https://turbopuffer.com/docs/regions
  baseUrl: "https://gcp-us-central1.turbopuffer.com",
});

const ns = tpuf.namespace(`fts-ts-1-${Date.now()}`);

await ns.upsert({
  vectors: [
    {
      id: 1,
      vector: [Math.random(), Math.random()],
      attributes: {
        content:
          "turbopuffer is a fast search engine with FTS, filtering, and vector search support",
      },
    },
    {
      id: 2,
      vector: [Math.random(), Math.random()],
      attributes: {
        content:
          "turbopuffer can store billions and billions of documents cheaper than any other search engine",
      },
    },
    {
      id: 3,
      vector: [Math.random(), Math.random()],
      attributes: {
        content:
          "turbopuffer will support many more types of queries as it evolves. turbopuffer will only get faster.",
      },
    },
  ],
  distance_metric: "cosine_distance",
  schema: {
    content: {
      type: "string",
      // Enable BM25 with default settings
      // For all config options, see https://turbopuffer.com/docs/schema
      full_text_search: true,
    },
  },
});

// Basic FTS search, to combine with vector search, see https://turbopuffer.com/docs/hybrid-search
let results = await ns.query({
  rank_by: ["content", "BM25", "turbopuffer"],
  top_k: 10,
  include_attributes: ["content"],
});
// [3, 1, 2] is the default BM25 ranking based on document length and term frequency
console.log(results);

// Simple phrase matching filter, to limit results to documents that contain the terms "search" and "engine"
let results = await ns.query({
  rank_by: ["content", "BM25", "turbopuffer"],
  top_k: 10,
  filters: ["content", "ContainsAllTokens", "search engine"],
  include_attributes: ["content"],
});
// [1, 2] (same as above, but without document 3)
console.log(results);

const ns2 = tpuf.namespace("fts-ts-2");
// Advanced Example
await ns2.upsert({
  vectors: [
    {
      id: 1,
      vector: [Math.random(), Math.random()],
      attributes: {
        title: "Getting Started with Python",
        content:
          "Learn Python basics including variables, functions, and classes",
        tags: ["python", "programming", "beginner"],
        language: "en",
        publish_date: 1709251200,
      },
    },
    {
      id: 2,
      vector: [Math.random(), Math.random()],
      attributes: {
        title: "Advanced TypeScript Tips",
        content: "Discover advanced TypeScript features and type system tricks",
        tags: ["typescript", "javascript", "advanced"],
        language: "en",
        publish_date: 1709337600,
      },
    },
    {
      id: 3,
      vector: [Math.random(), Math.random()],
      attributes: {
        title: "Python vs JavaScript",
        content: "Compare Python and JavaScript for web development",
        tags: ["python", "javascript", "comparison"],
        language: "en",
        publish_date: 1709424000,
      },
    },
  ],
  distance_metric: "cosine_distance",
  schema: {
    title: {
      type: "string",
      full_text_search: {
        // See all FTS indexing options at https://turbopuffer.com/docs/schema
        language: "english",
        stemming: true,
        remove_stopwords: true,
        case_sensitive: false,
      },
    },
    content: {
      type: "string",
      full_text_search: {
        language: "english",
        stemming: true,
        remove_stopwords: true,
      },
    },
    tags: {
      type: "[]string",
      full_text_search: {
        stemming: false,
        remove_stopwords: false,
        case_sensitive: true,
      },
    },
  },
});

// Advanced FTS search, to combine with vector search, see https://turbopuffer.com/docs/hybrid-search
// In this example, hits on `title` and `tags` are weighted / boosted higher than hits on `content`
results = await ns2.query({
  // See all FTS query options at https://turbopuffer.com/docs/query
  rank_by: [
    "Sum",
    [
      ['Product', [3, ["title", "BM25", "python beginner"]]],
      ['Product', [2, ["tags", "BM25", "python beginner"]]],
      ["content", "BM25", "python beginner"],
    ],
  ],
  filters: [
    "And",
    [
      ["publish_date", "Gte", 1709251200],
      ["language", "Eq", "en"],
    ],
  ],
  top_k: 10,
  include_attributes: ["title", "content", "tags"],
});
console.log(results);`

# **Hybrid Search**

```
             ┌─{search.py,search.ts}─────────────────────────────────────────────────┐
             │                    ┌─turbopuffer queries────┐                         │
             │                    │  ┌───────────────────┐ │                         │
             │                    ├─▶│  Vector Query 1   │─┤                         │
             │ ┌ ─ ─ ─ ─ ─ ─ ─ ─  │  └───────────────────┘ │  ┌──────┐               │
┌──────────┐ │  Query Rewriting │ │  ┌───────────────────┐ │  │ Rank │   ┌ ─ ─ ─ ─ ┐ │
│User Query│─┼▶│(Language Model) ─┼─▶│  Vector Query 2   │─┼─▶│ Fuse │──▶  Re-Rank   │
└──────────┘ │  ─ ─ ─ ─ ─ ─ ─ ─ ┘ │  └───────────────────┘ │  └──────┘   └ ─ ─ ─ ─ ┘ │
             │                    │  ┌───────────────────┐ │                         │
             │                    ├─▶│   Text Query 1    │─┤                         │
             │                    │  └───────────────────┘ │                         │
             │                    └────────────────────────┘                         │
             └───────────────────────────────────────────────────────────────────────┘

```

To improve search quality, multiple strategies can be used together. This is commonly referred to as hybrid search.

turbopuffer supports vector search and BM25 full-text search. Combining them produces semantically relevant search results (vectors), as well as results matching specific words or strings (i.e. product SKUs, email addresses, weighing exact keywords highly).

Keep search logic in `{search.py, search.ts}`. Use turbopuffer for initial retrieval to narrow millions of results to dozens for rank fusion and re-ranking.

To improve search results further, we suggest:

- Using a re-ranker (such as [Cohere](https://cohere.com/rerank), [MixedBread](https://www.mixedbread.ai/docs/reranking/overview), or [Voyage](https://docs.voyageai.com/docs/reranker))
- Building a test suite of queries and ideal results, and evaluate NDCG ([blog post](https://softwaredoug.com/blog/2021/02/21/what-is-a-judgment-list))
- Building a query rewriting layer ([LlamaIndex resource](https://docs.llamaindex.ai/en/stable/examples/query_transformations/query_transform_cookbook/))
- Trying various chunking strategies ([LangChain resource](https://js.langchain.com/v0.1/docs/modules/data_connection/document_transformers/))
- Trying [contextual retrieval](https://www.anthropic.com/news/contextual-retrieval), or otherwise rewriting the chunks to be embedded
- Adding additional multi-modal data to query, e.g. embeddings of the images ([Cohere image model](https://docs.cohere.com/v2/docs/embeddings#image-embeddings), [Voyage image model](https://docs.voyageai.com/docs/multimodal-embeddings))

pythontypescript

Copy

`// $ npm install turbopuffer
import { Turbopuffer, QueryResults } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  // API tokens from https://turbopuffer.com/dashboard
  apiKey: process.env.TURBOPUFFER_API_KEY,
  // Pick the right region https://turbopuffer.com/docs/regions
  baseUrl: "https://gcp-us-central1.turbopuffer.com",
});

const ns = tpuf.namespace(`hybrid-ts-1-${Date.now()}`);

// Upsert documents with both FTS and vector search capabilities
await ns.upsert({
  vectors: [
    {
      id: 1,
      vector: await openaiOrRandVector(
        "Muesli: A mix of raw oats, nuts and dried fruit served with cold milk",
      ),
      attributes: {
        content:
          "Muesli: A quick mix of raw oats, nuts and dried fruit served with cold milk",
      },
    },
    {
      id: 2,
      vector: await openaiOrRandVector(
        "Classic chia seed pudding is a cold breakfast that takes 5 minutes to prepare",
      ),
      attributes: {
        content:
          "Classic chia seed pudding is a cold breakfast that takes 5 minutes to prepare",
      },
    },
    {
      id: 3,
      vector: await openaiOrRandVector(
        "Overnight oats: Mix oats with milk, refrigerate overnight for a delicious chilled breakfast",
      ),
      attributes: {
        content:
          "Overnight oats: Mix oats with milk, refrigerate overnight for a delicious chilled breakfast",
      },
    },
    {
      id: 4,
      vector: await openaiOrRandVector(
        "Hot oatmeal is a quick and healthy breakfast",
      ),
      attributes: { content: "Hot oatmeal is a quick and healthy breakfast" },
    },
    {
      id: 5,
      vector: await openaiOrRandVector(
        "Breakfast sandwich: A little extra prep, but worth it on Sunday mornings!",
      ),
      attributes: {
        content:
          "Breakfast sandwich: A little extra prep, but worth it on Sunday mornings!",
      },
    },
  ],
  distance_metric: "cosine_distance",
  schema: { content: { type: "string", full_text_search: true } },
});

const query = "quick breakfast like oatmeal but cold";
console.log("Ideal:", [1, 2, 3, 4, 5]);

// ===============================================
// FTS and Vector Search
// ===============================================
const [ftsResult, vectorResult] = await Promise.all([
  ns.query({
    rank_by: ["content", "BM25", query],
    include_attributes: ["content"],
    top_k: 10,
  }),
  ns.query({
    vector: await openaiOrRandVector(query),
    include_attributes: ["content"],
    top_k: 10,
  }),
]);

// FTS:    [4, 1, 2, 5, 3], matches Muesli well (NDCG: 0.72)
// Vector: [4, 3, 2, 1, 5], picks up on overnight oats, but not Muesli! (NDCG: 0.63)
// Ideal:  [1, 2, 3, 4, 5]
console.log(
  "FTS:",
  ftsResult.map((item) => item.id),
);
console.log(
  "Vector:",
  vectorResult.map((item) => item.id),
);

// ===============================================
// Rank Fusion
// ===============================================
// There are many ways to fuse the results, see https://github.com/AmenRa/ranx?tab=readme-ov-file#fusion-algorithms
// That's why it's not built into turbopuffer (yet), as you may otherwise not be
// able to express the fusing you need.
function reciprocalRankFusion(resultLists: any[], k: number = 60): any[] {
  const scores: { [key: string]: number } = {};
  const allResults: { [key: string]: any } = {};
  for (const results of resultLists) {
    for (let rank = 1; rank <= results.length; rank++) {
      const item = results[rank - 1];
      scores[item.id] = (scores[item.id] || 0) + 1.0 / (k + rank);
      allResults[item.id] = item;
    }
  }
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([docId, score]) => {
      allResults[docId].dist = score;
      return allResults[docId];
    });
}

// Better than FTS or Vector alone, but still weighs the "hot oatmeal" highly.
// To fix that, we need a re-ranker to bring some more FLOPS to the table.
// Ideal: [1, 2, 3, 4, 5]
// Fused: [4, 1, 2, 3, 5] (NDCG: 0.73)
const fusedResults = reciprocalRankFusion([ftsResult, vectorResult]);
console.log(
  "Fused:",
  fusedResults.map((item) => item.id),
);

// ===============================================
// Reranking
// ===============================================
// See alternative re-rankers turbopuffer.com/docs/hybrid
async function cohereRerankOrUnranked(results: QueryResults, query: string, k?: number): Promise<any[]> {
  if (!process.env.COHERE_API_KEY) {
    console.warn(
      "Warning: COHERE_API_KEY not set (https://dashboard.cohere.com/api-keys), returning unranked results",
    );
    return results;
  }
  try {
    const { CohereClient } = await import("cohere-ai");
    const co = new CohereClient({ token: process.env.COHERE_API_KEY });
    const docs = results.map((r) =>
      Object.fromEntries(
        Object.entries(r.attributes!).map(([k, v]) => [k, String(v)]),
      ),
    );

    const reranked = await co.rerank({
      query: query,
      documents: docs,
      topN: k || docs.length,
    });

    return reranked.results.map((r) => ({
      id: results[r.index].id,
      score: r.relevanceScore,
    }));
  } catch (e) {
    console.warn(
      "Warning: cohere package not installed (`npm install cohere-ai`), returning unranked results",
    );
    return results;
  }
}

// Weighs the slow overnight oats higher than the chia pudding, but not bad!
// Cohere: [1, 3, 2, 4, 5] (NDCG: 0.97)
// Ideal: [1, 2, 3, 4, 5]
const cohereResults = await cohereRerankOrUnranked(fusedResults, query);
console.log(
  "Reranked:",
  cohereResults.map((item) => item.id),
);

// Create an embedding with OpenAI, could be {Cohere, Voyage, Mixed Bread, ...}
// Requires OPENAI_API_KEY to be set (https://platform.openai.com/settings/organization/api-keys)
async function openaiOrRandVector(text: string): Promise<number[]> {
  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY not set, using random vectors");
    return [Math.random(), Math.random()];
  }
  try {
    const { OpenAI } = await import("openai");
    return (
      await new OpenAI().embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      })
    ).data[0].embedding;
  } catch {
    console.log(
      "OpenAI package not installed, using random vectors (`npm install openai`)",
    );
    return [Math.random(), Math.random()];
  }
}`

# **Testing**

In your tests and development environment we suggest hitting production turbopuffer for the best end to end testing. Since creating a namespace in turbopuffer is virtually free, you can create a namespace for each test with a random name, and simply delete it after the test. We recommend each developer has their own namespace for their dev namespaces.

In addition, to separate test and production, consider creating a separate organization in the dashboard.

pythontypescript

Copy

`import { Turbopuffer, Namespace } from "@turbopuffer/turbopuffer";
import * as crypto from "crypto";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY!,
});

describe("Turbopuffer namespace tests", () => {
  let ns: Namespace;

  beforeEach(async () => {
    const randomSuffix = crypto.randomBytes(length).toString("hex").slice(0, length);
    const nsName = `test-${randomSuffix}`;
    ns = tpuf.namespace(nsName);
  });

  afterEach(async () => {
    try {
      await ns.deleteAll();
    } catch (e: any) {
      if (e.statusCode !== 404) {
        throw e;
      }
    }
  });

  test("query test", async () => {
    await ns.upsert({
      vectors: [
        { id: 1, vector: [1, 1] },
        { id: 2, vector: [2, 2] },
      ],
      distance_metric: "euclidean_squared",
    });
    const res = await ns.query({
      vector: [1.1, 1.1],
      distance_metric: "euclidean_squared",
    });
    expect(res[0].id).toBe(1);
  });
});`

# **Optimizing Performance**

turbopuffer is designed to be performant by default, but there are ways to optimize performance further. These suggestions aren't requirements for good performance--rather, they highlight opportunities for improvement when you have the flexibility to choose.

For example, while a single namespace with 10M documents works fine, splitting it into 10 namespaces of 1M documents each will yield better query performance if there's a natural way to group the documents.

- **Choose the [region](https://turbopuffer.com/docs/regions) closest to your backend.** We can't beat the speed of light. If there isn't a region close to us and the latency is paramount, [contact us.](mailto:info@turbopuffer.com)
- **U64 or UUID IDs**: The smaller the IDs, the faster the puffin'. A UUID encoded as a string is 36 bytes, whereas the [UUID-native type is 16 bytes](https://turbopuffer.com/docs/schema). A u64 is even smaller at 8 bytes.
- **filterable: false**. For attributes you never intend to filter on, marking [attributes as filterable: false](https://turbopuffer.com/docs/schema) will improve indexing performance and grant you a 50% discount. For large attribute values this can improve performance and cost significantly.
- **Use small namespaces.** The rule of thumb is to make the namespaces as small as they can be without having to routinely query more than one at a time. If documents have significantly different schemas, it's also worth splitting them. Don't try to be too clever. Smaller namespaces will be faster to query and index.
- **Prewarm namespaces with dark queries.** If your application is latency-sensitive, consider sending a query to the namespace before the user interacts with it (e.g. when they open the search or chat dialog) to start warming the cache for the namespace.
- **Smaller vectors are faster.** Smaller vectors will be faster to search, e.g. 512 dimensions will be faster than 1536 dimensions. As you lose dimensions, you generally also lose precision, so you should consider the tradeoffs with your own evals and benchmarks.
- **Batch upserts.** If you're upserting a lot of documents, consider batching them into fewer upserts. This will improve performance and [leverages batch discounts up to 50%](https://turbopuffer.com/#pricing). Each individual upsert batch request can be a maximum of 256MB.
- **Concurrent upserts.** If you're upserting a lot of documents, consider using multiple processes to upsert batches in parallel. Especially for single-threaded runtimes like Node.js or Python, this can be a significant performance boost as upserting is generally bottlenecked by serialization and compression.
- **Control include_attributes & include_vectors.** The more data we have to return, the slower it will be. Make sure to only specify the attributes you need.

# **API Overview**

The API currently doesn't have an OpenAPI spec, but we expect to ship one soon.

## **Authentication**

All API calls require authenticating with your API token. You can create and expire tokens in the [dashboard](https://turbopuffer.com/dashboard).

The HTTP API expects the API token to be formatted as a standard Bearer token and passed in the Authorization header:

```
Authorization: Bearer <API_TOKEN>

```

## **Encoding**

The API uses JSON encoding for both request and response payloads.

## **Compression**

JSON encoded document payloads can be quite large. To save on networking costs, we recommend compressing your requests, and accepting compressed responses. The API supports standard HTTP compression headers.

Compress your request payload and include `Content-Encoding: gzip` to enable compressed requests.

Include `Accept-Encoding: gzip` to enable compressed responses.

The official client libraries will use compression by default.

## **Error responses**

If an error occurs for your request, all endpoints will return a JSON payload in the format:

Response

```json
{
  "status": "error",
  "error": "an error message"
}

```

You may encounter an `HTTP 429` if you query or upsert too quickly. See [limits](https://turbopuffer.com/docs/limits) for more information.

# **Upsert & Delete Documents**

## **POST /v1/namespaces/:namespace**

Creates, updates, or deletes documents.

**Upsert latency**

**500kb docs**

Percentile

Latency

p50

285ms

p90

370ms

p99

688ms

A `:namespace` is an isolated set of documents and is implicitly created when the first document is inserted. Within a namespace, documents are uniquely referred to by their ID. Upserting a document will overwrite any existing document with the same ID.

If this endpoint returns OK, data is guaranteed to be durably written to object storage. By default, writes are immediately visible to queries. You can read more about how upserts work on the [Architecture page](https://turbopuffer.com/architecture).

A namespace name can only contain ASCII alphanumeric characters, plus the `-`, `_`, and `.` special characters, and cannot be longer than 128 characters (i.e. must match `[A-Za-z0-9-_.]{1,128}`).

For performance, we recommend creating a namespace per isolated document space instead of filtering when possible. See [Performance](https://turbopuffer.com/docs/performance).

Each upsert can have a maximum payload size of 256 MB. For performance, we recommend writing in large batches for maximum throughput, to account for the latency of writing to object storage.

Upserts can be columnar by using `ids`, `vectors`, and `attributes` or row-based by using `upserts`.

Deletes are performed by sending a `null` vector.

Attributes must have consistent value types. For example, if a document is upserted containing attribute key `foo` with a string value, all future documents that specify `foo` must also use a string value (or null). The schema is automatically inferred, but can be [configured](https://turbopuffer.com/docs/upsert#schema) to control type and indexing behavior.

### **Parameters**

**ids** arrayrequired unless {upserts, copy_from_namespace} is set

Document IDs are unsigned 64-bit integers, 128-bit UUIDs, or strings. Mixing ID types is not supported.

Integer and string ID types are inferred automatically. UUIDs serialize as a string, and require passing `uuid` as the `id` type in the [Schema](https://turbopuffer.com/docs/upsert#schema) of the first upsert to tell turbopuffer to parse the UUID and store it in an optimized format.

**Example:** `[1, 2, 3]`

---

**vectors** array<array<f32|f16>> | array<f32|16> | array<string> | stringrequired unless {upserts, copy_from_namespace} is set

Must be a nested array of the same length as the `ids` field or a flat array of length `ids * vector_dimensions`.

To delete one or more vectors, pass `null` in the `vectors` field.

To use `f16` vectors, the [`vector` field must be explicitly specified in the `schema`](https://turbopuffer.com/docs/schema#param-vector) when first creating the namespace.

Each vector in the namespace must have the same number of dimensions.

**Example:** `[[1, 2, 3], [4, 5, 6], null]`

As an alternative to passing a nested number array, an array of base64-encoded strings of the vectors can be passed. The input to base64 encoding is each vector serialized in a little-endian float32 binary format. The vectors may also be concatenated before base64 encoding and then passed as a single flat string.

The base64 string encoding can be more efficient on both the client and server.

**Example:** `["AACAPwAAAEAAAEBA", "AACAQAAAoEAAAMBA", null]`

---

**distance_metric** cosine_distance | euclidean_squaredrequired unless copy_from_namespace is set

The function used to calculate vector similarity. Possible values are `cosine_distance` or `euclidean_squared`.

`cosine_distance` is defined as `1 - cosine_similarity` and ranges from 0 to 2. Lower is better.

`euclidean_squared` is defined as `sum((x - y)^2)`. Lower is better.

---

**attributes** object

Documents can optionally include attributes, which can be used to [filter search results](https://turbopuffer.com/docs/query#filtering) or for [FTS indexes](https://turbopuffer.com/docs/query#full-text-search).

Attributes are key/value mappings, where keys are strings, and values are a [supported type](https://turbopuffer.com/docs/upsert#schema). Value types are inferred on upserts.

This parameter is an object where the keys are the attribute names, and the values are arrays of attribute values. Each array must be the same length as the `ids` field.

When a document doesn't have a value for a given attribute, pass `null`.

If a new attribute is added, the new attribute will default to `null` for past documents.

Some limits apply to attribute sizes and number of attribute names per namespace. See [Limits](https://turbopuffer.com/docs/limits).

**Example:** `{"color": [null, "red", "blue"], "size": [10, 20, null]}`

---

**copy_from_namespace** string

Copy all documents from a namespace into this namespace. This operation is currently limited to copying within the same region and organization. The initial request currently cannot make schema changes or contain documents. Contact us if you need any of this.

Copying is billed at a 50% write discount which stacks with the up to 50% discount for batched writes. This is a faster, cheaper alternative to re-upserting documents for backups and namespaces that share documents.

**Example:** `"source-namespace"`

---

**schema** object

By default, the schema is inferred from the passed data. See [Defining the Schema](https://turbopuffer.com/docs/upsert#schema) below for details.

There are cases where you want to manually specify the schema because turbopuffer can't automatically infer it. For example, to specify UUID types, configure full-text search for an attribute, or disable filtering for an attribute.

**Example:** `{"permissions": "[]uuid", "text": {"type": "string", "full_text_search": true}, "encrypted_blob": {"type": "string", "filterable": false}}`

---

**upserts** object

Instead of specifying the upserts in a column-based format, you can use this optional param to specify them in a row-based format, if that's more convenient (there's no difference in behavior).

Each upsert in this list should specify an `id`, and optionally specify a `vector` and `attributes`, as defined above. If `vector` is not provided, or has value `null`, the operation is considered a delete.

**Example:** `[{"id": "1", "vector": [1, 2, 3], "attributes": {"color": "red", "size": 10}}, {"id": "2", "attributes": {"color": "blue", "size": 20}}]`

---

**delete_by_filter** object

You can delete documents that match a filter using [delete_by_filter](https://turbopuffer.com/docs/upsert#delete-by-filter). It has the same syntax and parameters as the [`filters` parameter in the query API](https://turbopuffer.com/docs/query#filtering).

**Example:** `['And', [['title', 'IGlob', '*guide*'], ['views', 'Lte', 1000]]]`

---

**encryption** objectoptional

Only available as part of our enterprise offerings. [Contact us](mailto:sales@turbopuffer.com).

Setting a Customer Managed Encryption Key (CMEK) will encrypt all data in a namespace using a secret coming from your cloud KMS. Once set, all subsequent writes to this namespace will be encrypted, but data written prior to this upsert will be unaffected.

Currently, turbopuffer does not re-encrypt data when you rotate key versions, meaning old data will remain encrypted using older key verisons, while fresh writes will be encrypted using the latest versions. **Revoking old key versions will cause data loss.** To re-encrypt your data using a more recent key, use the [export](https://turbopuffer.com/docs/export) API to re-upsert into a new namespace.

**Example:** `{ "cmek": { "key_name": "projects/myproject/locations/us-central1/keyRings/EXAMPLE/cryptoKeys/KEYNAME" } }`

### **Examples**

### **Update or Insert**

Bulk document operations use a column-oriented layout for documents, ids, and attributes. See below for the [row-based API](https://turbopuffer.com/docs/upsert#row-based). Each batch is applied atomically, i.e. you won't see partial query results for a batch.

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

// Make a new client
const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

// Instantiate an object to work with a namespace
const ns = tpuf.namespace("namespace-name");

// Upsert some vectors
// The TypeScript client only supports the row-based upsert API
await ns.upsert({
  vectors: [
    {
      id: 1,
      vector: [0.1, 0.1],
      attributes: {
        "my-string": "one",
        "my-uint": 12,
        "my-bool": true,
        "my-string-array": ["a", "b"],
      },
    },
    {
      id: 2,
      vector: [0.2, 0.2],
      attributes: {
        "my-string": null,
        "my-uint": null,
        "my-bool": null,
        "my-string-array": ["b", "d"],
      },
    },
    {
      id: 3,
      vector: [0.3, 0.3],
      attributes: {
        "my-string": "three",
        "my-uint": 84,
        "my-bool": false,
        "my-string-array": [],
      },
    },
    {
      id: 4,
      vector: [0.4, 0.4],
      attributes: {
        "my-string": "four",
        "my-uint": 39,
        "my-bool": true,
        "my-string-array": ["c"],
      },
    },
  ],
  distance_metric: "cosine_distance",
});`

### **Delete**

Documents can be deleted by upserting with the `vector` set to `null`. Since batches are applied atomically, if you delete a document and insert another in the same upsert, those operations will always be applied together.

Each deletion entry in the request is reported as having affected exactly one row, even if the document does not exist. For example, if you issue a request to delete two non-existent IDs, nothing is actually removed, but the response still indicates that two rows were affected.

This behavior allows turbopuffer to implement deletes more efficiently. If your use case requires determining the true number of rows affected by a delete, use [Delete by filter](https://turbopuffer.com/docs/upsert#delete-by-filter) instead.

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

// Instantiate an object to work with a namespace
const ns = tpuf.namespace("namespace-name");

await ns.delete({ ids: [2, 3] });`

### **Delete by filter**

To delete documents that match a filter, use `delete_by_filter`. This operation will return the actual number of documents removed.

Because the operation internally issues a query to determine which documents to delete, this operation is billed as both a query and a write operation.

`delete_by_filter` has the same syntax as the [`filters` parameter in the query API](https://turbopuffer.com/docs/query#filtering).

curlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("delete_by_filter_example");

await ns.upsert({
  vectors: [
    {
      id: 101,
      vector: [0.2, 0.8],
      attributes: {
        title: "LISP Guide for Beginners",
        views: 10,
      },
    },
    {
      id: 102,
      vector: [0.4, 0.4],
      attributes: {
        title: "AI for Practitioners",
        views: 2500,
      },
    },
  ],
  distance_metric: "cosine_distance",
});

// Delete posts with titles that include the word "guide"
// and have 1000 or less views
const rowsAffected = await ns.deleteByFilter([
  "And",
  [
    ["title", "IGlob", "*guide*"],
    ["views", "Lte", 1000],
  ],
]);
console.log(rowsAffected); // 1

const results = await ns.query({});
console.log(results.length); // 1`

### **Schema**

The schema is optionally set on upsert to configure type and indexing behavior. By default, types are automatically inferred from the passed data and every attribute is indexed. To see what types were inferred, you can [inspect the schema](https://turbopuffer.com/docs/schema#inspect).

[The schema documentation](https://turbopuffer.com/docs/schema) lists all supported attribute types and indexing options. A few examples where manually configuring the schema is needed:

1. **UUID** values serialized as strings can be stored in turbopuffer in an optimized format
2. **Full-text search** for a string attribute
3. **Disabling indexing/filtering** (`filterable:false`) for an attribute, for a 50% discount and improved indexing performance.

You can choose to pass the schema on every upsert, or only the first. There's no performance difference. If an upsert adds a new attribute, it will imply that all previous documents have a `null` value for that attribute.

An example of (1), (2), and (3) on upsert:

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

await ns.upsert({
  vectors: [
    {
      id: 1,
      vector: [0.1, 0.1],
      attributes: {
        text: "the fox is quick and brown",
        "more-text": "hello",
        string: "fox",
      },
    },
  ],
  distance_metric: "cosine_distance",
  schema: {
    text: {
      type: "string",
      full_text_search: {
        language: "english",
        stemming: false,
        remove_stopwords: true,
        case_sensitive: false,
      },
    },
    "more-text": {
      type: "string",
      full_text_search: true,
      filterable: false,
    },
  },
});`

### **Row-based**

As an alternative to the column-based API, you can specify the upserts in a row-based format:

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

await ns.upsert({
  vectors: [
    {
      id: 1,
      vector: [0.1, 0.1],
      attributes: {
        "my-string": "one",
        "my-uint": 12,
        "my-bool": true,
        "my-string-array": ["a", "b"],
      },
    },
    {
      id: 2,
      vector: [0.2, 0.2],
      attributes: { "my-string-array": ["b", "d"] },
    },
    {
      id: 3,
      vector: [0.3, 0.3],
      attributes: { "my-string": "three", "my-uint": 84 },
    },
    {
      id: 4,
      vector: [0.4, 0.4],
      attributes: {
        "my-string": "four",
        "my-uint": 39,
        "my-string-array": ["c"],
      },
    },
  ],
  distance_metric: "cosine_distance",
});`

# **Query documents**

## **POST /v1/namespaces/:namespace/query**

Query, filter, full-text search and vector search documents.

warmcold

**1M docs**

Percentile

Latency

p50

16ms

p90

21ms

p99

33ms

### **Parameters**

**filters** object | arrayoptional

Exact filters for attributes to refine search results for. Think of it as a SQL WHERE clause.

See [Filtering Parameters](https://turbopuffer.com/docs/query#filtering-parameters) below for details.

When combined with a vector, the query planner will automatically combine the attribute index and the approximate nearest neighbor index for best performance and recall. See our post on [Native Filtering](https://turbopuffer.com/blog/native-filtering) for details.

For the best performance, separate documents into namespaces instead of filtering where possible. See also [Performance](https://turbopuffer.com/docs/performance).

**Example:** `["And", [["id", "Gte", 1000], ["permissions", "In", ["3d7a7296-3d6a-4796-8fb0-f90406b1f621", "92ef7c95-a212-43a4-ae4e-0ebc96a65764"]]]]`

---

**vector** array[float]optional

Optionally the vector to search for.

It must have the same number of dimensions as the vectors in the namespace.

**Example:** `[0.1, 0.2, 0.3, ..., 76.8]`

---

**rank_by** arrayoptional

Used for [BM25 full-text search](https://turbopuffer.com/docs/query#full-text-search) or [ordering by attributes](https://turbopuffer.com/docs/query#ordering-by-attributes).

Currently, you can pass a `rank_by` parameter or a `vector` parameter, but not both. If neither is passed, results are sorted by ID.

For [hybrid search](https://turbopuffer.com/docs/hybrid-search), you must do multiple queries (e.g. BM25 + vector) and combine the results client-side with e.g. reciprocal-rank fusion. We encourage users to write a strong query layer abstraction, as it's not uncommon to do 6 turbopuffer queries per user query.

**Order by attribute example:** `["timestamp", "desc"]`

**BM25:** `["text", "BM25", "fox jumping"]`

**BM25 with multiple, weighted fields:** `["Sum", [["Product", [2, ["title", "BM25", "fox jumping"]], ["content", "BM25", "fox jumping"]]]]`

---

**distance_metric** cosine_distance | euclidean_squaredrequired if vector is set

The function used to calculate vector similarity. Possible values are `cosine_distance` or `euclidean_squared`.

`cosine_distance` is defined as `1 - cosine_similarity` and ranges from 0 to 2. Lower is better.

`euclidean_squared` is defined as `sum((x - y)^2)`. Lower is better.

---

**top_k** numberdefault: 10

Number of results to return.

---

**include_vectors** booleandefault: false

Return vectors for the search results. Vectors are large and slow to deserialize on the client, so use this option only if you need them.

---

**include_attributes** array[string] | booleandefault: id

List of attribute names to return in the response. Can be set to `true` to return all attributes. Return only the ones you need for best performance.

---

**consistency** objectdefault: {'level': 'strong'}

Choose between strong and eventual read-after-write consistency.

- Strong consistency (default): `{"level": "strong"}`
- Eventual consistency: `{"level": "eventual"}`

Strong consistency requires a round-trip to object storage to fetch the latest writes before returning a query result, ensuring up-to-date data but adding latency. Eventual consistency removes this requirement, potentially reducing latency while causing stale reads in some cases. [Benchmarking](https://github.com/turbopuffer/tpuf-benchmark) on a vector workload (768 dims, 1M docs, ~3GB) shows a p50 warm latency of 16 ms for strong consistency and 10 ms for eventual consistency.

Most queries are served by the same node that handles writes, so updates are usually visible immediately. Over 99.99% of queries return consistent data. Here's a more specific breakdown based on our monitoring data:

| **% of queries** | **maximum lag (`<=` time)** |
| --- | --- |
| 99.9970% | 0s (strongly consistent) |
| 99.9973% | 1s |
| 99.9975% | 10s |
| 99.9976% | 60s |
| 100% | 1h |

In rare cases (eg. namespace routing changes during scaling) reads may briefly return stale data until its cache updates. This query staleness is typically limited to ~100ms (as the commit log entry is updated in the background), with a strict upper bound of 1 hour (currently non-configurable but subject to future tuning). However, **the cache is refreshed on every query, so the latest writes should appear on the next request**.

### **Examples**

### **Vector Search**

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

const results = await ns.query({
  vector: [0.1, 0.1],
  distance_metric: "cosine_distance",
  top_k: 10,
});
console.log(results);`

### **Filters**

When you need to filter documents, you can combine filters with vector search or use them alone. Here's an example of finding recent public documents:

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

const results = await ns.query({
  filters: [
    "And",
    [
      ["timestamp", "Gte", 1709251200], // Documents after March 1, 2024
      ["public", "Eq", true],
    ],
  ],
  vector: [0.1, 0.2, 0.3], // Optional: include vector to combine with filters
  distance_metric: "cosine_distance", // Required if vector is set
  top_k: 10,
  include_attributes: ["title", "timestamp"],
});
console.log(results);`

### **Ordering by Attributes**

Filter-only (no vector or FTS/BM25) queries can specify a `rank_by` parameter to order results by a specific attribute (i.e. SQL `ORDER BY`). For example, to order by timestamp in descending order:

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

const results = await ns.query({
  filters: ["timestamp", "Lt", 1709251200], // Documents before March 1, 2024
  rank_by: ["timestamp", "desc"], // Order by timestamp in descending order
  top_k: 1000,
  include_attributes: ["title", "timestamp"],
});
console.log(results);`

Ordering by multiple attributes isn't yet implemented.

Similar to SQL, the ordering of results is not guaranteed when multiple documents have the same attribute value for the `rank_by` parameter. Array attributes aren't supported.

### **Full-Text Search**

The FTS attribute must be configured with `full_text_search` set in the schema when upserting documents. See [Schema documentation](https://turbopuffer.com/docs/upsert#schema) and the [Full-Text Search guide](https://turbopuffer.com/docs/fts) for more details.

For an example of hybrid search (combining both vector and BM25 results), see [Hybrid Search](https://turbopuffer.com/docs/hybrid-search).

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

const results = await ns.query({
  rank_by: ["content", "BM25", "quick fox"],
  top_k: 10,
  include_attributes: ["title", "content"],
});
console.log(results);`

You can combine BM25 full-text search with filters to limit results to a specific subset of documents.

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

const results = await ns.query({
  rank_by: ["content", "BM25", "quick fox"],
  filters: [
    "And",
    [
      ["timestamp", "Gte", 1709251200], // Documents after March 1, 2024
      ["public", "Eq", true],
    ],
  ],
  top_k: 10,
  include_attributes: ["title", "content", "timestamp"],
});
console.log(results);`

### **Aggregation operators**

Aggregations combine the results of multiple sub-queries into a single score. Specifically, the following operators are supported:

- `Sum`: Sum the scores of the sub-queries.
- `Max`: Use the maximum score of sub-queries as the score.

Aggregations can be nested. For example:

```json
"rank_by": ["Sum", [
  ["Max", [
    ["title", "BM25", "whale facts"],
    ["description", "BM25", "whale facts"]
  ]],
  ["content", "BM25", "huge whale"]
]]

```

### **Field weights/boosts**

You can specify a weight / boost per-field by using the `Product` operator inside a `rank_by`. For example, to apply a 2x score multiplier on the `title` sub-query:

```json
"rank_by": ["Sum", [
  ["Product", [2, ["title", "BM25", "quick fox"]]],
  ["content", "BM25", "quick fox"]
]]

```

### **Phrase matching**

A simple form of phrase matching is supported with the `ContainsAllTokens` filter. This filter matches documents that contain all the tokens present in the filter input string:

```json
"filters": ["text", "ContainsAllTokens", "lazy walrus"]

```

Specifically, this filter would match a document containing "walrus is super lazy", but not a document containing only "lazy." Full phrase matching, i.e. requiring the exact phrase "lazy walrus", with the terms adjacent and in that order, is not yet supported.

### **Filtering**

Filters allow you to narrow down results by applying exact conditions to attributes. Conditions are arrays with an attribute name, operation, and value, for example:

- `["attr_name", "Eq", 42]`
- `["page_id", "In", ["page1", "page2"]]`
- `["user_migrated_at", "NotEq", null]`

Values must have the same type as the attribute's value, or an array of that type for operators like `In`.

Conditions can be combined using `{And,Or}` operations:

```json
// basic And condition
"filters": ["And", [
  ["attr_name", "Eq", 42],
  ["page_id", "In", ["page1", "page2"]]
]]

// conditions can be nested
"filters": ["And", [
  ["page_id", "In", ["page1", "page2"]],
  ["Or", [
    ["public", "Eq", 1],
    ["permission_id", "In", ["3iQK2VC4", "wzw8zpnQ"]]
  ]]
]]

// legacy API: an object may provided instead (implicitly And)
"filters": {
  "attr_name": ["Eq", 42],
  "page_id": ["In", ["page1", "page2"]],
}

```

Filters can also be applied to the `id` field, which refers to the document ID.

### **Filtering Parameters**

**And** array[filter]

Matches if all of the filters match.

**Or** array[filter]

Matches if at least one of the filters matches.

---

**Eq** id or value

Exact match for `id` or `attributes` values. If value is `null`, matches documents missing the attribute.

**NotEq** value

Inverse of `Eq`, for `attributes` values. If value is `null`, matches documents with the attribute.

---

**In** array[id] or array[value]

Matches any `id` or `attributes` values contained in the provided list. If both the provided value and the target document field are arrays, then this checks if any elements of the two sets intersect.

**NotIn** array[value]

Inverse of `In`, matches any `attributes` values not contained in the provided list.

---

**Lt** value

For ints, this is a numeric less-than on `attributes` values. For strings, lexicographic less-than. For datetimes, numeric less-than on millisecond representation.

**Lte** value

For ints, this is a numeric less-than-or-equal on `attributes` values. For strings, lexicographic less-than-or-equal. For datetimes, numeric less-than-or-equal on millisecond representation.

**Gt** value

For ints, this is a numeric greater-than on `attributes` values. For strings, lexicographic greater-than. For datetimes, numeric greater-than on millisecond representation.

**Gte** value

For ints, this is a numeric greater-than-or-equal on `attributes` values. For strings, lexicographic greater-than-or-equal. For datetimes, numeric greater-than-or-equal on millisecond representation.

---

**Glob** globset

Unix-style glob match against `attributes` values. The full syntax is described in the [globset](https://docs.rs/globset/latest/globset/#syntax) documentation. Glob patterns with a concrete prefix like "foo*" internally compile to efficient range queries

**NotGlob** globset

Inverse of `Glob`, Unix-style glob filters against `attributes` values. The full syntax is described in the [globset](https://docs.rs/globset/latest/globset/#syntax) documentation.

**IGlob** globset

Case insensitive version of `Glob`.

**NotIGlob** globset

Case insensitive version of `NotGlob`.

---

**ContainsAllTokens** string

Matches if all tokens in the input string are present in the `attributes` value. Requires that the attribute is configured for [full-text search](https://turbopuffer.com/docs/fts).

### **Complex Example**

Using nested `And` and `Or` filters:

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

const results = await ns.query({
  vector: [0.1, 0.1],
  distance_metric: "euclidean_squared",
  top_k: 10,
  include_vectors: true,
  include_attributes: ["key1"],
  filters: [
    "And",
    [
      ["id", "In", [1, 2, 3]],
      ["key1", "Eq", "one"],
      ["filename", "NotGlob", "/vendor/**"],
      [
        "Or",
        [
          ["filename", "Glob", "**.tsx"],
          ["filename", "Glob", "**.js"],
        ],
      ],
    ],
  ],
});
console.log(results);`

### **Pagination**

If you need to paginate the entire namespace, use the more performant [Export endpoint](https://turbopuffer.com/docs/export).

By default, results are sorted in ascending ID order, which allows pagination with an ID greater-than filter for filter-only queries. You can specify a `rank_by` parameter to order results by attributes, see [Ordering by Attributes](https://turbopuffer.com/docs/query#ordering-by-attributes).

pythontypescript

Copy

`import { Turbopuffer, Id } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("pagination");

let lastId: Id | null = null;
while (true) {
  const results = await ns.query({
    top_k: 1000,
    filters: [
      "And",
      [
        ["timestamp", "Gte", 1],
        ["id", lastId === null ? "Gte" : "Gt", lastId ?? 0],
      ],
    ],
  });
  console.log(results);
  if (!results || results.length < 1000) break;
  lastId = results[results.length - 1].id;
}`

Currently paginating beyond the first page for full-text search and vector search is not supported. Pass a larger `top_k` value to get more results and paginate client-side. If you need a higher limit, please [contact us](https://turbopuffer.com/contact).

# **Schema**

## **{GET, POST} /v1/namespaces/:namespace/schema**

Reads or updates the namespace schema.

turbopuffer maintains a schema for each namespace with type and indexing behaviour for each attribute.

The schema can be modified as you upsert documents.

A basic schema will be automatically inferred from the upserted data. You can explicitly configure a schema to specify types that can't be inferred (e.g. UUIDs) or to control indexing behaviour (e.g. enabling full-text search for an attribute).

### **Parameters**

Every attribute can have the following fields in its schema specified at [upsert time](https://turbopuffer.com/docs/upsert#schema):

**type** stringdefault: inferred

The data type of the attribute. Supported types:

- `string`: String
- `int`: Signed integer (i64)
- `uint`: Unsigned integer (u64)
- `uuid`: 128-bit UUID
- `datetime`: Date and time
- `bool`: Boolean
- `[]string`: Array of strings
- `[]int`: Array of signed integers
- `[]uint`: Array of unsigned integers
- `[]uuid`: Array of UUIDs
- `[]datetime`: Array of dates and times

All attribute types are nullable by default, except `id` and `vector` which are required. `vector` will become an optional attribute soon. If you need a namespace without a vector, simply set `vector` to a random float.

Most types can be inferred from the upsert payload, except `uuid`, `datetime`, and their array variants, which all need to be set explicitly in the schema. See [UUID values](https://turbopuffer.com/docs/upsert#uuid-values) for an example.

By default, integers use a 64-bit signed type (`int`). To use an unsigned type, set the attribute type to `uint` explicitly in the schema.

`datetime` values should be provided as an ISO 8601 formatted string with a mandatory date and optional time and time zone. Internally, these values are converted to UTC (if the time zone is specified) and stored as a 64-bit integer representing milliseconds since the epoch.

**Example:** `["2015-01-20", "2015-01-20T12:34:56", "2015-01-20T12:34:56-04:00"]`

We'll be adding other data types soon. In the meantime, we suggest representing other data types as either strings or integers.

---

**filterable** booleandefault: true (false if full-text search is enabled)

Whether or not the attribute can be used in [filters](https://turbopuffer.com/docs/query#filter-parameters)/WHERE clauses.

Unfiltered attributes don't have an index built for them, and are thus billed at a 50% discount (see [pricing](https://turbopuffer.com/#pricing)).

---

**full_text_search** booleandefault: false

Whether this attribute can be used as part of a [BM25 full-text search](https://turbopuffer.com/docs/hybrid-search). Requires the `string` or `[]string` type, and by default, BM25-enabled attributes are not filterable. You can override this by setting `filterable: true`.

Can either be a boolean for default settings, or an object with the following optional fields:

- `language` (string): The language of the text. Defaults to `english`. See: [Supported languages](https://turbopuffer.com/docs/schema#languages-for-full-text-search)
- `stemming` (boolean): Language-specific stemming for the text. Defaults to `false` (i.e. do not stem).
- `remove_stopwords` (boolean): Removes [common words](https://snowballstem.org/algorithms/english/stop.txt) from the text based on `language`. Defaults to `true` (i.e. remove common words).
- `case_sensitive` (boolean): Whether searching is case-sensitive. Defaults to `false` (i.e. case-insensitive).
- `tokenizer` (string): How to convert the text to a list of tokens. Defaults to `word_v1`. See: [Supported tokenizers](https://turbopuffer.com/docs/schema#tokenizers-for-full-text-search)

If you require other types of full-text search options, please [contact us](mailto:info@turbopuffer.com).

---

**vector** objectdefault: {'type': [dims]f32, 'ann': true}

Whether the upserted vectors are of type `f16` or `f32`.

To use `f16` vectors, this field needs to be explicitly specified in the `schema` when first creating (i.e. [upserting to](https://turbopuffer.com/docs/upsert)) a namespace.

Example: `"vector": {"type": [512]f16, "ann": true}`

### **Adding new attributes**

New attributes can be added with an [upsert](https://turbopuffer.com/docs/upsert#schema). All documents prior to the write will have the attribute set to `null`.

In most cases, the schema is inferred from the data you upsert. However, as part of an [upsert](https://turbopuffer.com/docs/upsert#schema), you can choose to specify the `schema` for attributes through above parameters (i.e. to use UUID values or enable BM25 full-text indexing).

### **Changing existing attributes**

We support online, in-place changes of the `filterable` and `full_text_search` settings, by [setting the schema in an upsert](https://turbopuffer.com/docs/upsert#schema).

Other index settings changes, attribute type changes, and attribute deletions currently cannot be done in-place. Consider [exporting](https://turbopuffer.com/docs/export) documents and upserting into a new namespace if you require a schema change.

After enabling the `filterable` setting for an attribute, or adding/updating a full-text index, the index needs time to build before queries that depend on the index can be executed. turbopuffer will respond with HTTP status 202 to queries that depend on an index that is not yet built.

### **Inspect**

To retrieve the current schema for a namespace, make a `GET` request to `/v1/namespaces/:namespace/schema`.

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

const schema = await ns.schema();
console.log(schema);`

### **Languages for Full-Text Search**

turbopuffer currently supports language-aware stemming and stopword removal for full-text search. The following languages are supported:

- `arabic`
- `danish`
- `dutch`
- `english` (default)
- `finnish`
- `french`
- `german`
- `greek`
- `hungarian`
- `italian`
- `norwegian`
- `portuguese`
- `romanian`
- `russian`
- `spanish`
- `swedish`
- `tamil`
- `turkish`

Other languages can be supported by [contacting us](mailto:info@turbopuffer.com).

### **Tokenizers for Full-Text Search**

- `word_v1` (default)
- `word_v0`
- `pre_tokenized_array`

The `word_v1` tokenizer forms tokens from contiguous sequences of alphanumeric codepoints and sequences of emoji codepoints that form a single glyph. Codepoints that are neither alphanumeric nor an emoji are discarded. Codepoints are classified according to v10.0 of the Unicode specification.

The `word_v0` tokenizer works like the `word_v1` tokenizer, except that emoji codepoints are discarded.

The `pre_tokenized_array` tokenizer is a special tokenizer that indicates that you want to perform your own tokenization. This tokenizer can only be used on attributes of type `[]string`; each string in the array is interpreted as a token. When this tokenizer is active, queries using the `BM25` or `ContainsAllTokens` operators must supply a query operand of type `[]string` rather than `string`; each string in the array is interpreted as a token. Tokens are always matched case sensitively, without stemming or stopword removal. You cannot specify `language`, `stemming: true`, `remove_stopwords: true`, or `case_sensitive: false` when using this tokenizer.

Other tokenizers can be supported by [contacting us](mailto:info@turbopuffer.com).

# **Export documents**

## **GET /v1/namespaces/:namespace**

Paginate through all documents in a namespace.

If you want to look up documents by ID, use the [query](https://turbopuffer.com/docs/reference/query) endpoint with an `id` filter. This endpoint is generally faster than paginating through querying.

Documents inserted while the export is in progress will be included.

A common use-case for this endpoint is to copy your all documents to a different namespace after some transformation.

### **Parameters**

**cursor** stringoptional

used to retrieve the next page of results (pass `next_cursor` from the response payload)

This endpoint may return 202 ACCEPTED if the data is not ready for export. In this case, retry the request after several seconds.

Documents, ids, and attributes are returned in a column-oriented layout. Documents are returned batches, with each batch containing up to 10,000 documents. Each batch is billed at the cost of 1 query.

### **Examples**

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

const exported = await ns.export({});
console.log(exported);`

# **List namespaces**

## **GET /v1/namespaces**

Paginate through your namespaces.

### **Parameters**

**cursor** stringoptional

retrieve the next page of results (pass `next_cursor` from the response payload)

---

**prefix** stringoptional

retrieve only namespaces that match the prefix, e.g. `foo` would return `foo` and `foo-bar`.

---

**page_size** stringdefault: 1000

limit the number of results per page (max of 1000)

**Warning:** This endpoint is currently not consistent. In other words, it's possible for short periods of time that a namespace *exists* but is not returned on this endpoint (or, that a namespace *doesn't exist*, but is returned from this endpoint).

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const namespaces = await tpuf.namespaces({});
console.log(namespaces);`

# **Delete namespace**

## **DELETE /v1/namespaces/:namespace**

Delete a namespace.

Deletes the namespace and all its documents entirely. There is no way to recover a deleted namespace.

### **Examples**

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

await ns.deleteAll();`

# **Evaluate recall**

When you call this endpoint, it selects `num` random vectors that were previously inserted. For each of these vectors, it performs an ANN index search as well as a ground truth exhaustive search.

Recall is calculated as the ratio of matching vectors between the two search results. This endpoint also returns the average number of results returned from both the ANN index search and the exhaustive search (ideally, these are equal).

We use this endpoint internally to measure recall. See this [blog post](https://turbopuffer.com/blog/continuous-recall) for more.

### **Parameters**

**num** numberdefault: 25

number of searches to run.

---

**top_k** numberdefault: 10

search for top_k nearest neighbors.

---

**filters** objectoptional

filter by attributes, see [filtering parameters](https://turbopuffer.com/docs/reference/query#filter-parameters) for more info.

---

**queries** array[float]default: sampled

use specific query vectors for the measurement. if omitted, sampled from index.

### **Examples**

jsoncurlpythontypescript

Copy

`import { Turbopuffer } from "@turbopuffer/turbopuffer";

const tpuf = new Turbopuffer({
  apiKey: process.env.TURBOPUFFER_API_KEY,
});

const ns = tpuf.namespace("namespace-name");

const recall = await ns.recall({
  num: 5,
  top_k: 10,
});
console.log(recall);`

How to interpret this response:

- A recall of 1.0 means that 100% of the ideal results (from the exhaustive search) were also present in the approximate ANN results
- `avg_ann_count` equals `avg_exhaustive_count`, meaning the approximate search returned the same number of results as the exhaustive

Note: To avoid abuse, recall queries are billed as N search queries, where N = `num` * number of vectors in your index / 10,000. We only bill if the average recall is >0.9.
