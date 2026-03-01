import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import ItemForm from "./components/ItemForm";
import ItemList from "./components/ItemList";
import LoginPage from "./components/LoginPage";
import Toast from "./components/Toast";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
  checkHealth,
  login,
  register,
  setToken,
  clearToken,
} from "./services/api";

function App() {
  // ==================== AUTH STATE ====================
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ==================== STATE ====================
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [toast, setToast] = useState(null);

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "") => {
    setLoading(true);
    try {
      const data = await fetchItems(search);
      setItems(data.items);
      setTotalItems(data.total);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout();
      }
      console.error("Error loading items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== ON MOUNT ====================

  useEffect(() => {
    checkHealth().then(setIsConnected);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadItems();
    }
  }, [isAuthenticated, loadItems]);

  // ==================== AUTH HANDLERS ====================

  const handleLogin = async (email, password) => {
    const data = await login(email, password);
    setUser(data.user);
    setIsAuthenticated(true);
  };

  const handleRegister = async (userData) => {
    // Register lalu otomatis login
    await register(userData);
    await handleLogin(userData.email, userData.password);
  };

  const handleLogout = () => {
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
    setItems([]);
    setTotalItems(0);
    setEditingItem(null);
    setSearchQuery("");
  };

  // ==================== ITEM HANDLERS ====================

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const handleSubmit = async (itemData, editId) => {
    try {
      if (editId) {
        await updateItem(editId, itemData);
        showToast("Item berhasil diupdate!");
        setEditingItem(null);
      } else {
        await createItem(itemData);
        showToast("Item berhasil ditambahkan!");
      }
      loadItems(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    }
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
      showToast("Item berhasil dihapus!");
      loadItems(searchQuery);
    } catch (err) {
      showToast("Gagal menghapus: " + err.message, "error");
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
  // Jika belum login, tampilkan login page

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
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
            <label style={{ marginRight: "0.5rem" }}>
              Urutkan berdasarkan:
            </label>
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
    </>
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
