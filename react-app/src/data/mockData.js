// Mock data for Cupid
export const mockUsers = [
    {
        id: 1,
        name: "Sarah Johnson",
        age: 23,
        location: "New York, USA",
        distance: 2,
        bio: "Love exploring new cafes and art galleries! Always up for a spontaneous adventure 🎨✨",
        interests: ["Art", "Photography", "Coffee", "Travel"],
        verified: true,
        online: true,
        image: "https://i.pravatar.cc/400?img=5"
    },
    {
        id: 2,
        name: "Mike Chen",
        age: 25,
        location: "Los Angeles, USA",
        distance: 5,
        bio: "Gamer and tech enthusiast. Looking for friends to play Valorant and grab boba 🎮",
        interests: ["Gaming", "Technology", "Anime", "Music"],
        verified: true,
        online: false,
        image: "https://i.pravatar.cc/400?img=12"
    },
    {
        id: 3,
        name: "Emma Davis",
        age: 21,
        location: "Chicago, USA",
        distance: 3,
        bio: "Fitness junkie and foodie. Let's hit the gym then get tacos! 💪🌮",
        interests: ["Fitness", "Food", "Yoga", "Travel"],
        verified: true,
        online: true,
        image: "https://i.pravatar.cc/400?img=9"
    },
    {
        id: 4,
        name: "Alex Martinez",
        age: 24,
        location: "Miami, USA",
        distance: 4,
        bio: "Music producer and beach lover. Always vibing to good tunes 🎵🌊",
        interests: ["Music", "Beach", "DJing", "Photography"],
        verified: false,
        online: true,
        image: "https://i.pravatar.cc/400?img=13"
    },
    {
        id: 5,
        name: "Jessica Lee",
        age: 22,
        location: "Seattle, USA",
        distance: 1,
        bio: "Bookworm and coffee addict. Let's discuss our favorite reads! 📚☕",
        interests: ["Reading", "Writing", "Coffee", "Movies"],
        verified: true,
        online: false,
        image: "https://i.pravatar.cc/400?img=10"
    },
    {
        id: 6,
        name: "Ryan Taylor",
        age: 26,
        location: "Austin, USA",
        distance: 6,
        bio: "Outdoor enthusiast and photographer. Weekend hikes anyone? 🏞️📷",
        interests: ["Hiking", "Photography", "Nature", "Camping"],
        verified: true,
        online: true,
        image: "https://i.pravatar.cc/400?img=14"
    },
    {
        id: 7,
        name: "Sophia Brown",
        age: 20,
        location: "Boston, USA",
        distance: 2,
        bio: "Art student and plant mom. Love painting and caring for my green babies 🌿🎨",
        interests: ["Art", "Plants", "Painting", "Design"],
        verified: true,
        online: true,
        image: "https://i.pravatar.cc/400?img=16"
    },
    {
        id: 8,
        name: "David Kim",
        age: 27,
        location: "San Francisco, USA",
        distance: 3,
        bio: "Software engineer by day, chef by night. Let's cook something amazing! 👨‍💻👨‍🍳",
        interests: ["Cooking", "Technology", "Food", "Travel"],
        verified: false,
        online: false,
        image: "https://i.pravatar.cc/400?img=15"
    }
];

export const mockCommunities = [
    {
        id: 1,
        name: "Gaming Squad",
        icon: "🎮",
        members: 12547,
        description: "Connect with fellow gamers! Share tips, find teammates, and discuss the latest games.",
        cover: "https://picsum.photos/400/200?random=10",
        joined: false
    },
    {
        id: 2,
        name: "Music Lovers",
        icon: "🎵",
        members: 8923,
        description: "For those who live and breathe music. Share playlists, concert experiences, and more!",
        cover: "https://picsum.photos/400/200?random=11",
        joined: true
    },
    {
        id: 3,
        name: "Fitness Buddies",
        icon: "💪",
        members: 15632,
        description: "Get motivated! Share workout routines, fitness goals, and find gym partners.",
        cover: "https://picsum.photos/400/200?random=12",
        joined: false
    },
    {
        id: 4,
        name: "Art & Design",
        icon: "🎨",
        members: 6754,
        description: "Creative minds unite! Share your artwork, get feedback, and collaborate.",
        cover: "https://picsum.photos/400/200?random=13",
        joined: true
    },
    {
        id: 5,
        name: "Travel Enthusiasts",
        icon: "✈️",
        members: 11234,
        description: "Share travel stories, tips, and find travel buddies for your next adventure!",
        cover: "https://picsum.photos/400/200?random=14",
        joined: false
    },
    {
        id: 6,
        name: "Foodies",
        icon: "🍕",
        members: 9876,
        description: "Love food? Share recipes, restaurant recommendations, and food photos!",
        cover: "https://picsum.photos/400/200?random=15",
        joined: true
    },
    {
        id: 7,
        name: "Book Club",
        icon: "📚",
        members: 5432,
        description: "Discuss your favorite books, get recommendations, and join virtual reading sessions.",
        cover: "https://picsum.photos/400/200?random=16",
        joined: false
    },
    {
        id: 8,
        name: "Photography",
        icon: "📷",
        members: 7654,
        description: "Capture moments! Share your photos, learn techniques, and find photo walk partners.",
        cover: "https://picsum.photos/400/200?random=17",
        joined: false
    },
    {
        id: 9,
        name: "Movie Buffs",
        icon: "🎬",
        members: 8345,
        description: "Cinema lovers! Discuss movies, share reviews, and organize movie nights.",
        cover: "https://picsum.photos/400/200?random=18",
        joined: true
    }
];

