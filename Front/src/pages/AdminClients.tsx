import { Check, Eye, Pen, Trash, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const API_BASE = "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : {};
}

const AdminClients: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // inline editing
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({});
  // Charger tous les clients
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

  // Supprimer un client
  const handleDeleteClient = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce client ? Ses annonces seront supprimées aussi! ")) return;
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

  // edit client confirm
  const handleEditClient = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/clients/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message?? "Could not edit client");
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

  if (loading) return <p>Chargement…</p>;
  if (error) return <p>Erreur : {error}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Gestion des clients</h2>

      {clients.length === 0 ? (
        <p>Aucun client.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Prénom</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Téléphone</th>
                <th className="px-4 py-2">Ville</th>
                <th className="px-4 py-2">Date de naissance</th>
                <th className="px-4 py-2">Bloqué</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => {
                const isEditing = editingClientId === c._id;
                return (
                  <tr key={c._id} className="border-t hover:bg-gray-50">
                    {/* Nom */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          value={formData.nom || ""}
                          onChange={(e) => handleChange("nom", e.target.value)}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        c.nom
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
                        c.prenom
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
                        c.email
                      )}
                    </td>
                    {/* Téléphone */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          value={formData.telephone || ""}
                          onChange={(e) => handleChange("telephone", e.target.value)}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        c.telephone || "-"
                      )}
                    </td>
                    {/* Ville */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          value={formData.ville || ""}
                          onChange={(e) => handleChange("ville", e.target.value)}
                          className="border p-1 rounded w-full"
                        />
                      ) : (
                        c.ville || "-"
                      )}
                    </td>
                    {/* Date naissance */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.dateNaissance || ""}
                          onChange={(e) => handleChange("dateNaissance", e.target.value)}
                          className="border p-1 rounded w-full"
                        />
                      ) : c.dateNaissance ? (
                        formatDateTime(c.dateNaissance)
                      ) : (
                        "-"
                      )}
                    </td>
                    {/* Blocked */}
                    <td className="px-4 py-2">
                      {isEditing ? (
                        <select
                          value={formData.blocked ? "true" : "false"}
                          onChange={(e) => handleChange("blocked", e.target.value === "true")}
                          className="border p-1 rounded w-full"
                        >
                          <option value="false">Non</option>
                          <option value="true">Oui</option>
                        </select>
                      ) : c.blocked ? (
                        <span className="text-red-600 font-semibold">Oui</span>
                      ) : (
                        <span className="text-green-600 font-semibold">Non</span>
                      )}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-2 flex gap-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleEditClient(c._id)}
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
                            onClick={() => navigate(`/admin/clients/${c._id}`, { state: { c } })}
                            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => startEditing(c)}
                            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                          >
                            <Pen size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClient(c._id)}
                            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            <Trash size={16} />
                          </button>
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

const formatDateTime = (dateString:string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  };
  
export default AdminClients;
