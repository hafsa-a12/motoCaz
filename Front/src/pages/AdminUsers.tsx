import { Check, Pen, Trash, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { API_BASE } from '../lib/config';

interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "admin" | "superadmin" | "client";
}


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

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    role: "admin",
  });

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

  if (loading) return <p className="text-[var(--color-mute)]  text-sm">Chargement…</p>;
  if (error) return <p className="text-[var(--color-danger)]  text-sm">Erreur : {error}</p>;

  return (
    <div>
      <p className="mc-eyebrow mb-2">Back-office</p>
      <h2 className="text-2xl mb-8">Gestion des administrateurs</h2>

      {/* Création */}
      <form
        onSubmit={handleCreate}
        className="mc-panel mb-8 flex flex-wrap gap-3 items-end"
      >
        <div>
          <label className="mc-label">Nom</label>
          <input
            type="text"
            placeholder="Nom"
            value={newUser.nom}
            onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
            required
            className="mc-field"
          />
        </div>
        <div>
          <label className="mc-label">Prénom</label>
          <input
            type="text"
            placeholder="Prénom"
            value={newUser.prenom}
            onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
            required
            className="mc-field"
          />
        </div>
        <div>
          <label className="mc-label">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
            className="mc-field"
          />
        </div>
        <div>
          <label className="mc-label">Mot de passe</label>
          <input
            type="password"
            placeholder="Mot de passe"
            value={newUser.motDePasse}
            onChange={(e) => setNewUser({ ...newUser, motDePasse: e.target.value })}
            required
            className="mc-field"
          />
        </div>
        <div>
          <label className="mc-label">Rôle</label>
          <select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            className="mc-field"
          >
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Créer
        </button>
      </form>

      {/* Liste */}
      {users.length === 0 ? (
        <div className="mc-empty">Aucun utilisateur.</div>
      ) : (
        <div className="mc-table-wrap overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isEditing = editingUserId === u._id;
                return (
                  <tr key={u._id}>
                    <td>
                      {isEditing ? (
                        <input
                          value={formData.nom || ""}
                          onChange={(e) => handleChange("nom", e.target.value)}
                          className="mc-field !py-1.5"
                        />
                      ) : (
                        u.nom
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          value={formData.prenom || ""}
                          onChange={(e) => handleChange("prenom", e.target.value)}
                          className="mc-field !py-1.5"
                        />
                      ) : (
                        u.prenom
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          value={formData.email || ""}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className="mc-field !py-1.5"
                        />
                      ) : (
                        u.email
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={formData.role || "admin"}
                          onChange={(e) => handleChange("role", e.target.value)}
                          className="mc-field !py-1.5"
                        >
                          <option value="admin">Admin</option>
                          <option value="superadmin">Super Admin</option>
                          <option value="client">Client</option>
                        </select>
                      ) : (
                        <span className="mc-badge mc-badge--pending">{u.role}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleEdit(u._id)}
                              className="btn btn-outline btn-icon"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="btn btn-ghost btn-icon"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(u)}
                              className="btn btn-outline btn-icon"
                            >
                              <Pen size={16} />
                            </button>
                            {u._id != userId && (
                              <button
                                onClick={() => handleDelete(u._id)}
                                className="btn btn-danger btn-icon"
                              >
                                <Trash size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
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
