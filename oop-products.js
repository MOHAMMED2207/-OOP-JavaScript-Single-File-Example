/**
 * OOP JavaScript – Single File Example
 * ------------------------------------
 * عربي + English
 * 
 * هدف الملف: يديك هيكل شغل OOP جاهز تشتغل به على طول بدون أي Framework.
 * 
 * What you get:
 * 1) Product (Encapsulation with private fields)
 * 2) User (Composition: owns products)
 * 3) AdminUser extends User (Inheritance + extra permissions)
 * 4) ProductRepository (In-Memory) – Repository Pattern
 * 5) ProductService – Business logic layer
 * 6) Demo runner at bottom (works with Node.js)
 *
 * Usage:
 *   node oop-products.js
 *
 * Notes:
 * - Pure JavaScript (no TypeScript, no DOM).
 * - Works in Node 16+ (uses private class fields).
 */

// =============================
// 1) Product – Encapsulation
// =============================
class Product {
  // Private fields (encapsulation)
  #id;
  #name;
  #price;
  #owner;      // string (username/owner id)
  #createdAt;

  constructor({ id, name, price, owner, createdAt } = {}) {
    this.#id = id ?? Product.generateId();
    this.name = name;        // setter validation below
    this.price = price;      // setter validation below
    this.#owner = owner ?? "unknown";
    this.#createdAt = createdAt ?? new Date();
  }

  // Static Id generator
  static generateId() {
    return "p_" + Math.random().toString(36).slice(2, 10);
  }

