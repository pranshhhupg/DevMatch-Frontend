import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { addRequest, removeRequest } from "../utils/requestSlice";
import { useEffect } from "react";

const Requests = () => {
  const dispatch = useDispatch();

  let request = useSelector((store) => store?.requests);

  const handleRequest = async (status, id) => {
    try {
      await axios.post(
        BASE_URL + "/request/review/" + status + "/" + id,
        {},
        {
          withCredentials: true,
        }
      );

      dispatch(removeRequest(id));
    } catch (err) {
      console.log(err.response.data);
    }
  };

  const fetchRequests = async () => {
    try {
      request = await axios.get(BASE_URL + "/user/requests", {
        withCredentials: true,
      });

      dispatch(addRequest(request.data.data));
    } catch (err) {
      console.log(err.response);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (!request || request.length === 0)
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <div className="text-6xl mb-4">📬</div>

        <h1 className="text-3xl font-bold">
          No Requests Found
        </h1>

        <p className="text-base-content/50 mt-2">
          New connection requests will appear here
        </p>
      </div>
    );

  return (
    <div className="w-full md:w-225 mx-auto px-4 py-8">

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">
          Connection Requests
        </h1>

        <p className="text-base-content/50 ">
          Developers who want to connect with you
        </p>
      </div>

      {/* Request Cards */}
      <div className="flex flex-col gap-5 bg-base-300 p-7 rounded-2xl">

        {request.map((user) => {
          const {
            _id,
            firstName,
            lastName,
            age,
            gender,
            photoUrl,
            about,
          } = user.fromUserId;

          return (
            <div
              key={user._id}
              className="bg-base-200 border border-base-300 rounded-3xl p-5 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-center">

                {/* Avatar */}
                <div className="avatar">
                  <div className="w-24 rounded-2xl">
                    <img
                      src={
                        photoUrl ||
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      }
                      alt="USER"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl font-bold">
                      {firstName} {lastName}
                    </h2>

                    {age && gender && (
                      <span className="badge badge-outline capitalize">
                        {age}, {gender}
                      </span>
                    )}
                  </div>

                  {about && (
                    <p className="text-base-content/60 leading-relaxed line-clamp-2">
                      {about}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full lg:w-auto">

                  <button
                    className="btn bg-red-800 hover:bg-red-900 flex-1 lg:flex-none rounded-lg px-6"
                    onClick={() =>
                      handleRequest("rejected", user._id)
                    }
                  >
                    Reject
                  </button>

                  <button
                    className="btn bg-green-800 hover:bg-green-900 flex-1 lg:flex-none rounded-lg px-6"
                    onClick={() =>
                      handleRequest("accepted", user._id)
                    }
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Requests;