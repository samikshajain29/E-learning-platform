import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import img from "../../assets/empty.jpg";
import { FaEdit } from "react-icons/fa";

function Courses() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-[100%] min-h-screen p-4 sm:p-6 bg-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div className="flex items-center justify-center gap-3">
            <FaArrowLeftLong
              className="w-[22px] h-[22px] cursor-pointer"
              onClick={() => navigate("/dashboard")}
            />
            <h1 className="text-2xl font-semibold">All Created Courses</h1>
          </div>
          <button
            className="bg-[black] text-white px-4 py-2 rounded hover:bg-gray-500"
            onClick={() => navigate("/createcourse")}
          >
            Create Course
          </button>
        </div>

        {/* for Large Screen table */}
        <div className="hidden md:block bg-white rounded-xl shadow p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-black bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Courses</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr className="border-b border-black hover:bg-gray-50 transition duration-200">
                <td className="py-3 px-4 flex items-center gap-4">
                  <img
                    src={img}
                    alt="thumbnail"
                    className="w-25 h-14 object-cover rounded-md "
                  />{" "}
                  <span>Title</span>
                </td>
                <td className="px-4 py-3">Rs. NA</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-600">
                    Draft
                  </span>
                </td>
                <td className="px-4 py-3">
                  <FaEdit className="text-gray-600 hover:text-blue-600 cursor-pointer" />
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-center text-sm text-gray-400 mt-6">
            A list of your recent courses.
          </p>
        </div>
        {/* for small Screen table */}
        <div className="md:hidden space-y-4">
          <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-3">
            <div className="flex gap-4 items-center">
              <img
                src={img}
                alt="thumbnail"
                className="w-16 h-16 rounded-md object-cover"
              />
              <div className="flex-1">
                <h2 className="font-medium text-sm">title</h2>
                <p className="text-gray-600 text-xs mt-1">Rs NA</p>
              </div>
              <FaEdit className="text-gray-600 hover:text-blue-600 cursor-pointer" />
            </div>
            <span className="w-fit px-3 py-1 text-xs rounded-full bg-red-100 text-red-600">
              Draft
            </span>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4 ">
            A list of your recent courses.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Courses;