  // Getters
  get id() { return this.#id; }
  get name() { return this.#name; }
  get price() { return this.#price; }
  get owner() { return this.#owner; }
  get createdAt() { return new Date(this.#createdAt); }

  // Setters with validation
  set name(val) {
    if (!val || typeof val !== "string" || val.trim().length < 2) {
      throw new Error("Invalid product name (2+ chars required).");
    }
    this.#name = val.trim();
  }

  set price(val) {
    const num = Number(val);
    if (Number.isNaN(num) || num < 0) {
      throw new Error("Invalid price (must be >= 0).");
    }
    this.#price = Number(num.toFixed(2));
  }

  // Methods (behavior)
  applyDiscount(percent) {
    // عربي: تخفيض السعر بنسبة مئوية
    // English: apply percentage discount
    const p = Number(percent);
    if (Number.isNaN(p) || p < 0 || p > 100) {
      throw new Error("Discount percent must be between 0 and 100.");
    }
    const newPrice = this.#price * (1 - p / 100);
    this.#price = Number(newPrice.toFixed(2));
    return this.#price;
  }

  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      price: this.#price,
      owner: this.#owner,
      createdAt: this.#createdAt.toISOString(),
    };
  }

  static fromJSON(json) {
    return new Product({
      id: json.id,
      name: json.name,
      price: json.price,
      owner: json.owner,
      createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
    });
  }
}

// ======================================
// 2) User – Composition (owns products)
// ======================================
class User {
  #name;
  #email;
  #role; // "user" | "admin"
  #products; // array<Product>

  constructor(name, email, role = "user") {
    this.#name = name;
    this.#email = email;
    this.#role = role;
    this.#products = [];
  }

  get name() { return this.#name; }
  get email() { return this.#email; }
  get role() { return this.#role; }

  isAdmin() { return this.#role === "admin"; }

  addProduct(name, price) {
    const product = new Product({ name, price, owner: this.#name });
    this.#products.push(product);
    return product;
  }

  listProducts() {
    return [...this.#products];
  }

  findProductsByName(q) {
    const term = String(q).toLowerCase();
    return this.#products.filter(p => p.name.toLowerCase().includes(term));
  }

  updateProductPrice(productId, newPrice) {
    const p = this.#products.find(p => p.id === productId);
    if (!p) throw new Error("Product not found");
    p.price = newPrice;
    return p;
  }

  deleteProduct(productId) {
    const idx = this.#products.findIndex(p => p.id === productId);
    if (idx === -1) throw new Error("Product not found");
    const [deleted] = this.#products.splice(idx, 1);
    return deleted;
  }
}

// ===================================
// 3) AdminUser – Inheritance (وراثة)
// ===================================
class AdminUser extends User {
  constructor(name, email) {
    super(name, email, "admin");
  }

  // مثال لصلاحية إضافية: حذف منتج من مستخدم آخر
  deleteProductFromUser(targetUser, productId) {
    if (!(targetUser instanceof User)) {
      throw new Error("Target must be a User instance.");
    }
    return targetUser.deleteProduct(productId);
  }
}

// =====================================
// 4) Repository Pattern (In-Memory)
// =====================================
class ProductRepository {
  constructor() {
    /** @type {Map<string, Product>} */
    this.store = new Map();
  }

  create(product) {
    if (!(product instanceof Product)) {
      throw new Error("Expected Product instance");
    }
    this.store.set(product.id, product);
    return product;
  }

  getById(id) {
    return this.store.get(id) ?? null;
  }

  getAll() {
    return Array.from(this.store.values());
  }

  update(product) {
    if (!(product instanceof Product)) {
      throw new Error("Expected Product instance");
    }
    if (!this.store.has(product.id)) throw new Error("Product not found");
    this.store.set(product.id, product);
    return product;
  }

  delete(id) {
    return this.store.delete(id);
  }

  findByNameLike(q) {
    const term = String(q).toLowerCase();
    return this.getAll().filter(p => p.name.toLowerCase().includes(term));
  }
}

// =====================================
// 5) Service Layer (Business Logic)
// =====================================
class ProductService {
  constructor(repo) {
    this.repo = repo;
  }

  addNewProduct(name, price, owner) {
    const product = new Product({ name, price, owner });
    return this.repo.create(product);
  }

  listAll() {
    return this.repo.getAll();
  }

  search(term) {
    return this.repo.findByNameLike(term);
  }

  changePrice(id, newPrice) {
    const p = this.repo.getById(id);
    if (!p) throw new Error("Product not found");
    p.price = newPrice;
    return this.repo.update(p);
  }

  discount(id, percent) {
    const p = this.repo.getById(id);
    if (!p) throw new Error("Product not found");
    p.applyDiscount(percent);
    return this.repo.update(p);
  }

  remove(id) {
    const ok = this.repo.delete(id);
    if (!ok) throw new Error("Product not found");
    return ok;
  }
}

// =====================================
// 6) Demo Runner (Node.js CLI-style)
// =====================================
function demo() {
  console.log("=== OOP JS Demo Start ===");

  // Users
  const user = new User("Mona", "mona@example.com");
  const admin = new AdminUser("Ziad", "ziad@example.com");

  // User adds products (composition)
  const p1 = user.addProduct("Phone Case", 10);
  const p2 = user.addProduct("Power Bank", 30);
  const p3 = user.addProduct("Shoes", 55);

  console.log("User products:", user.listProducts().map(p => p.toJSON()));

  // Update product price
  user.updateProductPrice(p1.id, 12.5);
  console.log("Updated price of p1:", user.listProducts().find(p => p.id === p1.id).price);

  // Admin deletes a product from user
  admin.deleteProductFromUser(user, p2.id);
  console.log("After admin delete:", user.listProducts().map(p => p.toJSON()));

  // Repository + Service usage
  const repo = new ProductRepository();
  const service = new ProductService(repo);

  // Move user's products into repository (simulate persistence)
  user.listProducts().forEach(prod => repo.create(prod));

  // Add new product via service
  const added = service.addNewProduct("Watch", 120, "Mona");
  console.log("Service added:", added.toJSON());

  // Apply discount via service
  service.discount(added.id, 10);
  console.log("After 10% discount:", repo.getById(added.id).toJSON());

  // Search
  console.log("Search 'sh':", service.search("sh").map(p => p.name));

  // Remove
  service.remove(added.id);
  console.log("After remove Watch, all:", service.listAll().map(p => p.name));

  console.log("=== OOP JS Demo End ===");
}

// Run demo if executed directly
if (require.main === module) {
  demo();
}

// Exports (for tests/importing in other files)
module.exports = {
  Product,
  User,
  AdminUser,
  ProductRepository,
  ProductService,
};
