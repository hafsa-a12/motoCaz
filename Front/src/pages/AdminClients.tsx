import { Check, Eye, Pen, Trash, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from '../lib/config';

interface Client {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  ville?: string;
  dateNaissance:string;
  blocked:boolean;
}


function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

const AdminClients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/admin/clients`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Client[];
      setClients(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
      console.error("Erreur chargement clients :", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce client ? Ses annonces seront supprimées aussi !")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/clients/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("Client supprimé avec succès");
      await fetchClients();
    } catch (e) {
      alert("Erreur suppression client");
      console.error(e);
    }
  };

  const handleEditClient = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/clients/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message ?? "Could not edit client");
      alert("Client modifié avec succès");
      setEditingClientId(null);
      setFormData({});
      await fetchClients();
    } catch (e) {
      alert("Erreur modification client");
      console.error(e);
    }
  };

  const startEditing = (client: Client) => {
    setEditingClientId(client._id);
    setFormData({ ...client });
  };

  const cancelEditing = () => {
    setEditingClientId(null);
    setFormData({});
  };

  const handleChange = (field: keyof Client, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) return <p className="text-[var(--color-mute)]  text-sm">Chargement…</p>;
  if (error) return <p className="text-[var(--color-danger)]  text-sm">Erreur : {error}</p>;

  return (
    <div>
      <p className="mc-eyebrow mb-2">Back-office</p>
      <h2 className="text-2xl mb-8">Gestion des clients</h2>

      {clients.length === 0 ? (
        <div className="mc-empty">Aucun client.</div>
      ) : (
        <div className="mc-table-wrap overflow-x-auto">
          <table className="mc-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Naissance</th>
                <th>Bloqué</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const isEditing = editingClientId === c._id;
                return (
                  <tr key={c._id}>
                    <td>
                      {isEditing ? (
                        <input
                          value={formData.nom || ""}
                          onChange={(e) => handleChange("nom", e.target.value)}
                          className="mc-field !py-1.5"
                        />
                      ) : (
                        c.nom
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
                        c.prenom
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
                        c.email
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          value={formData.telephone || ""}
                          onChange={(e) => handleChange("telephone", e.target.value)}
                          className="mc-field !py-1.5"
                        />
                      ) : (
                        c.telephone || "-"
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          value={formData.ville || ""}
                          onChange={(e) => handleChange("ville", e.target.value)}
                          className="mc-field !py-1.5"
                        />
                      ) : (
                        c.ville || "-"
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.dateNaissance || ""}
                          onChange={(e) => handleChange("dateNaissance", e.target.value)}
                          className="mc-field !py-1.5"
                        />
                      ) : c.dateNaissance ? (
                        formatDateTime(c.dateNaissance)
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <select
                          value={formData.blocked ? "true" : "false"}
                          onChange={(e) => handleChange("blocked", e.target.value === "true")}
                          className="mc-field !py-1.5"
                        >
                          <option value="false">Non</option>
                          <option value="true">Oui</option>
                        </select>
                      ) : c.blocked ? (
                        <span className="mc-badge mc-badge--bad">Oui</span>
                      ) : (
                        <span className="mc-badge mc-badge--ok">Non</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleEditClient(c._id)}
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
                              onClick={() => navigate(`/admin/clients/${c._id}`, { state: { c } })}
                              className="btn btn-ghost btn-icon"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => startEditing(c)}
                              className="btn btn-outline btn-icon"
                            >
                              <Pen size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClient(c._id)}
                              className="btn btn-danger btn-icon"
                            >
                              <Trash size={16} />
                            </button>
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

const formatDateTime = (dateString:string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

export default AdminClients;
