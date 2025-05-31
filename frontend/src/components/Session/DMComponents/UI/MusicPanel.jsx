import React, { useState, useEffect, useContext } from "react";
import { musicTracks } from "../../Music/musicTracks";
import { UserContext } from "../../../../context/UserContext";
import styles from "../../../../styles/SessionStyles/Music/MusicPanel.module.css";

const MusicPanel = ({
  campaign,
  socket,
  currentTrack,
  setCurrentTrack,
  audioInstance,
  setAudioInstance,
  currentTrackIndex,
  setCurrentTrackIndex,
  repeat,
  setRepeat,
  volume,
  setVolume,
  playlist,
  setPlaylist,
  handlePlay,
}) => {
  const { user } = useContext(UserContext);
  const [tracks, setTracks] = useState([]);
  const [selectedTrackIndex, setSelectedTrackIndex] = useState(0);
  const [playlistName, setPlaylistName] = useState("");
  const [savedPlaylists, setSavedPlaylists] = useState([]);

  useEffect(() => {
    setTracks(musicTracks);
    if (user?._id) {
      fetchPlaylists();
    }
  }, [user?._id]);

  const fetchPlaylists = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "user-id": user?._id, // ✅ Add this header
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("❌ Playlist fetch failed:", data.message || data);
        return;
      }

      if (!Array.isArray(data)) {
        console.error("❌ Expected array but got:", data);
        return;
      }

      setSavedPlaylists(data);
    } catch (err) {
      console.error("❌ Failed to fetch playlists:", err);
    }
  };

  const handleStop = () => {
    if (audioInstance) {
      audioInstance.pause();
      audioInstance.currentTime = 0;
      setAudioInstance(null);
      setCurrentTrack(null);
      setCurrentTrackIndex(null);
    }
  };

  const handleNext = () => {
    if (
      playlist &&
      currentTrackIndex !== null &&
      currentTrackIndex < playlist.length - 1
    ) {
      const nextIndex = currentTrackIndex + 1;
      handlePlay(playlist[nextIndex], nextIndex);
    }
  };

  const handlePrevious = () => {
    if (playlist && currentTrackIndex !== null && currentTrackIndex > 0) {
      const prevIndex = currentTrackIndex - 1;
      handlePlay(playlist[prevIndex], prevIndex);
    }
  };

  const handleAddToPlaylist = (track) => {
    if (!playlist.includes(track)) {
      setPlaylist([...playlist, track]);
    }
  };

  const handleSavePlaylist = async () => {
    if (!playlistName || playlist.length === 0) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/playlists`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "user-id": user?._id, // ✅ Added here
        },
        body: JSON.stringify({
          name: playlistName,
          tracks: playlist,
        }),
      });

      if (res.ok) {
        const newPlaylist = await res.json();
        setSavedPlaylists([...savedPlaylists, newPlaylist]);
        setPlaylist([]);
        setPlaylistName("");
      } else {
        const error = await res.text();
        console.error("❌ Failed to save playlist:", error);
      }
    } catch (err) {
      console.error("❌ Failed to save playlist:", err);
    }
  };

  const handleDeletePlaylist = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/playlists/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "user-id": user?._id,
          },
        }
      );

      if (res.ok) {
        setSavedPlaylists((prev) => prev.filter((pl) => pl._id !== id));
      } else {
        const error = await res.text();
        console.error("❌ Failed to delete playlist:", error);
      }
    } catch (err) {
      console.error("❌ Failed to delete playlist:", err);
    }
  };

  return (
    <div className={styles.container}>
      <h2>🎵 Music Panel</h2>

      <div className={styles.section}>
        <h3>Select Track</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <select
            className={styles.input}
            value={selectedTrackIndex}
            onChange={(e) => setSelectedTrackIndex(Number(e.target.value))}
            style={{ flexGrow: 1 }}
          >
            {tracks.map((track, index) => (
              <option key={index} value={index}>
                {track.title}
              </option>
            ))}
          </select>

          <button
            className={styles.button}
            onClick={() => handleAddToPlaylist(tracks[selectedTrackIndex])}
          >
            ➕ Add
          </button>
          <button
            className={styles.button}
            onClick={() => handlePlay(tracks[selectedTrackIndex])}
          >
            ▶️ Play
          </button>
        </div>
      </div>

      {currentTrack && (
        <div className={styles.nowPlaying}>
          <strong>Now Playing:</strong> {currentTrack.title}
          <div className={styles.controls}>
            <button className={styles.button} onClick={handlePrevious}>
              ⏮️
            </button>
            <button className={styles.button} onClick={handleStop}>
              ⏹️
            </button>
            <button className={styles.button} onClick={handleNext}>
              ⏭️
            </button>
            <button
              className={styles.button}
              onClick={() => setRepeat(!repeat)}
            >
              🔁 Repeat {repeat ? "✅" : "❌"}
            </button>
            <label style={{ marginLeft: "auto" }}>
              🔊
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={(e) => {
                  const vol = parseFloat(e.target.value);
                  setVolume(vol);
                  if (audioInstance) {
                    audioInstance.volume = vol;
                  }
                }}
                style={{ verticalAlign: "middle", marginLeft: "0.5rem" }}
              />
            </label>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h3>Current Playlist</h3>
        <ul className={styles.trackList}>
          {playlist.map((track, index) => (
            <li key={index} className={styles.listItem}>
              {track.title}
            </li>
          ))}
        </ul>
        <div style={{ marginTop: "0.5rem" }}>
          <input
            type="text"
            placeholder="Playlist name"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            className={styles.input}
            style={{ width: "60%", marginRight: "0.5rem" }}
          />
          <button className={styles.button} onClick={handleSavePlaylist}>
            💾 Save
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Saved Playlists</h3>
        <ul className={styles.playlistList}>
          {savedPlaylists.map((pl) => (
            <li key={pl._id} className={styles.listItem}>
              <strong>{pl.name}</strong> ({pl.tracks?.length || 0} tracks)
              <div>
                <button
                  className={styles.button}
                  onClick={() => {
                    setPlaylist(pl.tracks);
                    if (pl.tracks.length > 0) {
                      handlePlay(pl.tracks[0], 0);
                    }
                  }}
                >
                  ▶️ Load
                </button>
                <button
                  className={styles.button}
                  onClick={() => handleDeletePlaylist(pl._id)}
                >
                  🗑️
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MusicPanel;
