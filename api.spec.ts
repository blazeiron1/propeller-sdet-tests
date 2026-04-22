const request = require('supertest');
import { Response } from 'supertest';

const BASE_URL = 'http://localhost:3000';
const GRAPHQL = '/graphql';

type ProductStatus = 'ACTIVE' | 'INACTIVE';

interface Product {
  id: string;
  name: string;
  price: number;
  status: ProductStatus;
  tenantId: string;
  images?: Image[];
}

interface Image {
  id: string;
  url: string;
  priority: number;
  tenantId: string;
  productId?: number | null;
}

interface GqlResponse<T = unknown> {
  data: T;
  errors?: { message: string }[];
}

async function gql(
  query: string,
  variables: Record<string, unknown> = {},
  tenantId = 'tenant-a',
): Promise<Response> {
  return request(BASE_URL)
    .post(GRAPHQL)
    .set('Content-Type', 'application/json')
    .set('x-tenant-id', tenantId)
    .send({ query, variables });
}

describe('Multi-Tenancy', () => {
  test('request without x-tenant-id header returns an error in the response', async () => {
    const res = await request(BASE_URL)
      .post(GRAPHQL)
      .set('Content-Type', 'application/json')
      .send({ query: '{ products { id } }' });
    const hasHttpError = res.status !== 200;
    const hasGqlError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
    expect(hasHttpError || hasGqlError).toBe(true);
  });

  test('tenant-a cannot see tenant-b products', async () => {
    const res = await gql('{ products { id tenantId } }', {}, 'tenant-a');
    const products: Product[] = res.body.data.products;
    products.forEach((p) => { expect(p.tenantId).toBe('tenant-a'); });
  });

  test('tenant-b cannot see tenant-a products', async () => {
    const res = await gql('{ products { id tenantId } }', {}, 'tenant-b');
    const products: Product[] = res.body.data.products;
    products.forEach((p) => { expect(p.tenantId).toBe('tenant-b'); });
  });

  test('tenant-a and tenant-b have separate product sets', async () => {
    const resA = await gql('{ products { id } }', {}, 'tenant-a');
    const resB = await gql('{ products { id } }', {}, 'tenant-b');
    const idsA: string[] = resA.body.data.products.map((p: Product) => p.id);
    const idsB: string[] = resB.body.data.products.map((p: Product) => p.id);
    expect(idsA.filter((id) => idsB.includes(id)).length).toBe(0);
  });
});

describe('Products - Queries', () => {
  test('products query returns an array', async () => {
    const res = await gql('{ products { id name price status } }');
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.products)).toBe(true);
  });

  test('products returns expected fields', async () => {
    const res = await gql('{ products { id name price status tenantId } }');
    const product: Product = res.body.data.products[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('status');
    expect(product).toHaveProperty('tenantId');
  });

  test('product status is ACTIVE or INACTIVE', async () => {
    const res = await gql('{ products { status } }');
    const products: Product[] = res.body.data.products;
    products.forEach((p) => { expect(['ACTIVE', 'INACTIVE']).toContain(p.status); });
  });

  test('product price is a non-negative number', async () => {
    const res = await gql('{ products { price } }');
    const products: Product[] = res.body.data.products;
    products.forEach((p) => {
      expect(typeof p.price).toBe('number');
      expect(p.price).toBeGreaterThanOrEqual(0);
    });
  });

  test('product(id) returns a single product', async () => {
    const list = await gql('{ products { id } }');
    const id: string = list.body.data.products[0].id;
    const res = await gql('query($id: Int!) { product(id: $id) { id name } }', { id: parseInt(id) });
    expect(res.status).toBe(200);
    expect(res.body.data.product.id).toBe(id);
  });

  test('product(id) returns null or error for non-existent ID', async () => {
    const res = await gql('query { product(id: 999999) { id name } }');
    expect(res.status).toBe(200);
    const isNull = (res.body as GqlResponse<{ product: Product | null }>).data?.product === null;
    const hasError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
    expect(isNull || hasError).toBe(true);
  });
});

