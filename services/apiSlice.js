import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BACKEND_URL } from "./../config/config";
import { storage } from "../features/authSlice";

const API_BASE_URL = `${BACKEND_URL}/api`;
console.log("RTK Query API baseUrl:", API_BASE_URL);

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: async (headers, { getState, body }) => {
      let token = getState()?.auth?.token;

      if (!token) {
        token = await storage.getItem("token");
        if (token) {
          // console.log(
          //   "Fetched token from storage:",
          //   token.slice(0, 20) + "...",
          // );
        } else {
          console.log("No auth token found for request.");
        }
      } else {
        console.log(
          "Fetched token from Redux state:",
          token.slice(0, 20) + "...",
        );
      }

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        // console.log("Authorization header set for request.");
      }

      if (!(body instanceof FormData)) {
        headers.set("Content-Type", "application/json");
      }

      return headers;
    },
  }),
  tagTypes: [
    "User",
    "Feed",
    "Matches",
    "Messages",
    "Conversation",
    "like",
    "LikesReceived","Profile","SwipeFeed",
  ],
  endpoints: (builder) => ({
    // ================= AUTH ENDPOINTS =================
    sendOTP: builder.mutation({
      query: (data) => ({
        url: "/auth/send-otp",
        method: "POST",
        body: data,
      }),
    }),

    verifyOTP: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    sendEmailOTP: builder.mutation({
      query: (data) => ({
        url: "/auth/send-email-otp",
        method: "POST",
        body: data,
      }),
    }),

    verifyEmailOTP: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-email-otp",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    // ================= USER PROFILE ENDPOINTS =================

    userfullname: builder.mutation({
      query: (data) => ({
        url: "/users/fullname",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    DateOfBirth: builder.mutation({
      query: (data) => ({
        url: "/users/dob",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateGender: builder.mutation({
      query: (data) => ({
        url: "/users/gender",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    updateWhoInterested: builder.mutation({
      query: (data) => ({
        url: "/users/interested-in",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateDistancePreference: builder.mutation({
      query: (data) => ({
        url: "/users/distance-preference",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateRelationshipGoal: builder.mutation({
      query: (data) => ({
        url: "/users/relationship-goal",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateCollege: builder.mutation({
      query: (data) => ({
        url: "/users/college",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateLifestyle: builder.mutation({
      query: (data) => ({
        url: "/users/lifestyle",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateInterests: builder.mutation({
      query: (data) => ({
        url: "/users/interests",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateVibePreferences: builder.mutation({
      query: (data) => ({
        url: "/users/vibe-preferences",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateEssentialsAndCommunicationStyle: builder.mutation({
      query: (data) => ({
        url: "/users/essentials-communication-style",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updatePersonalityReceivedLOVE: builder.mutation({
      query: (data) => ({
        url: "/users/personality-received-love",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateCreativityInterests: builder.mutation({
      query: (data) => ({
        url: "/users/creativity-interests",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    uploadUserPhotos: builder.mutation({
      query: (formData) => ({
        url: "/users/user-photos",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    updateBio: builder.mutation({
      query: (data) => ({
        url: "/users/bio",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateLocation: builder.mutation({
      query: (data) => ({
        url: "/users/location",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    completeAvoidSomeone: builder.mutation({
      query: (data) => ({
        url: "/users/avoid-someone",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    completeOnboarding: builder.mutation({
      query: (data) => ({
        url: "/users/complete-onboarding",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    verifyFaceStatus: builder.mutation({
      query: (formData) => ({
        url: "/users/verify-face-status",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),
    // ================= SWIPE & MATCH ENDPOINTS =================
    getSwipeFeed: builder.query({
      query: () => "/swipe/feed",
      providesTags: ["Feed"],
    }),

    handleSwipeAction: builder.mutation({
      query: ({ targetUserId, action }) => {
        // Agar dislike hai toh /dislike, nahi toh /like-superlike
        if (action === "DISLIKE") {
          return {
            url: "/like/dislike",
            method: "POST",
            body: { receiverId: targetUserId },
          };
        }
        return {
          url: "/like/like-superlike",
          method: "POST",
          body: { receiverId: targetUserId, type: action }, // "LIKE" ya "SUPERLIKE"
        };
      },
      invalidatesTags: ["SwipeFeed", "Matches", "Conversation"],
    }),
    rewindSwipeAction: builder.mutation({
      query: () => ({
        url: "/like/rewind",
        method: "POST",
      }),
      invalidatesTags: ["SwipeFeed"],
    }),
    // ================= USER PROFILE ENDPOINTS =================
    getMyProfile: builder.query({
      query: () => "/users/me",
      providesTags: ["Profile"],
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/users/profile",
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["User", "Profile"],
    }),
    deleteAccount: builder.mutation({
      query: () => ({
        url: "/users/delete",
        method: "DELETE",
      }),
      invalidatesTags: ["User", "Profile"],
    }),

    uploadPhotos: builder.mutation({
      query: (formData) => ({
        url: "/users/upload-photos",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User"],
    }),

    // ================= MATCH & SWIPE ENDPOINTS =================
    sendLikeOrSuperlike: builder.mutation({
      query: ({ receiverId, type }) => ({
        url: "/like/like-superlike",
        method: "POST",
        body: { receiverId, type },
      }),
      invalidatesTags: [
        "LikesReceived",
        "Matches",
        "Conversation",
        "SwipeFeed",
      ],
    }),
    getLikesReceived: builder.query({
      query: () => "/like/received",
      providesTags: ["LikesReceived"],
    }),
    getMutualMatches: builder.query({
      query: () => "/like/matches",
      providesTags: ["Matches"],
    }),

    // ================= CHAT ENDPOINTS =================
    getOrCreateConversation: builder.query({
      query: (targetUserId) => `/chat/conversation/${targetUserId}`,
      providesTags: (result, error, targetUserId) => [
        { type: "Conversation", id: targetUserId },
      ],
    }),
    getMessages: builder.query({
      query: (conversationId) => `/chat/messages/${conversationId}`,
      providesTags: (result, error, conversationId) => [
        { type: "Messages", id: conversationId },
      ],
    }),
    sendMessage: builder.mutation({
      query: (messageData) => ({
        url: "/chat/send",
        method: "POST",
        body: messageData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Messages", id: arg.conversationId },
        "Conversation",
        { type: "Conversation", id: arg.receiverId },
      ],
    }),
    sendMediaMessage: builder.mutation({
      query: (formData) => ({
        url: "/chat/send-media",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Messages", id: arg.get("conversationId") },
        "Conversation",
        { type: "Conversation", id: arg.get("receiverId") },
      ],
    }),
    getUserConversations: builder.query({
      query: () => "/chat/conversations",
      providesTags: (result) =>
        result?.conversations
          ? [
              ...result.conversations.map(({ _id }) => ({
                type: "Conversation",
                id: _id,
              })),
              "Conversation",
            ]
          : ["Conversation"],
    }),
  }),
});

export const {
  useSendOTPMutation,
  useVerifyOTPMutation,
  useSendEmailOTPMutation,
  useVerifyEmailOTPMutation,
  useUserfullnameMutation,
  useDateOfBirthMutation,
  useUpdateGenderMutation,
  useUpdateWhoInterestedMutation,
  useUpdateDistancePreferenceMutation,
  useUpdateRelationshipGoalMutation,
  useUpdateCollegeMutation,
  useUpdateLifestyleMutation,
  useUpdateInterestsMutation,
  useUpdateVibePreferencesMutation,
  useUpdateEssentialsAndCommunicationStyleMutation,
  useUpdatePersonalityReceivedLOVEMutation,
  useUpdateCreativityInterestsMutation,
  useUploadUserPhotosMutation,
  useUpdateBioMutation,
  useUpdateLocationMutation,
  useCompleteAvoidSomeoneMutation,
  useCompleteOnboardingMutation,
  useVerifyFaceStatusMutation,
  useGetSwipeFeedQuery,

  useHandleSwipeActionMutation,
  useRewindSwipeActionMutation,

  useGetMyProfileQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useUploadPhotosMutation,
  useGetFeedProfilesQuery,

  useGetLikesReceivedQuery,
  useSendLikeOrSuperlikeMutation,
  useGetMutualMatchesQuery,

  useGetOrCreateConversationQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useSendMediaMessageMutation,
  useGetUserConversationsQuery,
} = apiSlice;
