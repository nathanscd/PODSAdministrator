import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [data, setData] = useState([]);

useEffect(() => {
  axios.get("http://localhost:8000/v1/aneel/files")
  .then(res => setFiles(res.data));
}, []);

  const loadFile = async (file:any) => {
    const res = await axios.get('http://localhost:8000/v1/aneel/file/${file}');
    setSelected(file);
    setData(res.data);
  };

  return (
    <div>
      <h1>Dashboard ANEEL</h1>

      <select onChange={(e) => loadFile(e.target.value)}>
        <option>Selecione um dataset</option>
        {files.map(f => <option key={f}>{f}</option>)}
      </select>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