describe('Products - Pagination', () => {
  test('pageSize limits number of returned products', async () => {
    const res = await gql('query { products(page: 1, pageSize: 2) { id } }');
    expect(res.body.data.products.length).toBeLessThanOrEqual(2);
  });

  test('page 1 and page 2 return different products', async () => {
    const page1 = await gql('query { products(page: 1, pageSize: 2) { id } }');
    const page2 = await gql('query { products(page: 2, pageSize: 2) { id } }');
    const ids1: string[] = page1.body.data.products.map((p: Product) => p.id);
    const ids2: string[] = page2.body.data.products.map((p: Product) => p.id);
    expect(ids1.filter((id) => ids2.includes(id)).length).toBe(0);
  });

  test('out-of-range page returns empty array', async () => {
    const res = await gql('query { products(page: 99999, pageSize: 10) { id } }');
    expect(res.body.data.products).toEqual([]);
  });

  test('default pageSize is 10', async () => {
    const res = await gql('query { products { id } }');
    expect(res.body.data.products.length).toBeLessThanOrEqual(10);
  });
});

describe('Products - Filtering', () => {
  test('filter by status ACTIVE returns only ACTIVE products', async () => {
    const res = await gql('query { products(filter: { status: ACTIVE }) { status } }');
    (res.body.data.products as Product[]).forEach((p) => { expect(p.status).toBe('ACTIVE'); });
  });

  test('filter by status INACTIVE returns only INACTIVE products', async () => {
    const res = await gql('query { products(filter: { status: INACTIVE }) { status } }');
    (res.body.data.products as Product[]).forEach((p) => { expect(p.status).toBe('INACTIVE'); });
  });

  test('filter by name performs case-insensitive partial match', async () => {
    const list = await gql('{ products { name } }');
    const firstName: string | undefined = list.body.data.products[0]?.name;
    if (!firstName) return;
    const partial = firstName.slice(0, 3).toLowerCase();
    const res = await gql('query($name: String) { products(filter: { name: $name }) { name } }', { name: partial });
    (res.body.data.products as Product[]).forEach((p) => {
      expect(p.name.toLowerCase()).toContain(partial);
    });
  });

  test('filter by minPrice returns products at or above that price', async () => {
    const res = await gql('query($min: Float) { products(filter: { minPrice: $min }) { price } }', { min: 10 });
    (res.body.data.products as Product[]).forEach((p) => { expect(p.price).toBeGreaterThanOrEqual(10); });
  });

  test('filter by maxPrice returns products at or below that price', async () => {
    const res = await gql('query($max: Float) { products(filter: { maxPrice: $max }) { price } }', { max: 100 });
    (res.body.data.products as Product[]).forEach((p) => { expect(p.price).toBeLessThanOrEqual(100); });
  });

  test('filter by minPrice and maxPrice returns products within range', async () => {
    const res = await gql('query($min: Float, $max: Float) { products(filter: { minPrice: $min, maxPrice: $max }) { price } }', { min: 5, max: 50 });
    (res.body.data.products as Product[]).forEach((p) => {
      expect(p.price).toBeGreaterThanOrEqual(5);
      expect(p.price).toBeLessThanOrEqual(50);
    });
  });

  test('filter with no matches returns empty array', async () => {
    const res = await gql('query { products(filter: { name: "XYZNONEXISTENT99999" }) { id } }');
    expect(res.body.data.products).toEqual([]);
  });
});

