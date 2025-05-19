const axios = require("axios");
const MongoDBAtlas = require("mongodb-atlas-api-client");
const DigestClient = require("http-digest-client");
const { AtlasClient } = require("mongodb-atlas-api-client");
const DigestFetch = require("digest-fetch");
const { request } = require("urllib");

// SUPABASE: Get project info
const getSupabaseStatus = async () => {
  return {
    billingUrl:
      "https://supabase.com/dashboard/org/dcwltddfsecmatrcwnyk/usage?projectRef=svlmukjetqonqgtdfztp",
    error:
      "Detailed usage metrics are not accessible via API. Click the link to view in Supabase.",
  };
};

// MONGODB ATLAS: Get cluster info
const getMongoStatus = async () => {
  const url = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${process.env.MONGODB_ATLAS_GROUP_ID}/clusters/${process.env.MONGODB_ATLAS_CLUSTER_NAME}`;
  const digestAuth = `${process.env.MONGODB_ATLAS_PUBLIC_KEY}:${process.env.MONGODB_ATLAS_PRIVATE_KEY}`;

  try {
    const { data, res } = await request(url, {
      digestAuth,
      dataType: "json",
      headers: {
        Accept: "application/json",
      },
      timeout: 5000,
    });

    if (res.statusCode !== 200) {
      return { error: `MongoDB API error: ${res.statusCode}` };
    }

    return {
      clusterName: data.name,
      state: data.stateName,
      paused: data.paused,
      mongoDBVersion: data.mongoDBVersion,
      instanceSize: data.providerSettings?.instanceSizeName,
      provider: `${data.providerSettings?.backingProviderName} (${data.providerSettings?.regionName})`,
      clusterType: data.clusterType,
      diskSizeGB: data.diskSizeGB,
      backupEnabled: data.backupEnabled,
      autoScaling: {
        compute: data.autoScaling?.compute?.enabled || false,
        disk: data.autoScaling?.diskGBEnabled || false,
      },
      connectionStrings: {
        standardSrv: data.connectionStrings?.standardSrv,
      },
    };
  } catch (err) {
    console.error("❌ MongoDB fetch error:", err.message);
    return { error: err.message };
  }
};

// RENDER: Get both backend & frontend services
const getRenderStatus = async () => {
  const headers = {
    Authorization: `Bearer ${process.env.RENDER_API_KEY}`,
  };

  const [backendRes, frontendRes] = await Promise.all([
    axios.get(
      `https://api.render.com/v1/services/${process.env.RENDER_BACKEND_SERVICE_ID}`,
      { headers }
    ),
    axios.get(
      `https://api.render.com/v1/services/${process.env.RENDER_FRONTEND_SERVICE_ID}`,
      { headers }
    ),
  ]);

  return {
    backend: backendRes.data,
    frontend: frontendRes.data,
  };
};

exports.getPlatformStatus = async (req, res) => {
  const result = {
    supabase: null,
    mongodb: null,
    render: { backend: null, frontend: null },
  };

  try {
    console.log("🔄 Fetching Render...");
    const render = await getRenderStatus();
    result.render = render;
  } catch (err) {
    console.error("❌ Render fetch error:", err.message);
    result.render = { error: err.message };
  }

  try {
    console.log("🔄 Fetching Mongo...");
    const mongodb = await getMongoStatus();
    result.mongodb = mongodb;
  } catch (err) {
    console.error("❌ MongoDB fetch error:", err.message);
    result.mongodb = { error: err.message };
  }

  try {
    console.log("🔄 Fetching Supabase usage...");
    const supabase = await getSupabaseStatus();
    result.supabase = supabase;
  } catch (err) {
    console.error("❌ Supabase setup error:", err.message);
    result.supabase = { error: err.message };
  }

  res.json(result);
};
