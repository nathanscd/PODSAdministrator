import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom"; 

export default function Home() {
  const navigate = useNavigate(); 

  const handleDashboardClick = () => {
    navigate("/dashboard"); 
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="main"
    >
      <h1 className="name-main">PODSAdministrator</h1>
      <button onClick={handleDashboardClick}>Dashboard</button> 
    </motion.section>
  );
}