describe('Products - Mutations', () => {
  let createdProductId: number;

  test('createProduct creates a new product', async () => {
    const res = await gql('mutation { createProduct(input: { name: "Test Product", price: 30, status: ACTIVE }) { id name price status tenantId } }');
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    const p: Product = res.body.data.createProduct;
    expect(p.name).toBe('Test Product');
    expect(p.price).toBe(30);
    expect(p.status).toBe('ACTIVE');
    expect(p.tenantId).toBe('tenant-a');
    createdProductId = parseInt(p.id);
  });

  test('createProduct with INACTIVE status works', async () => {
    const res = await gql('mutation { createProduct(input: { name: "Inactive Product", price: 10, status: INACTIVE }) { id status } }');
    expect(res.body.errors).toBeUndefined();
    const p: Product = res.body.data.createProduct;
    expect(p.status).toBe('INACTIVE');
    await gql('mutation($id: Int!) { deleteProduct(id: $id) }', { id: parseInt(p.id) });
  });

  test('createProduct missing required name field returns error', async () => {
    const res = await gql('mutation { createProduct(input: { price: 10, status: ACTIVE }) { id } }');
    expect(res.body.errors).toBeDefined();
  });

  test('createProduct missing required price field returns error', async () => {
    const res = await gql('mutation { createProduct(input: { name: "No Price", status: ACTIVE }) { id } }');
    expect(res.body.errors).toBeDefined();
  });

  test('updateProduct updates product fields', async () => {
    expect(createdProductId).toBeDefined();
    const res = await gql('mutation($id: Int!) { updateProduct(id: $id, input: { name: "Updated Product", price: 50, status: INACTIVE }) { id name price status } }', { id: createdProductId });
    expect(res.body.errors).toBeUndefined();
    const p: Product = res.body.data.updateProduct;
    expect(p.name).toBe('Updated Product');
    expect(p.price).toBe(50);
    expect(p.status).toBe('INACTIVE');
  });

  test('updateProduct on non-existent ID returns error or null', async () => {
    const res = await gql('mutation { updateProduct(id: 999999, input: { name: "Ghost" }) { id } }');
    const isNull = res.body.data?.updateProduct === null;
    const hasError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
    expect(isNull || hasError).toBe(true);
  });

  test('deleteProduct removes the product', async () => {
    expect(createdProductId).toBeDefined();
    const res = await gql('mutation($id: Int!) { deleteProduct(id: $id) }', { id: createdProductId });
    expect(res.status).toBe(200);
    expect(res.body.data.deleteProduct).toBe(true);
    const verify = await gql('query($id: Int!) { product(id: $id) { id } }', { id: createdProductId });
    const isNull = verify.body.data?.product === null;
    const hasError = Array.isArray(verify.body.errors) && verify.body.errors.length > 0;
    expect(isNull || hasError).toBe(true);
  });

  test('deleteProduct on non-existent ID returns error or false', async () => {
    const res = await gql('mutation { deleteProduct(id: 999999) }');
    const isFalse = res.body.data?.deleteProduct === false;
    const hasError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
    expect(isFalse || hasError).toBe(true);
  });
});

describe('Images - Queries', () => {
  test('images query returns an array', async () => {
    const res = await gql('{ images { id url priority tenantId } }');
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    expect(Array.isArray(res.body.data.images)).toBe(true);
  });

  test('images returns expected fields', async () => {
    const res = await gql('{ images { id url priority tenantId } }');
    const image: Image | undefined = res.body.data.images[0];
    if (!image) return;
    expect(image).toHaveProperty('id');
    expect(image).toHaveProperty('url');
    expect(image).toHaveProperty('priority');
    expect(image).toHaveProperty('tenantId');
  });

  test('image(id) returns a single image', async () => {
    const list = await gql('{ images { id } }');
    const images: Image[] = list.body.data.images;
    if (!images.length) return;
    const id = parseInt(images[0].id);
    const res = await gql('query($id: Int!) { image(id: $id) { id url } }', { id });
    expect(res.body.data.image.id).toBe(images[0].id);
  });

  test('image(id) returns null or error for non-existent ID', async () => {
    const res = await gql('{ image(id: 999999) { id } }');
    const isNull = res.body.data?.image === null;
    const hasError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
    expect(isNull || hasError).toBe(true);
  });

  test('images filtered by productId returns only images for that product', async () => {
    const productsRes = await gql('{ products { id images { id } } }');
    const withImages: Product | undefined = productsRes.body.data.products.find((p: Product) => p.images && p.images.length > 0);
    if (!withImages) return;
    const productId = parseInt(withImages.id);
    const res = await gql('query($pid: Int) { images(productId: $pid) { id productId } }', { pid: productId });
    (res.body.data.images as Image[]).forEach((img) => { expect(img.productId).toBe(productId); });
  });
});

