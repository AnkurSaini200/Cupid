import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaEdit, FaInstagram, FaSnapchat, FaDiscord, FaCamera, FaTrash, FaSignOutAlt } from 'react-icons/fa';

import { useApp } from '../context/AppContext';
import { getCommunities } from '../api/communities';
import client from '../api/client';

const Profile = () => {
    const { currentUser, setCurrentUser, logout } = useApp();
    const navigate = useNavigate();
    const [uploading, setUploading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [allCommunities, setAllCommunities] = useState([]);
    const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);
    const fileInputRef = useRef(null);
    const avatarInputRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleEditClick = async () => {
        if (!currentUser) return;

        setIsLoadingCommunities(true);
        try {
            // Load communities for selection
            const data = await getCommunities();
            if (data.success) {
                setAllCommunities(data.data);
            }
        } catch (error) {
            console.error("Failed to load communities", error);
        } finally {
            setIsLoadingCommunities(false);
        }

        setEditForm({
            name: currentUser.name,
            bio: currentUser.bio,
            location: currentUser.location,
            interests: currentUser.interests || [], // Keep as array
            socials: currentUser.socials || {}
        });
        setIsEditing(true);
    };


    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            // interests is already an array in editForm now
            const interestsArray = editForm.interests;

            const res = await client.put(`/users/${currentUser.id}`, {
                ...editForm,
                interests: interestsArray
            });

            if (res.data.success) {
                setCurrentUser({ ...currentUser, ...res.data.data });
                setIsEditing(false);
            } else {
                alert('Update failed: ' + res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Update failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            // 1. Upload Photo
            // Axios automatically sets Content-Type to multipart/form-data when body is FormData
            const uploadRes = await client.post(`/users/${currentUser.id}/photos`, formData);

            if (!uploadRes.data.success) throw new Error(uploadRes.data.error || uploadRes.data.message);

            const photoUrl = uploadRes.data.data.photoUrl;

            // 2. Update Avatar
            const updateRes = await client.put(`/users/${currentUser.id}`, { avatar: photoUrl });

            if (updateRes.data.success) {
                const updatedUser = {
                    ...currentUser,
                    avatar: photoUrl,
                    photos: [...(currentUser.photos || []), photoUrl]
                };
                setCurrentUser(updatedUser);
            } else {
                throw new Error(updateRes.data.message);
            }

        } catch (err) {
            console.error(err);
            alert('Avatar update failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = '';
        }
    };

    const handleDeletePhoto = async (photoUrl) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;

        try {
            const res = await client.delete(`/users/${currentUser.id}/photos`, {
                data: { photoUrl }
            });

            if (res.data.success) {
                const updatedUser = {
                    ...currentUser,
                    photos: currentUser.photos.filter(p => p !== photoUrl),
                    avatar: res.data.data.avatar // Update avatar in case it was the deleted photo
                };
                setCurrentUser(updatedUser);
            } else {
                alert('Delete failed: ' + res.data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Delete failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !currentUser) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('photo', file);

        try {
            const res = await client.post(`/users/${currentUser.id}/photos`, formData);

            if (res.data.success) {
                // Update context
                const updatedUser = {
                    ...currentUser,
                    photos: [...(currentUser.photos || []), res.data.data.photoUrl]
                };
                setCurrentUser(updatedUser);
            } else {
                alert('Upload failed: ' + (res.data.error || res.data.message));
            }
        } catch (err) {
            console.error(err);
            alert('Upload failed: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Fallback if no user is logged in (though protected route should prevent this)
    const user = currentUser || {
        name: 'Guest User',
        location: 'Unknown',
        avatar: 'https://i.pravatar.cc/150?u=guest',
        bio: 'Please log in to see your profile.',
        interests: [],
        photos: []
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-white rounded-2xl overflow-hidden shadow-lg"
            >
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-600" />

                {/* Profile Info */}
                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16">
                        <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                            <img
                                src={user.avatar}
                                alt={user.name}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-all rounded-full">
                                <FaCamera className="text-white text-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <input
                                ref={avatarInputRef}
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                            />
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-3xl font-display font-bold text-gray-900">
                                {user.name}
                            </h1>
                            <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                                <FaMapMarkerAlt className="mr-1" />
                                {user.location}
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleEditClick}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-semibold shadow-lg"
                        >
                            <FaEdit />
                            <span>Edit Profile</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05, backgroundColor: '#fee2e2' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="flex items-center space-x-2 px-6 py-3 bg-white text-red-500 border-2 border-red-100 rounded-xl font-semibold shadow-lg hover:border-red-200 transition-colors"
                        >
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* About Me */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-white rounded-2xl p-6"
            >
                <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                    About Me
                </h3>
                <p className="text-gray-700 leading-relaxed">{user.bio}</p>
            </motion.div>

            {/* Interests */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-white rounded-2xl p-6"
            >
                <h3 className="text-xl font-display font-bold text-gray-900 mb-4">
                    Interests
                </h3>
                <div className="flex flex-wrap gap-3">
                    {user.interests?.map((interest, index) => (
                        <span
                            key={index}
                            className="px-4 py-2 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 rounded-full font-medium"
                        >
                            {interest}
                        </span>
                    ))}
                </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-white rounded-2xl p-6"
            >
                <h3 className="text-xl font-display font-bold text-gray-900 mb-4">
                    Social Links
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { icon: FaInstagram, name: 'Instagram', key: 'instagram', color: 'from-pink-500 to-purple-500' },
                        { icon: FaSnapchat, name: 'Snapchat', key: 'snapchat', color: 'from-yellow-400 to-yellow-500' },
                        { icon: FaDiscord, name: 'Discord', key: 'discord', color: 'from-indigo-500 to-indigo-600' }
                    ].map((social, index) => {
                        const link = user.socials?.[social.key];
                        if (!link) return null;

                        return (
                            <motion.a
                                key={index}
                                href={link.startsWith('http') ? link : `https://${social.key}.com/${link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ y: -4 }}
                                className={`flex items-center space-x-2 p-3 bg-gradient-to-r ${social.color} text-white rounded-xl shadow-lg transition-shadow hover:shadow-xl`}
                            >
                                <social.icon className="text-xl" />
                                <span className="font-medium text-sm">{link}</span>
                            </motion.a>
                        );
                    })}
                    {(!user.socials || Object.values(user.socials).every(s => !s)) && (
                        <div className="col-span-full text-center text-gray-500 italic">
                            No social links added yet.
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Photos */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-white rounded-2xl p-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-display font-bold text-gray-900">
                        Photos
                    </h3>
                    {currentUser && (
                        <div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => fileInputRef.current.click()}
                                disabled={uploading}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm flex items-center space-x-2"
                            >
                                <FaInstagram className="text-lg" />
                                <span>{uploading ? 'Uploading...' : 'Add Photo'}</span>
                            </motion.button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {user.photos?.map((photo, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            className="aspect-square rounded-xl overflow-hidden shadow-lg cursor-pointer relative group"
                        >
                            <img
                                src={photo}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
                                {currentUser && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeletePhoto(photo);
                                        }}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                        title="Delete photo"
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {(!user.photos || user.photos.length === 0) && (
                        <div className="col-span-full py-8 text-center text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            No photos yet. Add some to show off your vibe!
                        </div>
                    )}
                </div>
            </motion.div>


            {/* Edit Modal */}
            {
                isEditing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative"
                        >
                            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                                        value={editForm.name}
                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Location</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                                        value={editForm.location}
                                        onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                                    <textarea
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                                        rows="3"
                                        value={editForm.bio}
                                        onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Interests <span className="text-xs text-gray-500">(Max 5 selected: {editForm.interests.length}/5)</span>
                                    </label>

                                    {isLoadingCommunities ? (
                                        <div className="text-gray-500 text-sm">Loading interests...</div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {allCommunities.map(community => {
                                                const isSelected = editForm.interests.includes(community.name);
                                                return (
                                                    <button
                                                        key={community.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (!isSelected && editForm.interests.length >= 5) {
                                                                alert("You can select up to 5 interests only.");
                                                                return;
                                                            }
                                                            const newInterests = isSelected
                                                                ? editForm.interests.filter(i => i !== community.name)
                                                                : [...editForm.interests, community.name];
                                                            setEditForm({ ...editForm, interests: newInterests });
                                                        }}
                                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${isSelected
                                                            ? 'bg-primary-500 text-white border-primary-500'
                                                            : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                                                            }`}
                                                    >
                                                        {community.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">Select topics you are interested in.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Social Handles</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {['instagram', 'snapchat', 'discord'].map(platform => (
                                            <div key={platform} className="flex items-center space-x-2">
                                                <span className="capitalize w-20 text-sm text-gray-500">{platform}</span>
                                                <input
                                                    type="text"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border p-2"
                                                    placeholder="Username"
                                                    value={editForm.socials[platform] || ''}
                                                    onChange={e => setEditForm({
                                                        ...editForm,
                                                        socials: { ...editForm.socials, [platform]: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
            }
        </div >
    );
};

export default Profile;
