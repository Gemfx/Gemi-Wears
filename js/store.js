/* Local cart state. It works without a server and is ready to replace with an API later. */
window.GemiStore = (() => {
  const KEY = "gemi-cart-v1";
  const read = () => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch { return []; }
  };
  const write = (cart) => localStorage.setItem(KEY, JSON.stringify(cart));
  const getProduct = (id) => GEMI_PRODUCTS.find((product) => product.id === id);

  function getCart() { return read(); }
  function count() { return read().reduce((total, item) => total + item.quantity, 0); }
  function add(item) {
    const cart = read();
    const existing = cart.find((entry) => entry.id === item.id && entry.size === item.size && entry.color === item.color);
    if (existing) existing.quantity += item.quantity || 1;
    else cart.push({ ...item, quantity: item.quantity || 1 });
    write(cart);
    window.dispatchEvent(new CustomEvent("gemi:cart-updated"));
  }
  function update(index, quantity) {
    const cart = read();
    if (!cart[index]) return;
    if (quantity <= 0) cart.splice(index, 1);
    else cart[index].quantity = quantity;
    write(cart);
    window.dispatchEvent(new CustomEvent("gemi:cart-updated"));
  }
  function remove(index) { update(index, 0); }
  function clear() { write([]); window.dispatchEvent(new CustomEvent("gemi:cart-updated")); }
  function total() {
    return read().reduce((sum, item) => sum + ((getProduct(item.id)?.price || 0) * item.quantity), 0);
  }
  return { getCart, getProduct, count, add, update, remove, clear, total };
})();