describe('Images - Mutations', () => {
  let createdImageId: number;

  test('createImage creates a new image', async () => {
    const res = await gql('mutation { createImage(input: { url: "https://cdn.example.com/test.jpg" }) { id url tenantId } }');
    expect(res.status).toBe(200);
    expect(res.body.errors).toBeUndefined();
    const img: Image = res.body.data.createImage;
    expect(img.url).toBe('https://cdn.example.com/test.jpg');
    expect(img.tenantId).toBe('tenant-a');
    createdImageId = parseInt(img.id);
  });

  test('createImage with custom priority', async () => {
    const res = await gql('mutation { createImage(input: { url: "https://cdn.example.com/custom.jpg", priority: 500 }) { id priority } }');
    expect(res.body.errors).toBeUndefined();
    const img: Image = res.body.data.createImage;
    expect(img.priority).toBe(500);
    await gql('mutation($id: Int!) { deleteImage(id: $id) }', { id: parseInt(img.id) });
  });

  test('createImage missing required url returns error', async () => {
    const res = await gql('mutation { createImage(input: { priority: 100 }) { id } }');
    expect(res.body.errors).toBeDefined();
  });

  test('updateImage updates url and priority', async () => {
    expect(createdImageId).toBeDefined();
    const res = await gql('mutation($id: Int!) { updateImage(id: $id, input: { url: "https://cdn.example.com/updated.jpg", priority: 200 }) { id url priority } }', { id: createdImageId });
    expect(res.body.errors).toBeUndefined();
    const img: Image = res.body.data.updateImage;
    expect(img.url).toBe('https://cdn.example.com/updated.jpg');
    expect(img.priority).toBe(200);
  });

  test('updateImage on non-existent ID returns error or null', async () => {
    const res = await gql('mutation { updateImage(id: 999999, input: { url: "https://cdn.example.com/ghost.jpg" }) { id } }');
    const isNull = res.body.data?.updateImage === null;
    const hasError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
    expect(isNull || hasError).toBe(true);
  });

  test('deleteImage removes the image', async () => {
    expect(createdImageId).toBeDefined();
    const res = await gql('mutation($id: Int!) { deleteImage(id: $id) }', { id: createdImageId });
    expect(res.body.data.deleteImage).toBe(true);
    const verify = await gql('query($id: Int!) { image(id: $id) { id } }', { id: createdImageId });
    const isNull = verify.body.data?.image === null;
    const hasError = Array.isArray(verify.body.errors) && verify.body.errors.length > 0;
    expect(isNull || hasError).toBe(true);
  });

  test('deleteImage on non-existent ID returns error or false', async () => {
    const res = await gql('mutation { deleteImage(id: 999999) }');
    const isFalse = res.body.data?.deleteImage === false;
    const hasError = Array.isArray(res.body.errors) && res.body.errors.length > 0;
    expect(isFalse || hasError).toBe(true);
  });
});

describe('Product - Image Relationship', () => {
  let productId: number;
  let imageId: number;

  beforeAll(async () => {
    const res = await gql('mutation { createProduct(input: { name: "Relation Test Product", price: 1, status: ACTIVE }) { id } }');
    productId = parseInt(res.body.data.createProduct.id);
  });

  afterAll(async () => {
    if (imageId) await gql('mutation($id: Int!) { deleteImage(id: $id) }', { id: imageId });
    await gql('mutation($id: Int!) { deleteProduct(id: $id) }', { id: productId });
  });

  test('createImage linked to a product', async () => {
    const res = await gql('mutation($pid: Int) { createImage(input: { url: "https://cdn.example.com/linked.jpg", productId: $pid }) { id url productId } }', { pid: productId });
    expect(res.body.errors).toBeUndefined();
    const img: Image = res.body.data.createImage;
    expect(img.productId).toBe(productId);
    imageId = parseInt(img.id);
  });

  test('product query includes associated images', async () => {
    const res = await gql('query($id: Int!) { product(id: $id) { id images { id url } } }', { id: productId });
    const images: Image[] = res.body.data.product.images;
    expect(Array.isArray(images)).toBe(true);
    expect(images.find((img) => parseInt(img.id) === imageId)).toBeDefined();
  });

  test('images query filtered by productId returns linked image', async () => {
    const res = await gql('query($pid: Int) { images(productId: $pid) { id } }', { pid: productId });
    const ids: number[] = res.body.data.images.map((i: Image) => parseInt(i.id));
    expect(ids).toContain(imageId);
  });
});
