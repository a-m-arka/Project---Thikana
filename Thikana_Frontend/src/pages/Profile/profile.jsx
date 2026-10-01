import { useEffect, useRef, useState } from "react";
import {
  HiOutlineCamera,
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineKey,
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineBuildingOffice,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { useAuth } from "../../context/AuthContext";
import "./profile.scss";

export default function Profile() {
  const { apiUrl, user, updateUser, authenticatedFetch } = useAuth();
  const fileInputRef = useRef(null);

  // Stats
  const [stats, setStats] = useState({ properties: 0, posts: 0, views: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  // Profile picture
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picMessage, setPicMessage] = useState({ type: "", text: "" });

  // Profile info form
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone_number || "",
    address: user?.address || "",
  });
  const [profileMessage, setProfileMessage] = useState({ type: "", text: "" });

  // Password form
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwordMessage, setPasswordMessage] = useState({ type: "", text: "" });

  // Load user data and stats
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userRes, propRes, postRes] = await Promise.allSettled([
          authenticatedFetch(`${apiUrl}/user/get-user-data`),
          authenticatedFetch(`${apiUrl}/property/user-properties`),
          authenticatedFetch(`${apiUrl}/post/user-posts`),
        ]);

        if (userRes.status === "fulfilled" && userRes.value.ok) {
          const userData = await userRes.value.json();
          if (userData.data) {
            updateUser(userData.data);
            setProfileForm({
              name: userData.data.name || "",
              email: userData.data.email || "",
              phone: userData.data.phone_number || "",
              address: userData.data.address || "",
            });
          }
        }

        let propCount = 0;
        let totalViews = 0;
        if (propRes.status === "fulfilled" && propRes.value.ok) {
          const propData = await propRes.value.json();
          const propsList = Array.isArray(propData.properties) ? propData.properties : [];
          propCount = propsList.length;
          totalViews = propsList.reduce((acc, p) => acc + Number(p.views || 0), 0);
        }

        let postCount = 0;
        if (postRes.status === "fulfilled" && postRes.value.ok) {
          const postData = await postRes.value.json();
          postCount = Array.isArray(postData.posts) ? postData.posts.length : 0;
        }

        setStats({ properties: propCount, posts: postCount, views: totalViews });
      } catch {
        // preserve silent behavior
      } finally {
        setLoadingStats(false);
      }
    };

    loadData();
  }, [apiUrl, authenticatedFetch]);

  // Handle Profile Picture Upload
  const handlePictureClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPic(true);
    setPicMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await authenticatedFetch(`${apiUrl}/user/update-profile-picture`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile picture");

      // Refresh user data
      const refreshRes = await authenticatedFetch(`${apiUrl}/user/get-user-data`);
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.data) {
          updateUser(refreshData.data);
        }
      }

      setPicMessage({ type: "success", text: data.message || "Profile picture updated!" });
    } catch (err) {
      setPicMessage({ type: "error", text: err.message });
    } finally {
      setUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle Profile Info Submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage({ type: "", text: "" });

    try {
      const res = await authenticatedFetch(`${apiUrl}/user/edit-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      updateUser({
        ...user,
        name: profileForm.name,
        email: profileForm.email,
        phone_number: profileForm.phone,
        address: profileForm.address,
      });

      setProfileMessage({ type: "success", text: data.message || "Profile details updated!" });
    } catch (err) {
      setProfileMessage({ type: "error", text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    setPasswordMessage({ type: "", text: "" });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match" });
      setSavingPassword(false);
      return;
    }

    try {
      const res = await authenticatedFetch(`${apiUrl}/user/change-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password");

      setPasswordMessage({ type: "success", text: data.message || "Password changed successfully!" });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordMessage({ type: "error", text: err.message });
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = (user?.name || "U")[0].toUpperCase();

  return (
    <div className="page profile-page">
      <div className="profile-page__header">
        <p className="eyebrow">Account Settings</p>
        <h1>My Profile</h1>
        <p className="profile-page__lead">
          Manage your personal details, profile picture, and security preferences.
        </p>
      </div>

      {/* Account Stats */}
      <div className="profile-stats">
        <div className="profile-stat-card">
          <div className="profile-stat-card__icon">
            <HiOutlineBuildingOffice />
          </div>
          <div className="profile-stat-card__info">
            <span className="profile-stat-card__value">
              {loadingStats ? "..." : stats.properties}
            </span>
            <span className="profile-stat-card__label">Properties Owned</span>
          </div>
        </div>

        <div className="profile-stat-card">
          <div className="profile-stat-card__icon">
            <HiOutlineDocumentText />
          </div>
          <div className="profile-stat-card__info">
            <span className="profile-stat-card__value">
              {loadingStats ? "..." : stats.posts}
            </span>
            <span className="profile-stat-card__label">Active Posts</span>
          </div>
        </div>


      </div>

      <div className="profile-grid-container">
        {/* Profile Card (Avatar + Info) */}
        <div className="profile-card">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {user?.profile_picture_url ? (
                <img src={user.profile_picture_url} alt={user?.name || "Profile"} />
              ) : (
                <span>{initials}</span>
              )}
              {uploadingPic && (
                <div className="profile-avatar__overlay">
                  <span>Uploading...</span>
                </div>
              )}
            </div>

            {/* Bottom-left upload button */}
            <button
              type="button"
              className="profile-avatar__upload-btn"
              onClick={handlePictureClick}
              disabled={uploadingPic}
              title="Upload new profile picture"
              aria-label="Upload new profile picture"
            >
              <HiOutlineCamera />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handlePictureChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile-user-summary">
            <h2>{user?.name || "User Name"}</h2>
            <p>{user?.email || "user@example.com"}</p>
          </div>

          {picMessage.text && (
            <p className={`profile-notice profile-notice--${picMessage.type}`}>
              {picMessage.text}
            </p>
          )}

          {/* Personal Information Form */}
          <form className="profile-info-form" onSubmit={handleProfileSubmit}>
            <h3>
              <HiOutlineUser /> Personal Information
            </h3>

            <div className="form-group">
              <label>
                Full Name
                <div className="input-with-icon">
                  <HiOutlineUser className="input-icon" />
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, name: e.target.value })
                    }
                  />
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                Email Address
                <div className="input-with-icon">
                  <HiOutlineEnvelope className="input-icon" />
                  <input
                    type="email"
                    required
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, email: e.target.value })
                    }
                  />
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                Phone Number
                <div className="input-with-icon">
                  <HiOutlinePhone className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. 01700000000"
                    value={profileForm.phone}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, phone: e.target.value })
                    }
                  />
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                Address
                <div className="input-with-icon">
                  <HiOutlineMapPin className="input-icon" />
                  <input
                    type="text"
                    placeholder="Your address"
                    value={profileForm.address}
                    onChange={(e) =>
                      setProfileForm({ ...profileForm, address: e.target.value })
                    }
                  />
                </div>
              </label>
            </div>

            {profileMessage.text && (
              <p className={`profile-notice profile-notice--${profileMessage.type}`}>
                {profileMessage.text}
              </p>
            )}

            <button
              type="submit"
              className="button profile-submit-btn"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving Changes..." : "Save Profile Information"}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="profile-card profile-card--security">
          <h3>
            <HiOutlineKey /> Change Password
          </h3>
          <p className="profile-card__subtitle">
            Update your password regularly to keep your account secure.
          </p>

          <form className="profile-password-form" onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>
                Current Password
                <div className="input-with-icon">
                  <HiOutlineKey className="input-icon" />
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, oldPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
                    }
                    title={showPasswords.old ? "Hide password" : "Show password"}
                  >
                    {showPasswords.old ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                New Password
                <div className="input-with-icon">
                  <HiOutlineKey className="input-icon" />
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                    }
                    title={showPasswords.new ? "Hide password" : "Show password"}
                  >
                    {showPasswords.new ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
              </label>
            </div>

            <div className="form-group">
              <label>
                Confirm New Password
                <div className="input-with-icon">
                  <HiOutlineKey className="input-icon" />
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() =>
                      setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))
                    }
                    title={showPasswords.confirm ? "Hide password" : "Show password"}
                  >
                    {showPasswords.confirm ? <HiOutlineEyeSlash /> : <HiOutlineEye />}
                  </button>
                </div>
              </label>
            </div>

            {passwordMessage.text && (
              <p className={`profile-notice profile-notice--${passwordMessage.type}`}>
                {passwordMessage.text}
              </p>
            )}

            <button
              type="submit"
              className="button profile-submit-btn"
              disabled={savingPassword}
            >
              {savingPassword ? "Updating Password..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
