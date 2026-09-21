import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetails from "./pages/PropertyDetails";
import AddProperty from "./pages/AddProperty";
import ManageProperties from "./pages/ManageProperties";
import Contact from "./pages/Contact";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="properties" element={<Properties />} />
        <Route path="properties/:id" element={<PropertyDetails />} />
        <Route path="add-property" element={<AddProperty />} />
        <Route path="manage-properties" element={<ManageProperties />} />
        <Route path="contact" element={<Contact />} />
      </Route>
    </Routes>
  );
}

export default App;