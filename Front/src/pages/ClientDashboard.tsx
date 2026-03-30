import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Annonce {
  _id: string;
  titre: string;
  prix: number;
  actif: boolean;
  valide: boolean;
}

function ClientDashboard() {
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  // if (!token) {
  //   navigate("/login"); // 🚪 si pas connecté → retour login
  // }

  // const loadMy = async () => {
  //   const res = await fetch("http://localhost:8000/api/annonces/my", {
  //     headers: { Authorization: `Bearer ${token}` },
  //   });
  //   const data = await res.json();
  //   console.log(token)
  //   setAnnonces(data);
  // };

  const delAnnonce = async (id: string) => {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    await fetch(`http://localhost:8000/api/annonces/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    // loadMy();
  };

  const editAnnonce = async (id: string) => {
    const prix = window.prompt("Nouveau prix ?");
    if (!prix) return;
    await fetch(`http://localhost:8000/api/annonces/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prix: Number(prix) }),
    });
    // loadMy();
  };

  // useEffect(() => {
  //   loadMy();
  // }, []);

  return (
    <div>
      <h2>👤 Mes annonces</h2>
      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {annonces.map((a) => (
            <tr key={a._id}>
              <td>{a.titre}</td>
              <td>{a.prix} DH</td>
              <td>
                {a.actif ? "Actif" : "Inactif"} /{" "}
                {a.valide ? "Validée" : "En attente"}
              </td>
              <td>
                <button onClick={() => editAnnonce(a._id)}>✏️</button>
                <button onClick={() => delAnnonce(a._id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientDashboard;
