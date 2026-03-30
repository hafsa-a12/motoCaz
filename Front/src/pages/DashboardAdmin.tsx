import { Link, useNavigate } from 'react-router-dom';

export default function DashboardAdmin() {
  const navigate = useNavigate();
  
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
  
    if (!token || (role !== "admin" && role !== "superadmin")) {
      navigate("/login"); // 🚪 accès interdit
    }
  
    return (
      <div className="px-5">
        <h2>Admin Dashboard</h2>
        <div className='flex gap-4 [&>*]:w-100 [&>*]:h-50 flex-wrap [&>*]:rounded-2xl [&>*]:p-5 [&>*]:text-white [&>*]:font-[500] [&>*]:visited:text-white text-2xl'>
          {role=="superadmin"&&<Link className="bg-gray-900" to="/superadmin/users">Gestion des administrateurs</Link>}
          <Link className="bg-gray-500" to="/admin/clients">Gestion des clients</Link>
          <Link className="bg-gray-700" to="/admin/annonces">Gestion des annonces</Link>
        </div>
      </div>
    );
  }
