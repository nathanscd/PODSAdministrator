import { motion } from "framer-motion";
import Dashboard from '../components/Dashboard'; 
import { useNavigate } from "react-router-dom";

export default function Dashboards() {

  const navigate = useNavigate();

  const handleDashboardClick = () => {
    navigate("/");
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="main"
    >
      <button onClick={handleDashboardClick}>Home</button> 

      <Dashboard /> 
    </motion.section>
  );
}
