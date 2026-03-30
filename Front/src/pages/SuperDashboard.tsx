import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  nom: string;
  prenom?: string;
  email: string;
  role: string;
}

function SuperDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [mdp, setMdp] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🚪 Vérifier rôle superadmin
  if (!token || role !== "superadmin") {
    navigate("/login");
  }

  const loadUsers = async () => {
    const res = await fetch("http://localhost:8000/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setUsers(data);
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nom,
        email,
        motDePasse: mdp,
        role: "admin",
      }),
    });
    if (res.ok) {
      setNom("");
      setEmail("");
      setMdp("");
      loadUsers();
    } else {
      const err = await res.json();
      alert(err.message || "Erreur lors de la création de l'admin");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div>
      <h2>👑 Super Admin — Utilisateurs</h2>

      <form onSubmit={createAdmin}>
        <input
          placeholder="Nom"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          placeholder="Mot de passe"
          type="password"
          value={mdp}
          onChange={(e) => setMdp(e.target.value)}
          required
        />
        <button type="submit">Créer Admin</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.nom} {u.prenom}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SuperDashboard;
