import { useState } from "react";

const SwipeCard = ({ profile, onSwipe }) => {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState(null);

  const handleMouseDown = (e) => { setDragging(true); setStart({ x: e.clientX, y: e.clientY }); };
  const handleMouseMove = (e) => { if (!dragging) return; setOffset({ x: e.clientX - start.x, y: e.clientY - start.y }); };
  const handleMouseUp = () => {
    if (offset.x > 80) onSwipe("like");
    else if (offset.x < -80) onSwipe("pass");
    setDragging(false);
    setOffset({ x: 0, y: 0 });
  };

  const rotation = offset.x * 0.1;
  const likeOpacity = Math.min(offset.x / 80, 1);
  const passOpacity = Math.min(-offset.x / 80, 1);

  return (
    <div
      className="w-full select-none cursor-grab active:cursor-grabbing"
      style={{ transform: `translateX(${offset.x}px) translateY(${offset.y}px) rotate(${rotation}deg)`, transition: dragging ? "none" : "transform 0.3s ease" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Fixed height image */}
        <div className="relative">
          <img
            src={profile.profilePhotos?.[0] || `https://ui-avatars.com/api/?name=${profile.name}&size=400&background=fda4af&color=fff`}
            className="w-full h-64 object-cover"
            alt={profile.name}
            draggable={false}
          />
          {likeOpacity > 0.1 && (
            <div className="absolute top-6 left-6 border-4 border-green-400 text-green-400 text-3xl font-black px-4 py-1 rounded-xl rotate-[-20deg]" style={{ opacity: likeOpacity }}>
              LIKE 💚
            </div>
          )}
          {passOpacity > 0.1 && (
            <div className="absolute top-6 right-6 border-4 border-red-400 text-red-400 text-3xl font-black px-4 py-1 rounded-xl rotate-[20deg]" style={{ opacity: passOpacity }}>
              PASS ❌
            </div>
          )}
        </div>

        {/* Scrollable info — max height so it doesn't overflow */}
        <div className="p-4 max-h-40 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-800">{profile.name}, {profile.age}</h2>
          <p className="text-rose-500 font-medium text-sm">
            {profile.college} • {profile.branch}
            {profile.gender === "Male" ? <span className="ml-1">• M</span> : profile.gender === "Female" ? <span className="ml-1">• F</span> : ""}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">{profile.course} • Year {profile.year}</p>
          {profile.bio && <p className="text-gray-500 text-sm mt-2">{profile.bio}</p>}
          {profile.interests?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {profile.interests.map((i) => (
                <span key={i} className="bg-rose-50 text-rose-500 text-xs px-3 py-1 rounded-full">{i}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SwipeCard;
