import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxLength: 50 },
    description: { type: String, required: true, trim: true, maxLength: 200 },
    owner: {type: mongoose.Schema.Types.ObjectId, required: true, ref:"User"},
    fileUrl: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now},
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, required: true, default: 0},
    },
});

videoSchema.static("formatHashtags", function(hashtags) {
    return hashtags
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`))
})

const Video = mongoose.model("Video", videoSchema);

export default Video;
