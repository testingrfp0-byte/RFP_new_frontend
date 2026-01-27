import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "../../contexts/ThemeContext";
import ConfirmationDialog from "../../components/ui/ConfirmationDialog";
import {
  FETCH_TEAM_USERS_REQUEST,
  ADD_TEAM_USER_REQUEST,
  DELETE_TEAM_USER_REQUEST,
} from "../../features/team/teamUser/teamUserTypes";

import {
  selectTeamUsers,
  selectTeamUsersLoading,
  selectTeamUsersSuccess,
} from "../../features/team/teamUser/selectors";
import AddTeamUserModal from "../../components/ui/AddTeamUserModal";
import { validateAddTeamUserFields } from "../../utilis/fieldValidations";

function generatePassword(length = 10) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export default function TeamUser() {
  const { isDarkMode } = useTheme();
  const dispatch = useDispatch();
  const addLoading = useSelector(selectTeamUsersLoading);
  const users = useSelector(selectTeamUsers);
  const successMessage = useSelector(selectTeamUsersSuccess);

  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("reviewer");
  const [password, setPassword] = useState(generatePassword());
  const calledOnceRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    if (!calledOnceRef.current) {
      dispatch({ type: FETCH_TEAM_USERS_REQUEST });
      calledOnceRef.current = true;
    }
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      setShowModal(false);
      setName("");
      setEmail("");
      setRole("reviewer");
      setErrors({});
      dispatch({ type: "teamUsers/CLEAR_SUCCESS" });
    }
  }, [successMessage, dispatch]);

  // Combined search for all users
  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredUsers.slice(indexOfFirstRecord, indexOfLastRecord);
  const nPages = Math.ceil(filteredUsers.length / recordsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const openModal = () => {
    setName("");
    setEmail("");
    setRole("reviewer");
    setPassword(generatePassword());
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleAddUser = (e) => {
    e.preventDefault();
    const validationErrors = validateAddTeamUserFields({ name, email, password });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    dispatch({
      type: ADD_TEAM_USER_REQUEST,
      payload: {
        username: name,
        email,
        password,
        mode: "add",
        role: role,
      },
    });
  };

  const handleFieldChange = (field, value) => {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "role") setRole(value);

    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    dispatch({
      type: DELETE_TEAM_USER_REQUEST,
      payload: {
        user_id: userToDelete.user_id,
        role: userToDelete.role,
      },
    });
    closeConfirmDialog();
  };

  const openConfirmDialog = (user) => {
    setUserToDelete(user);
    setShowConfirmDialog(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setUserToDelete(null);
  };

  return (
    <div className={`p-4 transition-colors ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className={`text-3xl font-bold mb-2 flex items-center gap-3 transition-colors ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            <span className="text-4xl">👥</span>
            Team Members
          </h2>
          <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
            Manage your organization's team members and their access levels
          </p>
        </div>

        <div className={`rounded-xl shadow-xl transition-colors ${isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"}`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                  All Team Members
                </h3>
                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-bold">
                  Total members: {filteredUsers.length}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search by name, email or role..."
                  value={searchTerm}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, "");
                    setSearchTerm(value);
                    setCurrentPage(1);
                  }}
                  className={`w-72 p-3 rounded-lg transition-colors focus:border-purple-500 focus:ring-1 focus:ring-purple-500 ${isDarkMode ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400" : "bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500"
                    }`}
                />
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
                  onClick={openModal}
                >
                  <span className="text-xl">+</span> Add Team Member
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                    <th className={`px-4 py-4 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Name</th>
                    <th className={`px-4 py-4 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Email</th>
                    <th className={`px-4 py-4 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Role</th>
                    <th className={`px-4 py-4 text-left font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecords.map((user, idx) => (
                    <tr key={idx} className={`border-b transition-colors ${isDarkMode ? "border-gray-700 hover:bg-gray-750" : "border-gray-200 hover:bg-gray-50"}`}>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 text-sm font-bold">
                            {user.username?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <span className={`font-medium ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            {user.username || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className={`px-4 py-4 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{user.email}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider ${user.role === "admin"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-purple-500/20 text-purple-400"
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          disabled={user.role === "admin"}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${user.role === "admin"
                            ? "bg-gray-300 cursor-not-allowed text-gray-500 opacity-50"
                            : "bg-red-500 hover:bg-red-600 text-white shadow-sm shadow-red-500/20"
                            }`}
                          onClick={() => openConfirmDialog(user)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <p className={`text-lg ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>No team members found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pagination Section */}
        {nPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg border transition-all ${isDarkMode ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-30`}
              >
                Prev
              </button>
              {[...Array(nPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`w-10 h-10 rounded-lg font-bold transition-all ${currentPage === index + 1
                    ? "bg-purple-600 text-white"
                    : isDarkMode ? "bg-gray-800 text-gray-400 hover:bg-gray-700" : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === nPages}
                className={`px-4 py-2 rounded-lg border transition-all ${isDarkMode ? "bg-gray-800 border-gray-700 text-white hover:bg-gray-700" : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-30`}
              >
                Next
              </button>
            </nav>
          </div>
        )}

        <AddTeamUserModal
          isOpen={showModal}
          onClose={closeModal}
          onSubmit={handleAddUser}
          isDarkMode={isDarkMode}
          name={name}
          email={email}
          role={role}
          password={password}
          loading={addLoading}
          errors={errors}
          handleFieldChange={handleFieldChange}
        />

        <ConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={closeConfirmDialog}
          onConfirm={handleDeleteUser}
          title="Remove Team Member"
          message={`Are you sure you want to remove ${userToDelete?.email}? This will revoke their access immediately.`}
        />
      </div>
    </div>
  );
}