import { Check, Pen, Trash, X } from "lucide-react";
import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "admin" | "superadmin" | "client";
}

const API_BASE = "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token
  ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
  : {};
}

const AdminUsers: React.FC = () => {
  const userId = localStorage.getItem("userId") ?? null;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Inline editing
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  // New user creation
  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "admin",
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as User[];
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      console.error("Erreur chargement utilisateurs :", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create user
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/admin/users`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Erreur création utilisateur");
      alert("Administrateur créé avec succès");
      setNewUser({ nom: "", prenom: "", email: "", motDePasse: "", role: "admin" });
      await fetchUsers();
    } catch (e) {
      alert("Erreur création utilisateur");
      console.error(e);
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("Utilisateur supprimé avec succès");
      await fetchUsers();
    } catch (e) {
      alert("Erreur suppression utilisateur");
      console.error(e);
    }
  };

  // Edit user confirm
  const handleEdit = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message ?? "Erreur modification utilisateur");
      alert("Utilisateur modifié avec succès");
      setEditingUserId(null);
      setFormData({});
      await fetchUsers();
    } catch (e) {
      alert("Erreur modification utilisateur");
      console.error(e);
    }
  };

  const startEditing = (u: User) => {
    setEditingUserId(u._id);
    setFormData({ ...u });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setFormData({});
  };

  const handleChange = (field: keyof User, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <p>Chargement…</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestion des administrateurs</h2>

      {/* Création */}
      <form
        onSubmit={handleCreate}
        className="mb-6 p-4 bg-white rounded shadow flex flex-wrap gap-2"
      >
        <input
          type="text"
          placeholder="Nom"
          value={newUser.nom}
          onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
          required
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Prénom"
          value={newUser.prenom}
          onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
          required
          className="border p-2 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={newUser.email}
          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={newUser.motDePasse}
          onChange={(e) => setNewUser({ ...newUser, motDePasse: e.target.value })}
          required
          className="border p-2 rounded"
        />
        <select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          className="border p-2 rounded"
        >
          <option value="admin">Admin</option>
          <option value="superadmin">Super Admin</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Créer
        </button>
      </form>

      {/* Liste */}
      {users.length === 0 ? (
        <p>Aucun utilisateur.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Rôle</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isEditing = editingUserId === u._id;
                return (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    {/* Nom */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          value={formData.nom || ""}
                          onChange={(e) => handleChange("nom", e.target.value)}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        u.nom
                      )}
                    </td>
                    {/* Prenom */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          value={formData.prenom || ""}
                          onChange={(e) => handleChange("prenom", e.target.value)}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        u.prenom
                      )}
                    </td>
                    {/* Email */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          value={formData.email || ""}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    {/* Role */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <select
                          value={formData.role || "admin"}
                          onChange={(e) => handleChange("role", e.target.value)}
                          className="border p-1 rounded w-full"
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                          <option value="client">Client</option>
                        </select>
                      ) : (
                        <span className="font-medium">{u.role}</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-2 flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleEdit(u._id)}
                            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="p-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEditing(u)}
                            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            <Pen size={16} />
                          </button>
                          {u._id!=userId &&<button
                            onClick={() => handleDelete(u._id)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <Trash size={16} />
                          </button>}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
