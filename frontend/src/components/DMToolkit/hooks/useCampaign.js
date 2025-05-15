import { useEffect, useState } from "react";
import axios from "axios";
import { useUserContext } from "../../../context/UserContext";

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [error, setError] = useState(null);
  const { user } = useUserContext();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/campaigns`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const ownedCampaigns = res.data.filter(
          (campaign) => campaign.creator === user._id
        );

        setCampaigns(ownedCampaigns);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
        setError(err);
      }
    };

    if (user?._id) {
      fetchCampaigns();
    }
  }, [user]);

  return { campaigns, error };
};
