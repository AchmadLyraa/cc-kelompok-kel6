import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  checkHealth,
} from "./services/api";

function App() {
  // ==================== STATE ====================
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const data = await fetchItems(search);
      setItems(data.items);
      setTotalItems(data.total);
    } catch (err) {
      console.error("Error loading items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== ON MOUNT ====================
  useEffect(() => {
    // Cek koneksi API
    checkHealth().then(setIsConnected);
    // Load items
    loadItems();
  }, [loadItems]);

  // ==================== HANDLERS ====================

  const handleSubmit = async (itemData, editId) => {
    if (editId) {
      // Mode edit
      await updateItem(editId, itemData);
      setEditingItem(null);
    } else {
      // Mode create
      await createItem(itemData);
    }
    // Reload daftar items
    loadItems(searchQuery);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    // Scroll ke atas ke form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id);
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return;

    try {
      await deleteItem(id);
      loadItems(searchQuery);
    } catch (err) {
      alert("Gagal menghapus: " + err.message);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    loadItems(query);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "price") {
      return a.price - b.price;
    }
    if (sortBy === "newest") {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });

  // ==================== RENDER ====================
  return (
    <div style={styles.app}>
      <div style={styles.container}>
        <Header totalItems={totalItems} isConnected={isConnected} />
        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={handleCancelEdit}
        />
        <SearchBar onSearch={handleSearch} />
        <div style={{ margin: "1rem 0" }}>
          <label style={{ marginRight: "0.5rem" }}>Urutkan berdasarkan:</label>
          <select value={sortBy} onChange={handleSortChange}>
            <option value="name">Nama</option>
            <option value="price">Harga</option>
            <option value="newest">Terbaru</option>
          </select>
        </div>
        <ItemList
          items={sortedItems}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  );
}

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
};

export default App;
