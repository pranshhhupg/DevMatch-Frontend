import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch, useSelector } from "react-redux";
import { addConnection } from "../utils/connectionSlice";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DeveloperLink from "./DeveloperLink";

const Connections = () => {
  const dispatch = useDispatch();
  let users = useSelector((store) => store?.connection);

  const [search, setSearch] = useState("");

  const getConnections = async () => {
    try {
      users = await axios.get(BASE_URL + "/user/connections", {
        withCredentials: true,
      });

      dispatch(addConnection(users.data.data));
    } catch (err) {
      console.log(err.response);
    }
  };

  useEffect(() => {
    getConnections();
  }, []);

  const filteredUsers = users?.filter((user) => {
    const fullName =
      `${user.firstName} ${user.lastName}`.toLowerCase();

    return fullName.includes(search.toLowerCase());
  });

  if (!users || users.length === 0)
    return (
      <div className="flex flex-col items-center justify-center mt-24">
        <div className="text-6xl mb-4">🤝</div>

        <h1 className="text-3xl font-bold">
          No Connections Yet
        </h1>

        <p className="text-base-content/50 mt-2 text-center">
          Start connecting with developers from your feed
        </p>
      </div>
    );

  return (
    <div className="w-225 mx-auto py-8">

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">
          Your Connections
        </h1>

        <h3 className="text-base-content/50 text-md">
          Developers you have connected with
        </h3>

        {/* Search Bar */}
        <div className="mb-6 mt-8 mx-2">
        <input
          type="text"
          placeholder="Search developers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered w-full bg-base-200 rounded-lg"
        />
      </div>
      </div>

      {/* Connections List */}
      <div className="flex flex-col gap-5 bg-base-300 p-7 rounded-2xl">

        {filteredUsers.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">
              🔍
            </div>

            <h2 className="text-2xl font-bold">
              No matching connections
            </h2>

            <p className="text-base-content/50 mt-2">
              Try searching with another name
            </p>
          </div>
        )}

        {filteredUsers.map((user) => {
          const {
            _id,
            firstName,
            lastName,
            age,
            gender,
            photoUrl,
            about,
          } = user;

          return (
            <div
              key={_id}
              className="bg-base-200 rounded-3xl p-5 shadow-md border border-base-300 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                {/* Avatar */}
                <div className="flex justify-center">
                  <DeveloperLink userId={_id}>
                    <img
                      src={
                        photoUrl ||
                        "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                      }
                      alt="USER"
                      className="w-20 h-20 rounded-2xl object-cover border border-base-300 hover:ring-2 hover:ring-primary transition-all"
                    />
                  </DeveloperLink>
                </div>

                {/* User Info */}
                <div className="flex-1">

                  <div className="flex flex-wrap items-center gap-2">
                    <DeveloperLink
                      userId={_id}
                      className="hover:underline hover:text-primary transition-colors"
                    >
                      <h2 className="text-2xl font-bold">
                        {firstName} {lastName}
                      </h2>
                    </DeveloperLink>

                    {age && gender && (
                      <span className="badge badge-outline capitalize">
                        {age}, {gender}
                      </span>
                    )}
                  </div>

                  {about && (
                    <p className="text-base-content/60 leading-relaxed text-sm line-clamp-2">
                      {about}
                    </p>
                  )}
                </div>

                {/* Chat Button */}
                <div className="flex justify-end">
                  <Link to={"/chat/" + _id}>
                    <button className="btn btn-primary rounded-xl px-6">
                      💬 Chat
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Connections;