// Supabase: simple API project info
const getSupabaseStatus = async () => {
  const res = await axios.get(
    `https://api.supabase.com/v1/projects/${process.env.SUPABASE_PROJECT_ID}/billing/usage`,
    {
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_MANAGEMENT_TOKEN}`,
      },
    }
  );
  return res.data;
};

// MongoDB Atlas
const getMongoStatus = async () => {
  const res = await axios.get(
    `https://cloud.mongodb.com/api/atlas/v1.0/groups/${process.env.MONGODB_ATLAS_GROUP_ID}/clusters/${process.env.MONGODB_ATLAS_CLUSTER_NAME}`,
    {
      auth: {
        username: process.env.MONGODB_ATLAS_PUBLIC_KEY,
        password: process.env.MONGODB_ATLAS_PRIVATE_KEY,
      },
    }
  );
  return res.data;
};

// Render: fetch service status
const getRenderStatus = async () => {
  const baseURL = "https://api.render.com/v1/services";
  const headers = {
    Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
  };

  const [backendRes, frontendRes] = await Promise.all([
    axios.get(`${baseURL}/${process.env.RENDER_BACKEND_SERVICE_ID}`, {
      headers,
    }),
    axios.get(`${baseURL}/${process.env.RENDER_FRONTEND_SERVICE_ID}`, {
      headers,
    }),
  ]);

  return {
    backend: backendRes.data,
    frontend: frontendRes.data,
  };
};
