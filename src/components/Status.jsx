import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addStatus } from "../utils/statusSlice";
import { useEffect } from "react";

const Status = () => {
  let statusData = useSelector((store) => store?.status);

  const dispatch = useDispatch();

  const getStatusData = async () => {
    try {
      statusData = await axios.get(
        BASE_URL + "/user/request/all",
        {
          withCredentials: true,
        }
      );

      dispatch(addStatus(statusData.data.data));
    } catch (err) {
      console.log(err.response);
    }
  };

  useEffect(() => {
    getStatusData();
  }, []);

  if (!statusData || statusData.length === 0)
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <div className="text-6xl mb-4">📡</div>

        <h1 className="text-3xl font-bold">
          No Status Found
        </h1>

        <p className="text-base-content/50 mt-2">
          Your sent request updates will appear here
        </p>
      </div>
    );

  return (
    <div className="w-full md:w-225 mx-auto px-4 py-8">

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold">
          Request Status
        </h1>

        <p className="text-base-content/50 mt-2">
          Track the status of your sent connection requests
        </p>
      </div>

      {/* Status Cards */}
      <div className="flex flex-col gap-5 bg-base-300 p-7 rounded-2xl">

        {statusData.map((user) => {
          const {
            _id,
            firstName,
            lastName,
            age,
            gender,
            photoUrl,
            about,
          } = user.toUserId;

          const status = user.status;

          let tag = null;

          if (status === "interested") tag = "pending";
          else tag = status;

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

                {/* Status Badge */}
                <div className="w-full lg:w-auto">

                  {tag === "accepted" && (
                    <div className="badge badge-success badge-lg px-5 py-4 font-semibold capitalize w-full lg:w-auto">
                      Accepted
                    </div>
                  )}

                  {tag === "rejected" && (
                    <div className="badge badge-error badge-lg px-5 py-4 font-semibold capitalize w-full lg:w-auto">
                      Rejected
                    </div>
                  )}

                  {tag === "pending" && (
                    <div className="badge badge-info badge-lg px-5 py-4 font-semibold capitalize w-full lg:w-auto">
                      Pending
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Status;