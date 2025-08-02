import React, { useEffect, useState } from "react";
import axios from "axios";

const CLOUD_NAME = "db2yievod";
const FOLDER_NAME = "curtains samples";

export default function CurtainVisualizerCloudinary() {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch(
        `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${FOLDER_NAME.replace(/ /g, "_")}.json`
      );
      const data = await response.json();
      const urls = data.resources.map((img) => ({
        url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${img.public_id}.${img.format}`,
        name: img.public_id,
      }));
      setImages(urls);
    } catch (err) {
      console.error("Error fetching images:", err);
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    const uploads = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "unsigned_preset");
      formData.append("folder", FOLDER_NAME);

      try {
        setUploading(true);
        await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          formData
        );
      } catch (err) {
        console.error("Upload error:", err);
      } finally {
        setUploading(false);
      }
    });

    await Promise.all(uploads);
    fetchImages();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold mb-4">Curtain Visualizer</h1>

      <input
        type="file"
        multiple
        onChange={handleUpload}
        className="mb-6"
        disabled={uploading}
      />

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        {images.map((img) => (
          <button
            key={img.name}
            onClick={() => setSelected(img.url)}
            className="w-24 h-24 border-2 border-gray-300 rounded overflow-hidden shadow-md hover:scale-105 transition"
          >
            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-4xl aspect-video border shadow-lg bg-white">
        <img
          src="/room.jpg"
          alt="Room with window"
          className="w-full h-full object-cover"
        />
        {selected && (
          <img
            src={selected}
            alt="Curtain preview"
            className="absolute top-[20%] left-[15%] w-[70%] h-[60%] object-cover opacity-90 mix-blend-multiply pointer-events-none"
          />
        )}
      </div>
    </div>
  );
}
