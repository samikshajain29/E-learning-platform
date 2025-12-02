import React from "react";
import { FaStar } from "react-icons/fa";
import { FaRegStar } from "react-icons/fa";
import { useSelector } from "react-redux";

function ReviewCard({
  comment,
  rating,
  photoUrl,
  name,
  description,
  courseTitle,
}) {
  const { userData } = useSelector((state) => state.user);
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 max-w-sm w-full">
      <div className="flex items-center mb-3 text-yellow-400 text-sm">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <span key={1}>{i < rating ? <FaStar /> : <FaRegStar />}</span>
          ))}
      </div>
      <p className="text-gray-700 text-sm ">
        Review For: <span className="font-semibold">{courseTitle}</span>
      </p>
      <p className="text-gray-700 text-sm mb-5">
        Review: <span className="font-semibold">{comment}</span>
      </p>
      <div className="flex items-center gap-2">
        {photoUrl ? (
          <img
            src={photoUrl}
            className="w-10 h-10 rounded-full object-cover "
          />
        ) : (
          <div className="w-10 h-10 rounded-full text-white flex items-center justify-center text-[20px] border-2 border-white bg-black cursor-pointer">
            {userData?.name?.slice(0, 1).toUpperCase()}
          </div>
        )}
        <div>
          <h2 className="font-semibold text-gray-800 text-sm">{name}</h2>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
