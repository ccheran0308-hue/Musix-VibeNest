import { useState } from "react";

function Home() {
  const songs = [
    {
      song_id: 1,
      song_name: "Song One",
      file: "/songs/song1.mp3",
      image: "/songs/song1.jpg" // optional
    },
    {
      song_id: 2,
      song_name: "Song Two",
      file: "/songs/song2.mp3",
      image: "/songs/song2.jpg" // optional
    }
  ];

  const [currentAudio, setCurrentAudio] = useState(null);

  const playSong = (song) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    const audio = new Audio(song.file);
    audio.play();
    setCurrentAudio(audio);
  };

  return (
    <div className="home">
      <h3 className="centertitles">My Songs</h3>

      <div className="recents-container">
        {songs.map((song) => (
          <div className="songs" key={song.song_id}>
            <div>
              <img
                src={song.image || "/default.jpg"}
                alt="song"
                width="80"
              />
            </div>

            <div>
              <h4>{song.song_name}</h4>
            </div>

            <div className="buts">
              <button onClick={() => playSong(song)}>▶ Play</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