export const mockHMUPosts = [
    {
        id: 1,
        userId: 1,
        userName: "Sarah Johnson",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        activity: "Coffee ☕",
        text: "Anyone want to check out the new coffee shop downtown? I've heard amazing things!",
        time: "2 min ago",
        responses: 5
    },
    {
        id: 2,
        userId: 3,
        userName: "Emma Davis",
        userAvatar: "https://i.pravatar.cc/150?img=9",
        activity: "Workout 💪",
        text: "Gym session at 6 PM today. Need a workout buddy to keep me motivated!",
        time: "15 min ago",
        responses: 3
    },
    {
        id: 3,
        userId: 4,
        userName: "Alex Martinez",
        userAvatar: "https://i.pravatar.cc/150?img=13",
        activity: "Music 🎵",
        text: "Going to the live music event tonight. Who's in?",
        time: "1 hour ago",
        responses: 8
    },
    {
        id: 4,
        userId: 6,
        userName: "Ryan Taylor",
        userAvatar: "https://i.pravatar.cc/150?img=14",
        activity: "Hiking 🥾",
        text: "Planning a sunrise hike this Sunday. Looking for early birds to join!",
        time: "2 hours ago",
        responses: 12
    },
    {
        id: 5,
        userId: 2,
        userName: "Mike Chen",
        userAvatar: "https://i.pravatar.cc/150?img=12",
        activity: "Gaming 🎮",
        text: "Need 2 more for Valorant ranked. Diamond+ only please!",
        time: "3 hours ago",
        responses: 4
    }
];

export const mockConversations = [
    {
        id: 1,
        userId: 1,
        userName: "Sarah Johnson",
        userAvatar: "https://i.pravatar.cc/150?img=5",
        lastMessage: "That sounds great! See you there 😊",
        time: "2m",
        unread: 2,
        online: true
    },
    {
        id: 2,
        userId: 3,
        userName: "Emma Davis",
        userAvatar: "https://i.pravatar.cc/150?img=9",
        lastMessage: "Thanks for the workout tips!",
        time: "1h",
        unread: 0,
        online: true
    },
    {
        id: 3,
        userId: 4,
        userName: "Alex Martinez",
        userAvatar: "https://i.pravatar.cc/150?img=13",
        lastMessage: "Check out this track I made",
        time: "3h",
        unread: 1,
        online: true
    },
    {
        id: 4,
        userId: 5,
        userName: "Jessica Lee",
        userAvatar: "https://i.pravatar.cc/150?img=10",
        lastMessage: "I just finished that book you recommended!",
        time: "1d",
        unread: 0,
        online: false
    },
    {
        id: 5,
        userId: 6,
        userName: "Ryan Taylor",
        userAvatar: "https://i.pravatar.cc/150?img=14",
        lastMessage: "The photos from our hike are amazing!",
        time: "2d",
        unread: 0,
        online: true
    }
];

export const mockMessages = {
    1: [
        {
            id: 1,
            senderId: 1,
            type: "received",
            text: "Hey! How are you doing?",
            time: "10:30 AM",
            avatar: "https://i.pravatar.cc/150?img=5"
        },
        {
            id: 2,
            senderId: "me",
            type: "sent",
            text: "Hi Sarah! I'm doing great, thanks! How about you?",
            time: "10:32 AM",
            avatar: "https://i.pravatar.cc/150?img=33"
        },
        {
            id: 3,
            senderId: 1,
            type: "received",
            text: "I'm good! Want to grab coffee this weekend?",
            time: "10:35 AM",
            avatar: "https://i.pravatar.cc/150?img=5"
        },
        {
            id: 4,
            senderId: "me",
            type: "sent",
            text: "That sounds perfect! How about Saturday at 2 PM?",
            time: "10:36 AM",
            avatar: "https://i.pravatar.cc/150?img=33"
        },
        {
            id: 5,
            senderId: 1,
            type: "received",
            text: "That sounds great! See you there 😊",
            time: "10:38 AM",
            avatar: "https://i.pravatar.cc/150?img=5"
        }
    ],
    3: [
        {
            id: 1,
            senderId: 3,
            type: "received",
            text: "Thanks for joining me at the gym today!",
            time: "6:45 PM",
            avatar: "https://i.pravatar.cc/150?img=9"
        },
        {
            id: 2,
            senderId: "me",
            type: "sent",
            text: "No problem! It was a great workout 💪",
            time: "6:50 PM",
            avatar: "https://i.pravatar.cc/150?img=33"
        },
        {
            id: 3,
            senderId: 3,
            type: "received",
            text: "Thanks for the workout tips!",
            time: "7:15 PM",
            avatar: "https://i.pravatar.cc/150?img=9"
        }
    ]
};
